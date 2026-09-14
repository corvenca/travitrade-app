import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('travitrade_session') || cookieStore.get('token')
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'travitrade_secret_2025') as any
    if (!decoded.isAdmin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

    const result = await pool.query(`
      SELECT 
        id, nombre, apellido, email, telefono, pais, username, 
        plan, blocked, blocked_reason, last_login, created_at, 
        updated_at 
      FROM users 
      ORDER BY created_at DESC
    `)
    return NextResponse.json({ users: result.rows })
  } catch (error: any) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}

// POST — crear usuario desde admin
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('travitrade_session') || cookieStore.get('token')
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'travitrade_secret_2025') as any
    if (!decoded.isAdmin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

    const { nombre, apellido, email, telefono, pais, username, password, plan } = await request.json()

    if (!nombre || !email || !password) {
      return NextResponse.json({ error: 'Nombre, email y contraseña son obligatorios' }, { status: 400 })
    }

    const emailExists = await pool.query('SELECT id FROM users WHERE email = $1', [email])
    if (emailExists.rows.length > 0) return NextResponse.json({ error: 'Email ya registrado' }, { status: 400 })

    const passwordHash = await bcrypt.hash(password, 10)

    const result = await pool.query(`
      INSERT INTO users (nombre, apellido, email, telefono, pais, username, password_hash, plan) 
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id, email, plan
    `, [nombre, apellido, email, telefono, pais, username, passwordHash, plan || 'free'])

    return NextResponse.json({ success: true, user: result.rows[0] })
  } catch (error: any) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
