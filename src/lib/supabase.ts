/**
 * @file This file sets up the Supabase clients for server-side and client-side use.
 *
 * It provides two key functions:
 * 1. `getSupabaseClient`: Returns a singleton instance of the public, client-safe Supabase client.
 * 2. `getSupabaseAdminClient`: Creates a new server-only admin client. This should only be called within server actions or API routes.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// These are the public-facing variables, safe to be exposed in the browser.
const supabaseUrl = "https://xffvvxdtfsxfnkowgdzu.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZnZ2eGR0ZnN4Zm5rb3dnZHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NjEzNzcsImV4cCI6MjA3MjAzNzM3N30.YJafTn5uFrfVpaZWpa2OwS2AZsI_ul7bmm6lMTKsJ9A";

// Singleton instance for the public client
let supabaseInstance: SupabaseClient | null = null;

/**
 * Returns a singleton instance of the public Supabase client.
 * Safe for client-side use.
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
}

/**
 * Creates and returns a new instance of the admin Supabase client.
 * This function should only be called from server-side code (Server Actions, API Routes).
 */
export function getSupabaseAdminClient(): SupabaseClient {
    const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmZnZ2eGR0ZnN4Zm5rb3dnZHp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjQ2MTM3NywiZXhwIjoyMDcyMDM3Mzc3fQ.YnmKw7BIjl-oKDCbpQVZ60ZvzgNE4nj4EOh2lyGDf4A";
    
    // Create a new client each time to ensure it's used in a secure server context.
    return createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
}

// For convenience, export a pre-instantiated version for the client-side.
export const supabase = getSupabaseClient();
