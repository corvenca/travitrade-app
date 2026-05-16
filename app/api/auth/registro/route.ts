import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.JWT_SECRET || 'fallback_secret';
const key = new TextEncoder().encode(secretKey);

export async function POST(req: Request) {
  try {
    const { nombre, apellido, email, telefono, pais, username, password } = await req.json();

    if (!nombre || !apellido || !email || !telefono || !pais || !username || !password) {
      return NextResponse.json({ success: false, error: 'Faltan campos requeridos' }, { status: 400 });
    }

    // Verificar email duplicado
    const emailExists = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    if (emailExists.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Este correo electrónico ya está registrado' },
        { status: 400 }
      );
    }

    // Verificar username duplicado
    const usernameExists = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );
    if (usernameExists.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Este nombre de usuario ya está en uso' },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const insertResult = await pool.query(
      `INSERT INTO users (nombre, apellido, email, telefono, pais, username, password_hash, plan) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'free') RETURNING id, nombre, email, plan`,
      [nombre, apellido, email, telefono, pais, username, passwordHash]
    );

    const user = insertResult.rows[0];

    // Generate JWT
    const token = await new SignJWT({ userId: user.id, email: user.email, plan: user.plan })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1d')
      .sign(key);

    // Set cookie
    (await cookies()).set('travitrade_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 1 day
    });

    return NextResponse.json({ success: true, user: { id: user.id, nombre: user.nombre, email: user.email } });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}
