import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createSupabaseMiddlewareClient, getUserRoles } from '@/lib/supabase';

export async function middleware(request: NextRequest) {
    // 1. Initialize Supabase and check auth
    const { supabase, response } = createSupabaseMiddlewareClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    const url = request.nextUrl;
    const hostname = request.headers.get('host') || '';

    // 2. Define protected domains/paths
    const isAdminSubdomain = hostname.startsWith('admin.');
    const isPharmacySubdomain = hostname.startsWith('pharmacy.');
    const isAdminPath = url.pathname.startsWith('/admin');
    const isPharmacyPath = url.pathname.startsWith('/pharmacy');

    // 3. Auth Protection: Redirect to login if not authenticated
    if ((isAdminSubdomain || isPharmacySubdomain || isAdminPath || isPharmacyPath) && !user) {
        if (!url.pathname.startsWith('/login')) {
            // Preserve return URL for post-login redirect
            const loginUrl = new URL('/login', process.env.NEXT_PUBLIC_SITE_URL || 'https://discreetkit.com');
            loginUrl.searchParams.set('redirect_to', url.href);
            return NextResponse.redirect(loginUrl);
        }
    }

    // 4. Role-based protection for admin and pharmacy
    if (user && (isAdminSubdomain || isAdminPath)) {
        const roles = await getUserRoles(supabase, user.id);
        if (!roles.includes('admin')) {
            // Redirect to unauthorized page (same host if possible)
            url.pathname = '/unauthorized';
            return NextResponse.redirect(url);
        }
    }
    if (user && (isPharmacySubdomain || isPharmacyPath)) {
        const roles = await getUserRoles(supabase, user.id);
        if (!roles.includes('pharmacy')) {
            url.pathname = '/unauthorized';
            return NextResponse.redirect(url);
        }
    }

    // 5. Subdomain Rewrites
    if (isAdminSubdomain) {
        if (url.pathname === '/') {
            url.pathname = '/admin/dashboard';
        } else {
            if (!url.pathname.startsWith('/admin') && !url.pathname.startsWith('/login')) {
                url.pathname = `/admin${url.pathname}`;
            }
        }
        return NextResponse.rewrite(url);
    }
    if (isPharmacySubdomain) {
        if (url.pathname === '/') {
            url.pathname = '/pharmacy/dashboard';
        } else {
            if (!url.pathname.startsWith('/pharmacy') && !url.pathname.startsWith('/login')) {
                url.pathname = `/pharmacy${url.pathname}`;
            }
        }
        return NextResponse.rewrite(url);
    }

    // Default behavior
    return response;
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
