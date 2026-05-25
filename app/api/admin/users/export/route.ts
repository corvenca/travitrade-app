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

    const result = await pool.query('SELECT id, nombre, apellido, email, telefono, pais, username, plan, created_at FROM users ORDER BY created_at DESC')

    const headers = ['ID', 'Nombre', 'Apellido', 'Email', 'Teléfono', 'País', 'Usuario', 'Plan', 'Registro']
    const rows = result.rows.map(u => [u.id, u.nombre, u.apellido, u.email, u.telefono, u.pais, u.username, u.plan, new Date(u.created_at).toLocaleDateString('es-ES')])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=usuarios-travitrade.csv'
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
