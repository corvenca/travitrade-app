import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('travitrade_session')
  const { pathname } = request.nextUrl

  const publicRoutes = ['/login', '/registro']
  const isPublic = publicRoutes.some(route => pathname.startsWith(route))

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (token && isPublic) {
    if (request.nextUrl.searchParams.get('from') === 'external' || request.nextUrl.searchParams.get('logout') === 'true') {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
