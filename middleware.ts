import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET || 'fallback_secret';
const key = new TextEncoder().encode(secretKey);

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('travitrade_session')?.value;

  // Protect /dashboard and its sub-routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Verify JWT using jose
      await jwtVerify(sessionCookie, key, {
        algorithms: ['HS256'],
      });
      return NextResponse.next();
    } catch (error) {
      // Token is invalid or expired
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Prevent logged in users from visiting /login or /registro
  if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/registro') {
    if (sessionCookie) {
      try {
        await jwtVerify(sessionCookie, key, { algorithms: ['HS256'] });
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } catch (error) {
        // Just proceed if token is invalid
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/registro'],
};
