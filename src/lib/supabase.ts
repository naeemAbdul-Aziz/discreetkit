/**
 * @file This file sets up the Supabase clients for server-side and client-side use.
 *
 * It uses a singleton pattern to ensure that the Supabase client is initialized
 * only once and only when it's first needed. This "lazy initialization" strategy
 * is crucial in serverless environments like Next.js to prevent issues with
 * environment variable loading order.
 *
 * It provides two exports:
 * 1. `getSupabaseClient`: A function to get the client-safe, public client instance.
 * 2. `getSupabaseAdminClient`: A function to get the server-only admin client instance.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// These are the public-facing variables, safe to be exposed in the browser.
// They MUST be prefixed with NEXT_PUBLIC_ in your .env.local file.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Singleton instances
let supabaseInstance: SupabaseClient | null = null;
let supabaseAdminInstance: SupabaseClient | null = null;

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
 * Returns a singleton instance of the admin Supabase client.
 * For server-side use ONLY.
 */
export function getSupabaseAdminClient(url: string, serviceKey: string): SupabaseClient {
    if (!url || !serviceKey) {
        throw new Error('Missing Supabase URL or Service Key for admin client. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are set in your environment.');
    }
    
    // We don't use a singleton here to ensure keys are always fresh if they were to change.
    // Serverless environments can be tricky with singletons and env vars.
    return createClient(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
}

// For convenience, you can export a pre-instantiated version for the client-side if needed,
// but server actions should always use the getter function.
export const supabase = getSupabaseClient();