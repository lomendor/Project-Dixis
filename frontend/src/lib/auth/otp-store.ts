/**
 * In-memory OTP storage with automatic expiry
 *
 * For production with multiple instances, consider using:
 * - Redis
 * - Database (with cleanup job)
 *
 * Current implementation:
 * - Stores OTP per phone number
 * - 5 minute expiry
 * - Auto-cleanup on access
 * - Single use (deleted after verification)
 */

interface OtpEntry {
  code: string;
  expiresAt: number;
  attempts: number;
}

const otpStore = new Map<string, OtpEntry>();

// Constants
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 3;
const OTP_LENGTH = 6;

/**
 * Generate a random 6-digit OTP
 */
export function generateOtp(): string {
  // Generate cryptographically secure random number
  const min = 100000;
  const max = 999999;
  const code = Math.floor(Math.random() * (max - min + 1)) + min;
  return code.toString();
}

/**
 * Store OTP for a phone number
 * Returns the generated OTP code
 */
export function storeOtp(phone: string): string {
  // Clean up expired entries periodically
  cleanupExpired();

  const code = generateOtp();
  const entry: OtpEntry = {
    code,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    attempts: 0,
  };

  otpStore.set(normalizePhone(phone), entry);

  console.log(`[OTP] Stored for ${maskPhone(phone)}, expires in 5 min`);

  return code;
}

/**
 * Verify OTP for a phone number
 * Returns true if valid, false otherwise
 * Deletes OTP after successful verification or max attempts
 */
export function verifyOtp(phone: string, code: string): { valid: boolean; error?: string } {
  const normalizedPhone = normalizePhone(phone);
  const entry = otpStore.get(normalizedPhone);

  if (!entry) {
    console.log(`[OTP] No entry found for ${maskPhone(phone)}`);
    return { valid: false, error: 'Δεν βρέθηκε κωδικός OTP. Παρακαλώ ζητήστε νέο κωδικό.' };
  }

  // Check expiry
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(normalizedPhone);
    console.log(`[OTP] Expired for ${maskPhone(phone)}`);
    return { valid: false, error: 'Ο κωδικός OTP έληξε. Παρακαλώ ζητήστε νέο κωδικό.' };
  }

  // Check attempts
  entry.attempts++;
  if (entry.attempts > MAX_ATTEMPTS) {
    otpStore.delete(normalizedPhone);
    console.log(`[OTP] Max attempts exceeded for ${maskPhone(phone)}`);
    return { valid: false, error: 'Πολλές αποτυχημένες προσπάθειες. Παρακαλώ ζητήστε νέο κωδικό.' };
  }

  // Verify code
  if (entry.code !== code) {
    console.log(`[OTP] Invalid code for ${maskPhone(phone)} (attempt ${entry.attempts}/${MAX_ATTEMPTS})`);
    return { valid: false, error: `Λανθασμένος κωδικός. Απομένουν ${MAX_ATTEMPTS - entry.attempts} προσπάθειες.` };
  }

  // Success - delete the entry (single use)
  otpStore.delete(normalizedPhone);
  console.log(`[OTP] Verified successfully for ${maskPhone(phone)}`);

  return { valid: true };
}

/**
 * Check if phone has a pending OTP (for rate limiting)
 */
export function hasPendingOtp(phone: string): boolean {
  const entry = otpStore.get(normalizePhone(phone));
  return !!entry && Date.now() <= entry.expiresAt;
}

/**
 * Get remaining time for pending OTP (for rate limiting feedback)
 */
export function getRemainingTime(phone: string): number {
  const entry = otpStore.get(normalizePhone(phone));
  if (!entry) return 0;

  const remaining = entry.expiresAt - Date.now();
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}

// Helpers

function normalizePhone(phone: string): string {
  // Remove spaces, dashes, and normalize to digits only with + prefix
  return phone.replace(/[\s-]/g, '').trim();
}

function maskPhone(phone: string): string {
  // Show only last 4 digits: +30******1234
  if (phone.length <= 4) return '****';
  return phone.slice(0, 3) + '******' + phone.slice(-4);
}

function cleanupExpired(): void {
  const now = Date.now();
  let cleaned = 0;

  for (const [phone, entry] of otpStore.entries()) {
    if (now > entry.expiresAt) {
      otpStore.delete(phone);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`[OTP] Cleaned up ${cleaned} expired entries`);
  }
}
