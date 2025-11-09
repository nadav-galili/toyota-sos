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

  // Check if route requires authentication
  const isProtectedRoute = AUTH_REQUIRED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    // Route is not protected, allow access
    return NextResponse.next();
  }

  // Get session from cookies (for admin/viewer users)
  const supabaseSession = request.cookies.get('sb-session')?.value;

  // Get driver session from cookie (simplified - in real app, check localStorage client-side)
  // For now, middleware can't access localStorage, so we'll rely on client-side checks
  // and auth state cookies set by the auth context

  // If no session, redirect to login
  if (!supabaseSession) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Optional: Parse JWT and check role
  // This is a simplified check - in production, validate JWT properly
  try {
    // Basic session existence check
    // Full role validation will happen in the AuthProvider client-side
    return NextResponse.next();
  } catch (error) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }
}

// Define which routes trigger middleware
export const config = {
  matcher: [
    // Protected routes
    '/driver/:path*',
    '/admin/:path*',
    '/manager/:path*',
    '/viewer/:path*',
    // Exclude public assets and api
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};

