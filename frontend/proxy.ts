import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
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

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const pathname = url.pathname

  // Extract locale from pathname (e.g., /el/objects -> el)
  const localeMatch = pathname.match(/^\/([a-z]{2})\//);
  const locale = localeMatch ? localeMatch[1] : 'el';

  // Public routes that don't require authentication or DEMO checks
  const publicRoutes = ['/', '/login', '/register', '/thank-you', '/demo-expired', '/privacy', '/terms']
  const isPublicRoute = publicRoutes.some(route => {
    if (route === '/') {
      return pathname === '/' || pathname === `/${locale}` || pathname === `/${locale}/`
    }
    return pathname === `/${locale}${route}` || pathname.startsWith(`/${locale}${route}/`)
  })

  // If it's a public route, allow access
  if (isPublicRoute) {
    return response
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    url.pathname = `/${locale}/login`
    return NextResponse.redirect(url)
  }

  // Fetch user profile to check subscription status
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('subscription_status, demo_expires_at, account_purchased, vip_expires_at')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    // If profile doesn't exist, allow access (might be during registration)
    return response
  }

  // Check if user is VIP
  const isVip = profile.subscription_status === 'vip' && (
    !profile.vip_expires_at || new Date(profile.vip_expires_at) > new Date()
  )

  // If user is VIP, allow access
  if (isVip) {
    return response
  }

  // Check if account is purchased
  if (profile.account_purchased) {
    return response
  }

  // Check if DEMO has expired
  const demoExpiresAt = profile.demo_expires_at ? new Date(profile.demo_expires_at) : null
  const isDemoExpired = demoExpiresAt && demoExpiresAt < new Date()

  // If DEMO expired and user is not on demo-expired page, redirect
  if (isDemoExpired && !pathname.includes('/demo-expired')) {
    url.pathname = `/${locale}/demo-expired`
    return NextResponse.redirect(url)
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
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
