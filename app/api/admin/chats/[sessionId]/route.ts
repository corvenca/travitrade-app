import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function GET(request: Request, { params }: { params: { sessionId: string } }) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('travitrade_session')
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'travitrade_secret_2025') as any
    if (!decoded.isAdmin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    const result = await pool.query('SELECT * FROM chat_sessions WHERE session_id = $1 ORDER BY created_at ASC', [params.sessionId])
    return NextResponse.json({ messages: result.rows })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { sessionId: string } }) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('travitrade_session')
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'travitrade_secret_2025') as any
    if (!decoded.isAdmin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    const { status } = await request.json()
    await pool.query('UPDATE chat_sessions SET status = $1 WHERE session_id = $2', [status, params.sessionId])
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
