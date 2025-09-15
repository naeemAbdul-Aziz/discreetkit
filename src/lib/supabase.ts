/**
 * @file This file sets up the Supabase clients for server-side and client-side use.
 *
 * It provides two key functions:
 * 1. `getSupabaseClient`: Returns a singleton instance of the public, client-safe Supabase client.
 * 2. `getSupabaseAdminClient`: Creates a new server-only admin client. This should only be called within server actions or API routes.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// These are the public-facing variables, safe to be exposed in the browser.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Singleton instance for the public client
let supabaseInstance: SupabaseClient | null = null;

/**
 * Returns a singleton instance of the public Supabase client.
 * Safe for client-side use.
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase URL or Anon Key for public client. Check your .env.local file.');
    }
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
}

/**
 * Creates and returns a new instance of the admin Supabase client.
 * This function should only be called from server-side code (Server Actions, API Routes).
 * It reads environment variables at the time of the call to ensure they are available.
 */
export function getSupabaseAdminClient(): SupabaseClient {
    const adminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!adminUrl || !serviceKey) {
        throw new Error('Missing Supabase URL or Service Key for admin client. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are set in your environment.');
    }
    
    // Create a new client each time to ensure it's used in a secure server context.
    return createClient(adminUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
}

// For convenience, export a pre-instantiated version for the client-side.
export const supabase = getSupabaseClient();
