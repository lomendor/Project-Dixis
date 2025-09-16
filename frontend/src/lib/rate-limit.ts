import { NextRequest } from 'next/server';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string; // Custom error message
}

interface RateLimitStore {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (production should use Redis)
const store = new Map<string, RateLimitStore>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of store.entries()) {
    if (now > value.resetTime) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

function getClientKey(request: NextRequest): string {
  // Get IP address from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';

  // Include user ID if authenticated for per-user limits
  const authHeader = request.headers.get('authorization');
  const userId = authHeader ? `user-${authHeader.split(' ')[1]?.substring(0, 8)}` : 'anon';

  return `${ip}-${userId}`;
}

export function createRateLimit(options: RateLimitOptions) {
  return async function rateLimit(request: NextRequest): Promise<{
    success: boolean;
    remaining: number;
    resetTime: number;
    error?: string;
  }> {
    const key = getClientKey(request);
    const now = Date.now();
    const windowStart = now - options.windowMs;

    let entry = store.get(key);

    // Create new entry or reset if window expired
    if (!entry || entry.resetTime <= now) {
      entry = {
        count: 0,
        resetTime: now + options.windowMs
      };
      store.set(key, entry);
    }

    // Increment request count
    entry.count++;

    // Check if limit exceeded
    if (entry.count > options.maxRequests) {
      return {
        success: false,
        remaining: 0,
        resetTime: entry.resetTime,
        error: options.message || 'Too many requests. Please try again later.'
      };
    }

    return {
      success: true,
      remaining: Math.max(0, options.maxRequests - entry.count),
      resetTime: entry.resetTime
    };
  };
}

// Predefined rate limiters for different endpoints
export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes
  message: 'Υπερβολικές προσπάθειες σύνδεσης. Δοκιμάστε ξανά σε 15 λεπτά.'
});

export const orderRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 order requests per minute
  message: 'Υπερβολικά αιτήματα παραγγελιών. Περιμένετε λίγο πριν δοκιμάσετε ξανά.'
});

export const checkoutRateLimit = createRateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 3, // 3 checkout attempts per 5 minutes
  message: 'Υπερβολικές προσπάθειες αγοράς. Δοκιμάστε ξανά σε 5 λεπτά.'
});

export const generalApiRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
  message: 'Υπερβολικά αιτήματα. Δοκιμάστε ξανά σε λίγο.'
});

// Middleware factory for easy rate limit application
export function withRateLimit(rateLimit: ReturnType<typeof createRateLimit>) {
  return async function middleware(request: NextRequest) {
    const result = await rateLimit(request);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: result.error,
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': rateLimit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetTime.toString(),
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }

    return null; // Continue to next handler
  };
}