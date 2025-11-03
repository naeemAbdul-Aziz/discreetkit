
// src/middleware.ts (FIXED)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createSupabaseMiddlewareClient } from './lib/supabase'; // <-- Import the correct client

const PROTECTED_ROUTES = ['/admin', '/pharmacy'];
const LOGIN_ROUTE = '/login';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Create a Supabase client and response object
  const { supabase, response } = createSupabaseMiddlewareClient(request);

  // 2. Get the session. This also refreshes the token if needed.
  const { data: { session } } = await supabase.auth.getSession();

  // 3. If user is not logged in and tries to access a protected route
  if (!session && PROTECTED_ROUTES.some(prefix => pathname.startsWith(prefix))) {
    // Redirect to login, but include the page they were trying to visit
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_ROUTE;
    url.searchParams.set('redirect_to', pathname);
    return NextResponse.redirect(url);
  }

  // 4. If user IS logged in and tries to access the login page
  if (session && pathname === LOGIN_ROUTE) {
    // Redirect them to their main dashboard
    // We can add role-based logic here later
    const url = request.nextUrl.clone();
    url.pathname = '/admin/dashboard';
    return NextResponse.redirect(url);
  }

  // 5. Allow the request and pass the Supabase-enhanced response
  // This is crucial for passing the refreshed auth cookie
  return response;
}

// Config (your existing config is correct)
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
