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
    const { email } = await request.json()
    if (!email) return NextResponse.json({ sessionId: null, existing: false }, { headers: corsHeaders })

    // Buscar sesión existente
    const existing = await pool.query(
      `SELECT session_id FROM chat_sessions
       WHERE user_email = $1
       ORDER BY created_at DESC LIMIT 1`,
      [email]
    )

    if (existing.rows.length > 0) {
      return NextResponse.json({
        sessionId: existing.rows[0].session_id,
        existing: true
      }, { headers: corsHeaders })
    }

    return NextResponse.json({ sessionId: null, existing: false }, { headers: corsHeaders })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })
  }
}
