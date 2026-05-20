import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-super-secret-key-at-least-32-chars-long'
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define public paths
  const isPublicPath =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password';

  const isSharePath = pathname.startsWith('/share/');
  const isStaticPath =
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname === '/api/jobs'; // internal jobs checks can bypass if they check IDs directly, but let's check

  if (isStaticPath || isSharePath) {
    return NextResponse.next();
  }

  // Get session token from HTTP-only cookie
  const token = request.cookies.get('session')?.value;

  let isAuthenticated = false;
  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET);
      isAuthenticated = true;
    } catch {
      // Invalid/expired token
    }
  }

  // If not authenticated and trying to access protected route
  if (!isAuthenticated && !isPublicPath) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated and trying to access public auth routes, redirect to dashboard
  if (isAuthenticated && isPublicPath) {
    const dashboardUrl = new URL('/', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
