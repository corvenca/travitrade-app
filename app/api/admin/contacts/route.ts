import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('travitrade_session') || cookieStore.get('token')
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'travitrade_secret_2025') as any
    if (!decoded.isAdmin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all'
    const search = searchParams.get('search') || ''

    let whereClause = 'WHERE is_bot = false'
    if (filter === 'bots') whereClause = 'WHERE is_bot = true'
    if (search) whereClause += ` AND (nombre ILIKE '%${search}%' OR email ILIKE '%${search}%' OR code ILIKE '%${search}%')`

    const result = await pool.query(`
      SELECT * FROM contacts
      ${whereClause}
      ORDER BY created_at DESC
    `)

    return NextResponse.json({ contacts: result.rows })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
