import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('travitrade_session')
  const { pathname } = request.nextUrl

  const publicRoutes = ['/login', '/registro']
  const isPublic = publicRoutes.some(r => pathname.startsWith(r))

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const secretKey = process.env.JWT_SECRET || 'travitrade_secret_2025'
  const key = new TextEncoder().encode(secretKey)

  if (token && isPublic) {
    try {
      const { payload } = await jwtVerify(token.value, key, { algorithms: ['HS256'] })
      return NextResponse.redirect(new URL(payload.isAdmin ? '/admin' : '/dashboard', request.url))
    } catch {
      return NextResponse.next()
    }
  }

  if (pathname.startsWith('/admin')) {
    if (!token) return NextResponse.redirect(new URL('/login', request.url))
    try {
      const { payload } = await jwtVerify(token.value, key, { algorithms: ['HS256'] })
      if (!payload.isAdmin) return NextResponse.redirect(new URL('/dashboard', request.url))
    } catch {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
