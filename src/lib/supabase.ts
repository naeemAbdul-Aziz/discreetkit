
/**
 * @file This file sets up the Supabase clients for server-side and client-side use.
 *
 * It provides two key functions:
 * 1. `getSupabaseClient`: Returns a singleton instance of the public, client-safe Supabase client.
 * 2. `getSupabaseAdminClient`: Creates a new server-only admin client. This should only be called within server actions or API routes.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createServerClient, type CookieOptions, createBrowserClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';


// These are the public-facing variables, safe to be exposed in the browser.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// --- This is for CLIENT Components ---
// Singleton instance for the public client
let supabaseInstance: any = null;
/**
 * Returns a singleton instance of the public Supabase client.
 * Safe for client-side use.
 */
export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance!;
}

// --- This is for SERVER Components and SERVER ACTIONS ---
export async function createSupabaseServerClient() {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` cookie method throws when trying to set a cookie in a Server Action.
            // This is expected, and can be safely ignored.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` cookie method throws when trying to delete a cookie in a Server Action.
            // This is expected, and can be safely ignored.
          }
        },
      },
    }
  );
}

// --- This is for MIDDLEWARE ---
export function createSupabaseMiddlewareClient(request: NextRequest) {
  // Create an unmodified response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // If the cookie is set, update the request and response
          request.cookies.set({ name, value, ...options, });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options, });
        },
        remove(name: string, options: CookieOptions) {
          // If the cookie is removed, update the request and response
          request.cookies.set({ name, value: '', ...options, });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: '', ...options, });
        },
      },
    }
  );

  return { supabase, response };
}

/**
 * Fetches an array of role names for a given user id using the provided Supabase client.
 * Used in middleware for role-based access control.
 */
export async function getUserRoles(supabase: any, userId: string): Promise<string[]> {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('user_roles')
    .select('roles(name)')
    .eq('user_id', userId);
  if (error || !data) return [];
  // data: [{ roles: { name: 'admin' } }, ...]
  return data.map((r: any) => r.roles?.name).filter(Boolean);
}

// --- This is for ADMIN-LEVEL Server Actions ---
/**
 * Creates and returns a new instance of the admin Supabase client.
 * This function should only be called from server-side code (Server Actions, API Routes).
 */
export function getSupabaseAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY!;

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
