import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { logger } from './logger';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Edge-safe Supabase middleware client that avoids importing browser or node-only APIs
export function createSupabaseMiddlewareClient(request: NextRequest) {
  // Create an unmodified response
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        // If the cookie is set, update the request and response
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        // If the cookie is removed, update the request and response
        request.cookies.set({ name, value: '', ...options });
        response = NextResponse.next({ request: { headers: request.headers } });
        response.cookies.set({ name, value: '', ...options });
      },
    },
  });

  return { supabase, response };
}

/**
 * Edge-safe function to retrieve roles for a user.
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
  return data.map((r: any) => r.roles?.name).filter(Boolean);
}

