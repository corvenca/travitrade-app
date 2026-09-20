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
    const { sessionId, content, userEmail, userName } = await request.json()

    await pool.query(
      `INSERT INTO chat_sessions (session_id, user_email, user_name, role, content, status)
       VALUES ($1, $2, $3, 'user', $4, 'requiere_agente')`,
      [sessionId, userEmail || null, userName || 'Visitante', content]
    )

    return NextResponse.json({ success: true }, { headers: corsHeaders })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })
  }
}
