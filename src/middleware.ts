import { NextResponse, type NextRequest } from 'next/server';
import { getSession } from '@/lib/session';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const session = await getSession();
  const { pathname } = request.nextUrl;

  // If we are on an admin route
  if (pathname.startsWith('/admin')) {
    // If there's no session and the user is NOT on the login page, redirect to login
    if (!session && pathname !== '/admin/login') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    // If there IS a session and the user tries to access the login page, redirect to dashboard
    if (session && pathname === '/admin/login') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
