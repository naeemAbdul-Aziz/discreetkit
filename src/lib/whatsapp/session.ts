import { getRedis } from '../redis';
import type { SessionData, ConversationState } from './types';

const SESSION_TTL = 60 * 60 * 24; // 24 hours (WhatsApp session window)

/**
 * Generates a Redis key for a specific WhatsApp user.
 */
function getSessionKey(waId: string): string {
    return `whatsapp:session:${waId}`;
}

/**
 * Retrieves the current session data for a user.
 * If no session exists, returns a default initial session.
 */
export async function getSession(waId: string): Promise<SessionData> {
    const redis = await getRedis();
    const key = getSessionKey(waId);
    const data = await redis.get(key);

    if (!data) {
        return {
            state: 'IDLE',
            cart: { items: [], total: 0 },
            lastInteraction: Date.now(),
        };
    }

    // Redis rest api might return string or object depending on library version
    // but upstash/redis usually returns parsed JSON if stored as such.
    return typeof data === 'string' ? JSON.parse(data) : data;
}

/**
 * Updates the session data for a user.
 * Merges the new data with existing data.
 */
export async function updateSession(waId: string, data: Partial<SessionData>): Promise<void> {
    const redis = await getRedis();
    const key = getSessionKey(waId);

    const current = await getSession(waId);
    const updated = { ...current, ...data, lastInteraction: Date.now() };

    await redis.set(key, JSON.stringify(updated), { ex: SESSION_TTL });
}

/**
 * Clears the user's session (e.g., after successful order).
 */
export async function clearSession(waId: string): Promise<void> {
    const redis = await getRedis();
    const key = getSessionKey(waId);
    await redis.del(key);
}

/**
 * Atomic state transition helper.
 */
export async function transitionState(waId: string, newState: ConversationState): Promise<void> {
    await updateSession(waId, { state: newState });
}
