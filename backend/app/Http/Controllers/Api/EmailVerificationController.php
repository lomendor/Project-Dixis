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
use Illuminate\Support\Str;

/**
 * Pass EMAIL-VERIFY-01: Email Verification Flow
 *
 * Implements email verification:
 * - POST /verify: validates token, marks email_verified_at
 * - POST /resend: sends new verification email (rate-limited, no enumeration)
 */
class EmailVerificationController extends Controller
{
    /**
     * Verify email using token.
     */
    public function verify(Request $request): JsonResponse
    {
        $request->validate([
            'token' => 'required|string',
            'email' => 'required|email',
        ]);

        // Find token record
        $record = DB::table('email_verification_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$record) {
            return response()->json([
                'message' => 'Invalid or expired verification token.',
            ], 422);
        }

        // Verify token hash
        if (!Hash::check($request->token, $record->token)) {
            return response()->json([
                'message' => 'Invalid or expired verification token.',
            ], 422);
        }

        // Check token expiry (24 hours)
        $createdAt = \Carbon\Carbon::parse($record->created_at);
        if ($createdAt->addHours(24)->isPast()) {
            // Clean up expired token
            DB::table('email_verification_tokens')
                ->where('email', $request->email)
                ->delete();

            return response()->json([
                'message' => 'Verification token has expired. Please request a new one.',
            ], 422);
        }

        // Find user
        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json([
                'message' => 'Invalid or expired verification token.',
            ], 422);
        }

        // Check if already verified
        if ($user->email_verified_at) {
            // Clean up token
            DB::table('email_verification_tokens')
                ->where('email', $request->email)
                ->delete();

            return response()->json([
                'message' => 'Email is already verified.',
            ]);
        }

        // Mark email as verified
        $user->email_verified_at = now();
        $user->save();

        // Delete used token (single-use)
        DB::table('email_verification_tokens')
            ->where('email', $request->email)
            ->delete();

        return response()->json([
            'message' => 'Email verified successfully. You can now log in.',
        ]);
    }

    /**
     * Resend verification email.
     *
     * Always returns 200 to prevent user enumeration.
     */
    public function resend(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        if ($user && !$user->email_verified_at) {
            // Generate token
            $token = Str::random(64);

            // Delete existing tokens for this email
            DB::table('email_verification_tokens')
                ->where('email', $request->email)
                ->delete();

            // Store new hashed token
            DB::table('email_verification_tokens')->insert([
                'email' => $request->email,
                'token' => Hash::make($token),
                'created_at' => now(),
            ]);

            // Send email (only if email notifications are enabled)
            if (config('notifications.email_enabled', false)) {
                $verifyUrl = config('app.frontend_url', 'https://dixis.gr')
                    . '/auth/verify-email?token=' . $token . '&email=' . urlencode($request->email);

                Mail::to($user->email)->send(new VerifyEmailMail($user, $verifyUrl));
            }
        }

        // Always return success to prevent user enumeration
        return response()->json([
            'message' => 'If an account exists with this email and is not yet verified, you will receive a verification link.',
        ]);
    }
}
