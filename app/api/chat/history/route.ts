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
    if (!email) return NextResponse.json({ found: false }, { headers: corsHeaders })

    // Buscar en usuarios registrados
    const userRes = await pool.query(
      'SELECT nombre, apellido, email, telefono, pais, plan FROM users WHERE email = $1',
      [email]
    )

    if (userRes.rows.length > 0) {
      const u = userRes.rows[0]
      return NextResponse.json({
        found: true,
        isRegistered: true,
        data: {
          nombre: u.nombre,
          apellido: u.apellido,
          email: u.email,
          telefono: u.telefono,
          pais: u.pais,
          plan: u.plan
        }
      }, { headers: corsHeaders })
    }

    // Buscar en leads/chat_sessions previos
    const leadRes = await pool.query(`
      SELECT DISTINCT user_name, user_email, user_pais, user_telefono
      FROM chat_sessions
      WHERE user_email = $1 AND user_name IS NOT NULL
      ORDER BY created_at DESC LIMIT 1
    `, [email])

    if (leadRes.rows.length > 0) {
      const l = leadRes.rows[0]
      return NextResponse.json({
        found: true,
        isRegistered: false,
        data: {
          nombre: l.user_name,
          email: l.user_email,
          pais: l.user_pais,
          telefono: l.user_telefono
        }
      }, { headers: corsHeaders })
    }

    // También buscar en tabla leads
    const leadTableRes = await pool.query(
      'SELECT nombre, apellido, email, whatsapp, pais FROM leads WHERE email = $1',
      [email]
    )

    if (leadTableRes.rows.length > 0) {
      const l = leadTableRes.rows[0]
      return NextResponse.json({
        found: true,
        isRegistered: false,
        data: {
          nombre: l.nombre,
          apellido: l.apellido,
          email: l.email,
          telefono: l.whatsapp,
          pais: l.pais
        }
      }, { headers: corsHeaders })
    }

    return NextResponse.json({ found: false }, { headers: corsHeaders })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })
  }
}
