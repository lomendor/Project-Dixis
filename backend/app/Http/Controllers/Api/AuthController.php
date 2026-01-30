<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\VerifyEmailMail;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|string|in:consumer,producer,admin',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Pass EMAIL-VERIFY-01: Respect email verification config
        // Auto-verify only if verification is disabled (backwards compatibility)
        $requireVerification = config('notifications.email_verification_required', false);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'email_verified_at' => $requireVerification ? null : now(),
        ]);

        // Send verification email if required
        $verificationSent = false;
        if ($requireVerification && config('notifications.email_enabled', false)) {
            $token = Str::random(64);

            DB::table('email_verification_tokens')->insert([
                'email' => $user->email,
                'token' => Hash::make($token),
                'created_at' => now(),
            ]);

            $verifyUrl = config('app.frontend_url', 'https://dixis.gr')
                . '/auth/verify-email?token=' . $token . '&email=' . urlencode($user->email);

            Mail::to($user->email)->send(new VerifyEmailMail($user, $verifyUrl));
            $verificationSent = true;
        }

        // Create auth token
        $authToken = $user->createToken('auth-token')->plainTextToken;

        $message = $verificationSent
            ? 'User registered successfully. Please check your email to verify your account.'
            : 'User registered successfully';

        return response()->json([
            'message' => $message,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ],
            'token' => $authToken,
            'token_type' => 'Bearer',
            'verification_sent' => $verificationSent,
        ], 201);
    }

    /**
     * Login user and create token
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials',
                'error' => 'The provided credentials are incorrect.',
            ], 401);
        }

        // Block seed/test accounts from login (data hygiene)
        if ($user->is_seed) {
            return response()->json([
                'message' => 'Account disabled',
                'error' => 'This is a seed/test account and cannot be used for login.',
            ], 403);
        }

        // Revoke existing tokens (optional - for single device login)
        // $user->tokens()->delete();

        // Create new token
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ],
            'token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * Logout user and revoke token
     */
    public function logout(Request $request): JsonResponse
    {
        // Revoke current token
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * Logout from all devices (revoke all tokens)
     */
    public function logoutAll(Request $request): JsonResponse
    {
        // Revoke all tokens for this user
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Logged out from all devices successfully',
        ]);
    }

    /**
     * Get authenticated user profile
     */
    public function profile(Request $request): JsonResponse
    {
        $user = $request->user();

        // Pass PRODUCER-THRESHOLD-POSTALCODE-01: Include default shipping address
        $defaultAddress = $user->addresses()
            ->where('type', 'shipping')
            ->orWhere('type', 'default')
            ->first();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ],
            // Pass PRODUCER-THRESHOLD-POSTALCODE-01: Default shipping address for checkout
            'shipping_address' => $defaultAddress ? [
                'name' => $defaultAddress->name,
                'line1' => $defaultAddress->line1,
                'line2' => $defaultAddress->line2,
                'city' => $defaultAddress->city,
                'postal_code' => $defaultAddress->postal_code,
                'country' => $defaultAddress->country,
                'phone' => $defaultAddress->phone,
            ] : null,
        ]);
    }

    /**
     * Pass PRODUCER-THRESHOLD-POSTALCODE-01: Get user's default shipping address
     * Used for checkout postal code pre-fill
     */
    public function shippingAddress(Request $request): JsonResponse
    {
        $user = $request->user();

        // Try to get shipping address, fallback to most recent order's address
        $address = $user->addresses()
            ->where('type', 'shipping')
            ->orWhere('type', 'default')
            ->first();

        if (!$address) {
            // Fallback: Get address from most recent order
            $lastOrder = $user->orders()
                ->whereNotNull('shipping_address')
                ->orderBy('created_at', 'desc')
                ->first();

            if ($lastOrder && $lastOrder->shipping_address) {
                $shippingAddress = is_array($lastOrder->shipping_address)
                    ? $lastOrder->shipping_address
                    : json_decode($lastOrder->shipping_address, true);

                return response()->json([
                    'address' => [
                        'name' => $shippingAddress['name'] ?? $user->name,
                        'line1' => $shippingAddress['line1'] ?? '',
                        'city' => $shippingAddress['city'] ?? '',
                        'postal_code' => $shippingAddress['postal_code'] ?? '',
                        'country' => $shippingAddress['country'] ?? 'GR',
                        'phone' => $shippingAddress['phone'] ?? '',
                    ],
                    'source' => 'last_order',
                ]);
            }

            return response()->json([
                'address' => null,
                'source' => null,
            ]);
        }

        return response()->json([
            'address' => [
                'name' => $address->name,
                'line1' => $address->line1,
                'line2' => $address->line2,
                'city' => $address->city,
                'postal_code' => $address->postal_code,
                'country' => $address->country,
                'phone' => $address->phone,
            ],
            'source' => 'saved_address',
        ]);
    }
}
