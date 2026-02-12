/**
 * In-memory sliding-window rate limiter.
 *
 * NOTE: state lives per serverless instance — provides basic protection
 * but is NOT shared across Vercel function cold starts.
 * Upgrade to @upstash/ratelimit + Redis for distributed enforcement.
 */

const store = new Map<string, number[]>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; remaining: number; retryAfterSec: number } {
  const now = Date.now();
  const timestamps = (store.get(key) || []).filter(t => now - t < windowMs);

  if (timestamps.length >= limit) {
    store.set(key, timestamps);
    const retryAfterSec = Math.ceil((timestamps[0] + windowMs - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSec };
  }

  timestamps.push(now);
  store.set(key, timestamps);
  return { allowed: true, remaining: limit - timestamps.length, retryAfterSec: 0 };
}
