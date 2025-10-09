
import { NextResponse, type NextRequest } from 'next/server';
import { getSession } from '@/lib/session';

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const pathname = request.nextUrl.pathname;

  // If the user is not authenticated and is trying to access a protected admin route,
  // redirect them to the login page.
  if (!session && pathname !== '/admin/login') {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // If the user is authenticated and tries to visit the login page,
  // redirect them to the admin dashboard.
  if (session && pathname === '/admin/login') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }
  
  // For all other cases, just continue with the request flow.
  return NextResponse.next();
}

// This config specifies that the middleware should only run on the admin routes.
// It uses a negative lookahead to exclude all files in /_next, /api, and static assets.
export const config = {
  matcher: ['/admin/:path*'],
};
