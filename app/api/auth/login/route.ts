import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const secretKey = process.env.JWT_SECRET || 'fallback_secret';
const key = new TextEncoder().encode(secretKey);

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email y contraseña requeridos' }, { status: 400 });
    }

    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Credenciales inválidas' }, { status: 401 });
    }

    const user = userResult.rows[0];

    if (!user.activo) {
      return NextResponse.json({ success: false, error: 'Cuenta desactivada' }, { status: 403 });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return NextResponse.json({ success: false, error: 'Credenciales inválidas' }, { status: 401 });
    }

    const isAdmin = user.email === 'altuveronalbis@gmail.com';
    const token = jwt.sign(
      { userId: user.id, email: user.email, nombre: user.nombre, plan: user.plan || 'free', isAdmin },
      process.env.JWT_SECRET || 'travitrade_secret_2025',
      { expiresIn: '7d' }
    );

    (await cookies()).set('travitrade_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    });

    return NextResponse.json({ success: true, isAdmin });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}
