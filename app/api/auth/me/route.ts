import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import pool from '@/lib/db';

const secretKey = process.env.JWT_SECRET || 'travitrade_secret_2025';
const key = new TextEncoder().encode(secretKey);

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value || cookieStore.get('travitrade_session')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'No session' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });

    const userId = payload.userId;

    const userResult = await pool.query(
      'SELECT id, nombre, apellido, email, telefono, pais, plan, username FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const user = userResult.rows[0];
    const isAdmin = user.email === 'altuveronalbis@gmail.com';

    return NextResponse.json({
      userId: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      telefono: user.telefono,
      pais: user.pais,
      plan: isAdmin ? 'pro' : (user.plan || 'free'),
      username: user.username,
      isAdmin,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET',
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
  }
}
