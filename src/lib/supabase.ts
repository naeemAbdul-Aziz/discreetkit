
/**
 * @file This file sets up the Supabase clients for server-side and client-side use.
 *
 * It provides two key functions:
 * 1. `getSupabaseClient`: Returns a singleton instance of the public, client-safe Supabase client.
 * 2. `getSupabaseAdminClient`: Creates a new server-only admin client. This should only be called within server actions or API routes.
 */
import { createClient } from '@supabase/supabase-js';
import { createServerClient, type CookieOptions, createBrowserClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { logger } from './logger';


// These are the public-facing variables, safe to be exposed in the browser.
// These are the public-facing variables, safe to be exposed in the browser.
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Fix for "WebSocket not available" / mixed content errors in Production
if (process.env.NODE_ENV === 'production' && supabaseUrl && supabaseUrl.startsWith('http://')) {
  supabaseUrl = supabaseUrl.replace('http://', 'https://');
}

// --- This is for CLIENT Components ---
// Singleton instance for the public client
let supabaseInstance: any = null;
/**
 * Returns a singleton instance of the public Supabase client.
 * Safe for client-side use. MUST only be called from client components.
 */
export function getSupabaseClient() {
  // Guard against SSR - only create the client in the browser
  if (typeof window === 'undefined') {
    throw new Error('getSupabaseClient() must only be called in client components (browser environment)');
  }
  if (!supabaseInstance) {
    const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN;
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey, {
      cookieOptions: {
        ...(cookieDomain && !isLocalhost ? { domain: cookieDomain } : {}),
      }
    });
  }
  return supabaseInstance!;
}

// --- This is for SERVER Components and SERVER ACTIONS ---
export async function createSupabaseServerClient() {
  const { cookies, headers } = await import('next/headers');
  const cookieStore = await cookies();
  const headerStore = await headers();
  const host = headerStore.get('host') || '';
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
  const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN;
  
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
            cookieStore.set({
              name,
              value,
              ...options,
              ...(cookieDomain && !isLocalhost ? { domain: cookieDomain } : {}),
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production'
            })
          } catch (error) {
            // The `set` cookie method throws when trying to set a cookie in a Server Action.
            // This is expected, and can be safely ignored.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options, ...(cookieDomain && !isLocalhost ? { domain: cookieDomain } : {}) })
          } catch (error) {
            // The `delete` cookie method throws when trying to delete a cookie in a Server Action.
            // This is expected, and can be safely ignored.
          }
        },
      },
      cookieOptions: {
         ...(cookieDomain && !isLocalhost ? { domain: cookieDomain } : {}),
      }
    }
  );
}

// --- This is for MIDDLEWARE ---
export function createSupabaseMiddlewareClient(request: NextRequest) {
  // Create an initial response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const host = request.headers.get('host') || '';
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
  const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN;
  
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
          })
          
          // Must recreate the response to properly apply the request header modifications
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set({
              name,
              value,
              ...options,
              ...(cookieDomain && !isLocalhost ? { domain: cookieDomain } : {}),
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production'
            })
          })
        },
      },
      cookieOptions: {
         ...(cookieDomain && !isLocalhost ? { domain: cookieDomain } : {}),
      }
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

  if (error) {
    logger.error('Error fetching roles', { context: 'Auth-Roles', data: { userId, error } });
    return [];
  }
  if (!data) return [];
  // data: [{ roles: { name: 'admin' } }, ...]
  return data.map((r: any) => r.roles?.name).filter(Boolean);
}

// --- This is for ADMIN-LEVEL Server Actions ---
/**
 * Creates and returns a new instance of the admin Supabase client.
 * This function should only be called from server-side code (Server Actions, API Routes).
 */
export function getSupabaseAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!serviceKey) {
    logger.error('Supabase service key missing', { context: 'Supabase-Admin' });
  }

  // Create a new client each time to ensure it's used in a secure server context.
  return createClient(supabaseUrl, serviceKey!, {
    auditLog: 'Admin Client Created',
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  } as any);
}
