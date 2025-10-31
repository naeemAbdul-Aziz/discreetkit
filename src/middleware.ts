/**
 * @file middleware.ts
 * @description This middleware protects the /admin routes by ensuring
 *              that only authenticated staff members can access them.
 *              It checks for a valid session and redirects to the login
 *              page if the user is not authenticated.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/orders') || pathname.startsWith('/products') || pathname.startsWith('/analytics');


  // If user is not signed in and tries to access a protected admin route, redirect to login
  if (!user && isAdminRoute) {
    const url = new URL(request.url);
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // If user is signed in and tries to access the login page, redirect to the dashboard
  if (user && pathname === '/login') {
    const url = new URL(request.url);
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return response;
}

// Define which routes the middleware should apply to.
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/orders/:path*',
    '/products/:path*',
    '/analytics/:path*',
    '/login',
  ],
};
