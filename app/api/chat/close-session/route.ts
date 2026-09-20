import { NextResponse } from 'next/server'
import pool from '@/lib/db'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders })
}

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json()
    if (!sessionId) return NextResponse.json({ error: 'sessionId requerido' }, { headers: corsHeaders })

    await pool.query(`
      UPDATE chat_sessions
      SET
        inactivity_closed = true,
        closed_at = NOW(),
        agent_active = false,
        bot_enabled = true,
        status = 'cerrado'
      WHERE session_id = $1
    `, [sessionId])

    return NextResponse.json({ success: true }, { headers: corsHeaders })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })
  }
}
