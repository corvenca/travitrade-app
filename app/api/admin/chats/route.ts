import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('travitrade_session')
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'travitrade_secret_2025') as any
    if (!decoded.isAdmin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id SERIAL PRIMARY KEY,
        session_id TEXT NOT NULL,
        user_email TEXT,
        user_name TEXT,
        user_pais TEXT,
        user_telefono TEXT,
        user_plan TEXT,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        status TEXT DEFAULT 'potencial',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    const result = await pool.query(`
      SELECT DISTINCT ON (session_id)
        session_id,
        user_email,
        user_name,
        user_pais,
        user_telefono,
        user_plan,
        status,
        created_at,
        (SELECT COUNT(*) FROM chat_sessions cs2 WHERE cs2.session_id = chat_sessions.session_id) as message_count,
        (SELECT content FROM chat_sessions cs3 WHERE cs3.session_id = chat_sessions.session_id ORDER BY created_at DESC LIMIT 1) as last_message
      FROM chat_sessions
      ORDER BY session_id, created_at DESC
    `)

    return NextResponse.json({ chats: result.rows })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
