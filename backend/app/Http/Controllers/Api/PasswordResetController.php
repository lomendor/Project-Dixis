<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ResetPasswordMail;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

/**
 * Pass EMAIL-AUTH-01: Password Reset via Resend
 *
 * Implements Laravel-standard password reset flow:
 * - POST /forgot: accepts email, always returns 200 (no user enumeration)
 * - POST /reset: validates token + email + new password
 */
class PasswordResetController extends Controller
{
    /**
     * Request password reset link.
     *
     * Always returns 200 to prevent user enumeration attacks.
     */
    public function forgot(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        if ($user) {
            // Generate token
            $token = Str::random(64);

            // Delete existing tokens for this email
            DB::table('password_reset_tokens')
                ->where('email', $request->email)
                ->delete();

            // Store new token
            DB::table('password_reset_tokens')->insert([
                'email' => $request->email,
                'token' => Hash::make($token),
                'created_at' => now(),
            ]);

            // Send email (only if email notifications are enabled)
            if (config('notifications.email_enabled', false)) {
                $resetUrl = config('app.frontend_url', 'https://dixis.gr')
                    . '/reset-password?token=' . $token . '&email=' . urlencode($request->email);

                Mail::to($user->email)->send(new ResetPasswordMail($user, $resetUrl));
            }
        }

        // Always return success to prevent user enumeration
        return response()->json([
            'message' => 'If an account exists with this email, you will receive a password reset link.',
        ]);
    }

    /**
     * Reset password using token.
     */
    public function reset(Request $request): JsonResponse
    {
        $request->validate([
            'token' => 'required|string',
            'email' => 'required|email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Find token record
        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$record) {
            return response()->json([
                'message' => 'Invalid or expired reset token.',
            ], 422);
        }

        // Verify token
        if (!Hash::check($request->token, $record->token)) {
            return response()->json([
                'message' => 'Invalid or expired reset token.',
            ], 422);
        }

        // Check token expiry (1 hour)
        $createdAt = \Carbon\Carbon::parse($record->created_at);
        if ($createdAt->addMinutes(60)->isPast()) {
            // Clean up expired token
            DB::table('password_reset_tokens')
                ->where('email', $request->email)
                ->delete();

            return response()->json([
                'message' => 'Reset token has expired. Please request a new one.',
            ], 422);
        }

        // Find user
        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json([
                'message' => 'Invalid or expired reset token.',
            ], 422);
        }

        // Update password
        $user->password = Hash::make($request->password);
        $user->save();

        // Delete used token
        DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->delete();

        // Revoke all existing tokens (force re-login on all devices)
        $user->tokens()->delete();

        return response()->json([
            'message' => 'Password has been reset successfully. Please log in with your new password.',
        ]);
    }
}
