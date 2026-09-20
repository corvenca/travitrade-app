import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function PUT(request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('travitrade_session') || cookieStore.get('token')
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'travitrade_secret_2025') as any
    if (!decoded.isAdmin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

    const { agentActive } = await request.json()

    await pool.query(
      'UPDATE chat_sessions SET agent_active = $1 WHERE session_id = $2',
      [agentActive, sessionId]
    )

    return NextResponse.json({ success: true, agentActive })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
