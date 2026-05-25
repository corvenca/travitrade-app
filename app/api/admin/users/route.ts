import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function GET() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('travitrade_session')
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'travitrade_secret_2025') as any
    if (!decoded.isAdmin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

    const result = await pool.query('SELECT id, nombre, apellido, email, pais, plan, username, created_at FROM users ORDER BY created_at DESC')
    return NextResponse.json({ users: result.rows })
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
