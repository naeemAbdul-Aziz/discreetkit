
import { NextResponse, type NextRequest } from 'next/server';
import { getSession } from '@/lib/session';

export async function middleware(request: NextRequest) {
  const session = await getSession();

  // If the user is not authenticated and is trying to access a protected admin route,
  // redirect them to the login page.
  if (!session && request.nextUrl.pathname.startsWith('/admin') && request.nextUrl.pathname !== '/admin/login') {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // If the user is authenticated and tries to visit the login page,
  // redirect them to the admin dashboard.
  if (session && request.nextUrl.pathname === '/admin/login') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }
  
  // For all other cases, just continue with the request flow.
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
