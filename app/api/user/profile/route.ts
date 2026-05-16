import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import pool from '@/lib/db';

const secretKey = process.env.JWT_SECRET || 'fallback_secret';
const key = new TextEncoder().encode(secretKey);

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('travitrade_session');
    
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { payload } = await jwtVerify(token.value, key, { algorithms: ['HS256'] });
    const userId = payload.userId as number;

    const user = await pool.query(
      'SELECT id, nombre, apellido, email, telefono, pais, username, plan, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (user.rows.length === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const subscriptions = await pool.query(
      'SELECT * FROM subscriptions WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    return NextResponse.json({
      user: user.rows[0],
      subscriptions: subscriptions.rows
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('travitrade_session');
    
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { payload } = await jwtVerify(token.value, key, { algorithms: ['HS256'] });
    const userId = payload.userId as number;
    
    const { nombre, apellido, telefono, pais, username } = await request.json();

    const usernameCheck = await pool.query(
      'SELECT id FROM users WHERE username = $1 AND id != $2',
      [username, userId]
    );
    if (usernameCheck.rows.length > 0) {
      return NextResponse.json({ error: 'Este nombre de usuario ya está en uso' }, { status: 400 });
    }

    await pool.query(
      'UPDATE users SET nombre = $1, apellido = $2, telefono = $3, pais = $4, username = $5 WHERE id = $6',
      [nombre, apellido, telefono, pais, username, userId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
