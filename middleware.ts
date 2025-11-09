import { NextRequest, NextResponse } from 'next/server';

// Define route access by role
const PROTECTED_ROUTES: Record<string, string[]> = {
  '/driver': ['driver'],
  '/admin': ['admin'],
  '/manager': ['admin', 'manager'],
  '/viewer': ['admin', 'viewer'],
};

// Routes that require authentication
const AUTH_REQUIRED_ROUTES = Object.keys(PROTECTED_ROUTES);

// Public routes (no auth required)
const PUBLIC_ROUTES = ['/auth/login', '/auth/signup', '/'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // Temporary: allow all routes through and rely on client-side auth + RLS.
  // We’ll re-enable server-side checks after wiring proper cookie/JWT parsing.
  return NextResponse.next();
}

// Define which routes trigger middleware
export const config = {
  matcher: [
    // Protected routes
    // Keep matchers for future enforcement, but middleware currently allows all
    '/driver/:path*',
    '/admin/:path*',
    '/manager/:path*',
    '/viewer/:path*',
    // Exclude public assets and api
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};

