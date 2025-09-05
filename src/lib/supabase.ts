/**
 * @file This file sets up the Supabase clients for server-side and client-side use.
 *
 * It provides two exports:
 * 1. `supabase`: A client-safe, public client using the anon key. It reads from `NEXT_PUBLIC_` prefixed variables.
 * 2. `supabaseAdmin`: A server-only admin client using the service role key for privileged operations.
 */
import { createClient } from '@supabase/supabase-js';

// These are the public-facing variables, safe to be exposed in the browser.
// They MUST be prefixed with NEXT_PUBLIC_ in your .env.local file.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// This is the server-side only service key. It should NOT be prefixed.
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

// Public client, safe for client-side use
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client, for server-side use only.
// Note: It uses the same supabaseUrl and the server-only service key.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
