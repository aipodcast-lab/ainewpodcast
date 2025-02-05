import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth');
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Handle root path
  if (pathname === '/') {
    if (authCookie) {
      return NextResponse.redirect(new URL('/create', request.url));
    }
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // Protected routes
  if (!authCookie && pathname !== '/auth') {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  // Redirect authenticated users away from auth page
  if (authCookie && pathname === '/auth') {
    return NextResponse.redirect(new URL('/create', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};