
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Payments debug logger (opt-in via env PAYMENTS_DEBUG=true)
export function paymentDebug(...args: unknown[]) {
  if (process.env.PAYMENTS_DEBUG?.toLowerCase() === 'true') {
    // eslint-disable-next-line no-console
    console.log('[payments]', ...args)
  }
}

// Simple in-memory rate limiter (best-effort; per-instance in serverless)
// Use for lightweight protection of non-critical endpoints like verify.
type RLBucket = { count: number; resetAt: number }
const __rlStore = new Map<string, RLBucket>()

export function rlAllow(key: string, max: number, windowMs: number): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now()
  const bucket = __rlStore.get(key)
  if (!bucket || now >= bucket.resetAt) {
    __rlStore.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfterSec: Math.ceil(windowMs / 1000) }
  }
  if (bucket.count >= max) {
    return { allowed: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) }
  }
  bucket.count += 1
  return { allowed: true, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) }
}
