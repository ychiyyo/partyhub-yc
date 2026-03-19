import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySession } from './lib/auth'

export async function middleware(request: NextRequest) {
  // Bypass all middleware auth checks for MVP
  return NextResponse.next();
}

// Config to specify which routes middleware should run on
export const config = {
  matcher: ['/dashboard/:path*', '/login', '/'],
}
