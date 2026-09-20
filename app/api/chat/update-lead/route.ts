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
    const { sessionId, userName, userEmail, userPais, userTelefono, status } = await request.json()
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId requerido' }, { status: 400, headers: corsHeaders })
    }

    await pool.query(
      `UPDATE chat_sessions
       SET user_name = COALESCE($1, user_name),
           user_email = COALESCE($2, user_email),
           user_pais = COALESCE($3, user_pais),
           user_telefono = COALESCE($4, user_telefono),
           status = COALESCE($5, status)
       WHERE session_id = $6`,
      [userName || null, userEmail || null, userPais || null, userTelefono || null, status || 'requiere_agente', sessionId]
    )

    return NextResponse.json({ success: true }, { headers: corsHeaders })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })
  }
}
