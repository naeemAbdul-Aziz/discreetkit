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
        const userEmail = user.email?.toLowerCase() || '';
        const adminWhitelist = (process.env.ADMIN_EMAIL_WHITELIST || '')
          .split(',')
          .map(e => e.trim().toLowerCase())
          .filter(Boolean);
        const isWhitelistedAdmin = adminWhitelist.includes(userEmail);
        if (!roles.includes('admin') && !isWhitelistedAdmin) {
            // If they are a pharmacy user, redirect to pharmacy portal
            if (roles.includes('pharmacy')) {
                const pharmacyUrl = new URL('/pharmacy/dashboard', process.env.NEXT_PUBLIC_PHARMACY_URL || 'https://pharmacy.discreetkit.com');
                return NextResponse.redirect(pharmacyUrl);
            }
            // Otherwise, unauthorized — redirect to main site's unauthorized page
            const unauthorizedUrl = new URL('/unauthorized', process.env.NEXT_PUBLIC_SITE_URL || 'https://discreetkit.com');
            return NextResponse.redirect(unauthorizedUrl);
        }
    }
    if (user && (isPharmacySubdomain || isPharmacyPath)) {
        const roles = await getUserRoles(supabase, user.id);
        const userEmail = user.email?.toLowerCase() || '';
        const pharmacyWhitelist = (process.env.PHARMACY_EMAIL_WHITELIST || '')
          .split(',')
          .map(e => e.trim().toLowerCase())
          .filter(Boolean);
        const isWhitelistedPharmacy = pharmacyWhitelist.includes(userEmail);
        if (!roles.includes('pharmacy') && !isWhitelistedPharmacy) {
            // If they are an admin, redirect to admin portal
            if (roles.includes('admin')) {
                const adminUrl = new URL('/admin/dashboard', process.env.NEXT_PUBLIC_ADMIN_URL || 'https://admin.discreetkit.com');
                return NextResponse.redirect(adminUrl);
            }
            // Otherwise, unauthorized — redirect to main site's unauthorized page
            const unauthorizedUrl = new URL('/unauthorized', process.env.NEXT_PUBLIC_SITE_URL || 'https://discreetkit.com');
            return NextResponse.redirect(unauthorizedUrl);
        }
    }

    // 5. Subdomain Rewrites
    if (isAdminSubdomain) {
        if (url.pathname === '/') {
            url.pathname = '/admin/dashboard';
        } else {
            // Do not force-prefix certain global routes
            const exemptPaths = ['/login', '/unauthorized', '/robots.txt', '/sitemap.xml'];
            const isExempt = exemptPaths.some((p) => url.pathname.startsWith(p));
            if (!url.pathname.startsWith('/admin') && !isExempt) {
                url.pathname = `/admin${url.pathname}`;
            }
        }
        return NextResponse.rewrite(url);
    }
    if (isPharmacySubdomain) {
        if (url.pathname === '/') {
            url.pathname = '/pharmacy/dashboard';
        } else {
            // Do not force-prefix certain global routes
            const exemptPaths = ['/login', '/unauthorized', '/robots.txt', '/sitemap.xml'];
            const isExempt = exemptPaths.some((p) => url.pathname.startsWith(p));
            if (!url.pathname.startsWith('/pharmacy') && !isExempt) {
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
