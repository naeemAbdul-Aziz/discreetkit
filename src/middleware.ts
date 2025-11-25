import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const url = request.nextUrl;
    const hostname = request.headers.get('host') || '';

    // Check for admin subdomain (admin.discreetkit.com or admin.localhost:3000)
    if (hostname.startsWith('admin.')) {
        // If root path, rewrite to /admin/dashboard
        if (url.pathname === '/') {
            url.pathname = '/admin/dashboard';
        } else {
            // Otherwise, rewrite to /admin/[path]
            // Ensure we don't double-prefix if the path already starts with /admin (unlikely but safe)
            if (!url.pathname.startsWith('/admin')) {
                url.pathname = `/admin${url.pathname}`;
            }
        }
        return NextResponse.rewrite(url);
    }

    // Check for pharmacy subdomain (pharmacy.discreetkit.com or pharmacy.localhost:3000)
    if (hostname.startsWith('pharmacy.')) {
        // If root path, rewrite to /pharmacy/dashboard
        if (url.pathname === '/') {
            url.pathname = '/pharmacy/dashboard';
        } else {
            // Otherwise, rewrite to /pharmacy/[path]
            if (!url.pathname.startsWith('/pharmacy')) {
                url.pathname = `/pharmacy${url.pathname}`;
            }
        }
        return NextResponse.rewrite(url);
    }

    // Default behavior for main domain (discreetkit.com)
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
