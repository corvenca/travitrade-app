import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function POST(request: Request) {
  try {
    const { token } = await request.json()
    if (!token) return NextResponse.json({ error: 'Token requerido' }, { status: 400 })

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'travitrade_secret_2025') as any

    const sessionToken = jwt.sign(
      {
        userId: decoded.userId,
        email: decoded.email,
        nombre: decoded.nombre,
        plan: decoded.plan || 'free',
        isAdmin: false,
        impersonatedBy: decoded.impersonatedBy
      },
      process.env.JWT_SECRET || 'travitrade_secret_2025',
      { expiresIn: '1h' }
    );

    (await cookies()).set('travitrade_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 3600
    });

    return NextResponse.json({ success: true, user: decoded })
  } catch (error: any) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
  }
}
