import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const RATE_LIMITS = {
  generate: { limit: 5, window: 60 }, // 5 requests per minute
  payment: { limit: 10, window: 3600 }, // 10 requests per hour
  auth: { limit: 5, window: 900 }, // 5 requests per 15 minutes
  settings: { limit: 10, window: 60 }, // 10 requests per minute
} as const;

type RateLimitOperation = keyof typeof RATE_LIMITS;

export async function checkRateLimit(
  userIdentifier: string,
  operation: RateLimitOperation
): Promise<true | NextResponse> {
  const { limit, window } = RATE_LIMITS[operation];
  const key = `ratelimit:${operation}:${userIdentifier}`;
  const now = Math.floor(Date.now() / 1000);

  try {
    // Get the current count and last reset time
    const [count, resetTime] = await Promise.all([
      kv.get(key),
      kv.get(`${key}:reset`),
    ]);

    // If no reset time or it's expired, start a new window
    if (!resetTime || (resetTime as number) < now) {
      await Promise.all([
        kv.set(key, 1),
        kv.set(`${key}:reset`, now + window),
        kv.expire(key, window),
        kv.expire(`${key}:reset`, window),
      ]);
      return true;
    }

    // If within window and under limit, increment
    if ((count as number) < limit) {
      await kv.incr(key);
      return true;
    }

    // Rate limit exceeded
    const timeRemaining = (resetTime as number) - now;
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        retryAfter: timeRemaining,
      },
      {
        status: 429,
        headers: {
          'Retry-After': timeRemaining.toString(),
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': (resetTime as number).toString(),
        },
      }
    );
  } catch (error) {
    // If rate limiting fails, allow the request but log the error
    console.error('Rate limiting error:', error);
    return true;
  }
} 