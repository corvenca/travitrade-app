import { NextResponse } from 'next/server'
import pool from '@/lib/db'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders })
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    if (!sessionId) return NextResponse.json({ agentActive: false }, { headers: corsHeaders })

    // Verificar si agente está activo
    const agentCheck = await pool.query(
      'SELECT agent_active FROM chat_sessions WHERE session_id = $1 AND agent_active = true LIMIT 1',
      [sessionId]
    )
    const agentActive = agentCheck.rows.length > 0

    // Verificar último mensaje del agente
    const lastAgentMsg = await pool.query(
      `SELECT created_at FROM chat_sessions
       WHERE session_id = $1 AND role = 'agent'
       ORDER BY created_at DESC LIMIT 1`,
      [sessionId]
    )

    // Verificar último mensaje del usuario después del agente
    let waitingTooLong = false
    if (agentActive && lastAgentMsg.rows.length > 0) {
      const lastAgent = new Date(lastAgentMsg.rows[0].created_at)
      const now = new Date()
      const diffMinutes = (now.getTime() - lastAgent.getTime()) / 60000
      waitingTooLong = diffMinutes > 2
    }

    // Si no hay mensaje del agente pero se solicitó agente
    if (agentActive && lastAgentMsg.rows.length === 0) {
      const requestTime = await pool.query(
        `SELECT created_at FROM chat_sessions
         WHERE session_id = $1 AND status = 'requiere_agente'
         ORDER BY created_at ASC LIMIT 1`,
        [sessionId]
      )
      if (requestTime.rows.length > 0) {
        const requested = new Date(requestTime.rows[0].created_at)
        const diffMinutes = (new Date().getTime() - requested.getTime()) / 60000
        waitingTooLong = diffMinutes > 2
      }
    }

    return NextResponse.json({
      agentActive,
      waitingTooLong
    }, { headers: corsHeaders })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })
  }
}
