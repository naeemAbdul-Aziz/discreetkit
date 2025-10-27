/**
 * @file middleware.ts
 * @description This Next.js middleware is responsible for protecting routes.
 *              It currently focuses on securing the /admin path.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from './lib/session';

/**
 * The primary middleware function. It checks for a valid session on admin routes.
 * @param request The incoming Next.js request.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Define public routes that don't require authentication.
  const publicPaths = ['/admin/login'];

  // 2. Check if the requested path is an admin path.
  const isAdminPath = pathname.startsWith('/admin');

  // 3. If it's not an admin path, do nothing.
  if (!isAdminPath || publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // 4. For all other admin paths, check for a valid session.
  const session = await getSession();

  // 5. If no session exists, redirect to the login page.
  if (!session) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // 6. If a session exists, allow the request to proceed.
  return NextResponse.next();
}

// Configure the middleware to run only on paths that match the /admin prefix.
export const config = {
  matcher: '/admin/:path*',
};
