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
    const body = await request.json()
    const email = String(body.email || '').trim().toLowerCase()
    const code = String(body.code || '').trim()

    const result = await pool.query(
      `SELECT id FROM email_verifications
       WHERE email = $1 AND code = $2 AND used = false AND expires_at > NOW()`,
      [email, code]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Código inválido o expirado' }, { status: 400, headers: corsHeaders })
    }

    // Marcar como usado
    await pool.query('UPDATE email_verifications SET used = true WHERE email = $1', [email])

    return NextResponse.json({ success: true, verified: true }, { headers: corsHeaders })
  } catch (error: any) {
    console.error('Verify code error:', error.message)
    return NextResponse.json({ error: 'Error al verificar el código' }, { status: 500, headers: corsHeaders })
  }
}
