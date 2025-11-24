import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { matchProtectedRoute } from '@/lib/auth/routes'
import { getUserRoles } from '@/lib/auth/roles'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

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
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Data-driven RBAC check
  const route = matchProtectedRoute(request.nextUrl.pathname)
  if (route && route.roles) {
    // Require auth
    if (!user) {
      console.log('[middleware] No user, redirecting to /login')
      return NextResponse.redirect(new URL('/login', request.url))
    }
    // Fetch user roles and verify
    const roles = await getUserRoles(supabase as any, user.id)
    console.log(`[middleware] User: ${user.email} (${user.id}), Roles:`, roles)
    const authorized = roles.some(r => route.roles!.includes(r))
    console.log(`[middleware] Route: ${request.nextUrl.pathname}, Required:`, route.roles, 'Authorized:', authorized)
    if (!authorized) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
