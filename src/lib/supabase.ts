
/**
 * @file This file sets up the Supabase clients for server-side and client-side use.
 *
 * It provides two exports:
 * 1. `supabase`: A client-safe, public client using the anon key.
 * 2. `supabaseAdmin`: A server-only admin client using the service role key for privileged operations.
 *
 * The file includes a check to ensure that all necessary Supabase environment variables
 * are set, throwing an error during initialization if any are missing. This prevents
 * runtime errors from invalid client configurations.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

// Check for missing environment variables
if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file and ensure SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_KEY are set.'
  );
}

// Public client, safe for client-side use
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client, for server-side use only
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
