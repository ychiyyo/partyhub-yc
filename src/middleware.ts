import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySession } from './lib/auth'

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value

  // Verify session
  const session = await verifySession(sessionCookie)

  // Redirect to login if unauthenticated on dashboard
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect to dashboard if logged in and visiting home or login
  if (session && (request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/login')) {
    const dashboardUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

// Config to specify which routes middleware should run on
export const config = {
  matcher: ['/dashboard/:path*', '/login', '/'],
}
