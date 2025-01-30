import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/', '/login', '/register', '/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow access to landing page and other public paths
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  // Check for authentication cookie
  const sessionCookie = request.cookies.get('sessionid');
  const isAuthenticated = !!sessionCookie;

  // Check auth for protected routes
  if (!isAuthenticated) {
    const from = pathname;
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', from);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files and api routes
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 