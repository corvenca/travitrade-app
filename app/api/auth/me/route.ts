import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import pool from '@/lib/db';

const secretKey = process.env.JWT_SECRET || 'fallback_secret';
const key = new TextEncoder().encode(secretKey);

export async function GET() {
  try {
    const sessionCookie = (await cookies()).get('travitrade_session')?.value;

    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: 'No session' }, { status: 401 });
    }

    const { payload } = await jwtVerify(sessionCookie, key, {
      algorithms: ['HS256'],
    });

    const userId = payload.userId;

    const userResult = await pool.query('SELECT id, nombre, email, plan FROM users WHERE id = $1', [userId]);
    
    if (userResult.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const user = userResult.rows[0];

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        plan: user.plan
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
  }
}
