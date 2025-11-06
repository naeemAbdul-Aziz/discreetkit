/**
 * Distributed rate limiter using Upstash Redis REST API if configured.
 * Fallback to in-memory limiter when Upstash env vars are not set.
 */
import { rlAllow as rlAllowMemory } from '@/lib/utils';

type AllowResult = { allowed: boolean; retryAfterSec: number };

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

export async function rlAllowDistributed(key: string, max: number, windowSec: number): Promise<AllowResult> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    // Fallback to in-memory limiter (per instance)
    const r = rlAllowMemory(key, max, windowSec * 1000);
    return { allowed: r.allowed, retryAfterSec: r.retryAfterSec };
  }

  const now = Math.floor(Date.now() / 1000);
  const windowKey = `rl:${key}`;

  // Use Upstash pipeline: INCR and EXPIRE (NX) to set window
  const res = await fetch(`${UPSTASH_URL}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      commands: [
        ['INCR', windowKey],
        ['EXPIRE', windowKey, String(windowSec), 'NX'],
        ['TTL', windowKey],
      ],
    }),
    cache: 'no-store',
  });

  if (!res.ok) {
    // On any error, be permissive but safe
    return { allowed: true, retryAfterSec: windowSec };
  }

  const data = (await res.json()) as { result: [number, number, number] };
  const [count, _expireSet, ttl] = data.result;

  if (count <= max) {
    return { allowed: true, retryAfterSec: Math.max(1, ttl) };
  }
  // Blocked
  return { allowed: false, retryAfterSec: Math.max(1, ttl) };
}
