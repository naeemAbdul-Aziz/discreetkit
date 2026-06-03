import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createSupabaseMiddlewareClient, getUserRoles } from './lib/supabase-mw';
import { rlAllowDistributed } from "./lib/rate-limit";

// Define rate limit configuration
const RATE_LIMITS = {
  api: { points: 10, duration: 60 }, // 10 request per 60 seconds for general API
  auth: { points: 5, duration: 300 } // 5 requests per 5 minutes for Auth/Admin
};

function withSupabaseCookies(source: NextResponse, target: NextResponse) {
    source.cookies.getAll().forEach((cookie) => {
        target.cookies.set(cookie);
    });
    return target;
}

// Next.js 16 Edge middleware
export async function middleware(request: NextRequest) {
    // 1. Initialize Supabase and check auth
    const { supabase, response } = createSupabaseMiddlewareClient(request);
    const { data: { user } } = await supabase.auth.getUser();

    const url = request.nextUrl;
    const hostname = request.headers.get('host') || '';
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";

    // 0. Rate Limiting Protection (API Only)
    if (url.pathname.startsWith("/api")) {
        // Determine limit type
        const limit = url.pathname.includes("/api/auth") ? RATE_LIMITS.auth : RATE_LIMITS.api;
        
        // Use simple IP based key for global API throttle
        const globalKey = `mw_api_${ip}`;

        try {
            // Use distributed rate limiter (Upstash) if available
            const { allowed, retryAfterSec } = await rlAllowDistributed(globalKey, limit.points, limit.duration);
            
            if (!allowed) {
                return new NextResponse("Too Many Requests", { status: 429, headers: { "Retry-After": String(retryAfterSec) } });
            }
        } catch (e) {
            console.error("Middleware Rate Limit Error:", e);
            // Fail open to avoid blocking legitimate users on error
        }
    }

    // 2. Define protected domains/paths
    const isAdminSubdomain = hostname.startsWith('admin.');
    const isPharmacySubdomain = hostname.startsWith('pharmacy.');
    const isAccessSubdomain = hostname === 'access.discreetkit.com' || hostname.startsWith('access.localhost');
    const isAdminPath = url.pathname.startsWith('/admin');
    const isPharmacyPath = url.pathname.startsWith('/pharmacy');

    // 3. Auth Protection: Redirect to login if not authenticated
    if ((isAdminSubdomain || isPharmacySubdomain || isAdminPath || isPharmacyPath) && !user) {
        if (!url.pathname.startsWith('/login')) {
            // Preserve return URL for post-login redirect
            const loginUrl = new URL('/login', process.env.NEXT_PUBLIC_SITE_URL || 'https://discreetkit.com');
            loginUrl.searchParams.set('redirect_to', url.href);
            return withSupabaseCookies(response, NextResponse.redirect(loginUrl));
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
                return withSupabaseCookies(response, NextResponse.redirect(pharmacyUrl));
            }
            // Otherwise, unauthorized — redirect to main site's unauthorized page
            const unauthorizedUrl = new URL('/unauthorized', process.env.NEXT_PUBLIC_SITE_URL || 'https://discreetkit.com');
            return withSupabaseCookies(response, NextResponse.redirect(unauthorizedUrl));
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
                const adminUrl = new URL('/admin', process.env.NEXT_PUBLIC_ADMIN_URL || 'https://admin.discreetkit.com');
                return withSupabaseCookies(response, NextResponse.redirect(adminUrl));
            }
            // Otherwise, unauthorized — redirect to main site's unauthorized page
            const unauthorizedUrl = new URL('/unauthorized', process.env.NEXT_PUBLIC_SITE_URL || 'https://discreetkit.com');
            return withSupabaseCookies(response, NextResponse.redirect(unauthorizedUrl));
        }
    }

    // 5. Subdomain Rewrites
    // Global routes that should NEVER be prefixed with /admin or /pharmacy
    const exemptPaths = ['/login', '/unauthorized', '/robots.txt', '/sitemap.xml'];

    if (isAdminSubdomain) {
        // Rewrite root to /admin
        if (url.pathname === '/') {
            url.pathname = '/admin';
        } else {
             const isExempt = exemptPaths.some((p) => url.pathname.startsWith(p));
             if (!url.pathname.startsWith('/admin') && !url.pathname.startsWith('/api') && !url.pathname.startsWith('/_next') && !isExempt) {
                 url.pathname = `/admin${url.pathname}`;
             }
        }
        return withSupabaseCookies(response, NextResponse.rewrite(url));
    }
    
    if (isPharmacySubdomain) {
        // Rewrite root to /pharmacy/dashboard
        if (url.pathname === '/') {
            url.pathname = '/pharmacy/dashboard';
        } else {
            const isExempt = exemptPaths.some((p) => url.pathname.startsWith(p));
            if (!url.pathname.startsWith('/pharmacy') && !url.pathname.startsWith('/api') && !url.pathname.startsWith('/_next') && !isExempt) {
                url.pathname = `/pharmacy${url.pathname}`;
            }
        }
        return withSupabaseCookies(response, NextResponse.rewrite(url));
    }

    // 6. Rewrite access subdomain to /access path
    if (isAccessSubdomain) {
        if (url.pathname === '/') {
            url.pathname = '/access';
            return withSupabaseCookies(response, NextResponse.rewrite(url));
        }
    }

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
