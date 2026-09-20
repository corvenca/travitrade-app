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
    const { nombre, apellido, email, whatsapp, pais, sessionId } = await request.json()

    await pool.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        nombre TEXT,
        apellido TEXT,
        email TEXT,
        whatsapp TEXT,
        pais TEXT,
        session_id TEXT,
        status TEXT DEFAULT 'potencial',
        source TEXT DEFAULT 'web',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(email)
      )
    `)

    await pool.query(`
      INSERT INTO leads (nombre, apellido, email, whatsapp, pais, session_id, status, source)
      VALUES ($1, $2, $3, $4, $5, $6, 'potencial', 'web')
      ON CONFLICT (email) DO UPDATE SET
        whatsapp = EXCLUDED.whatsapp,
        pais = EXCLUDED.pais,
        session_id = EXCLUDED.session_id,
        updated_at = NOW()
    `, [nombre, apellido, email, whatsapp, pais || null, sessionId])

    return NextResponse.json({ success: true }, { headers: corsHeaders })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })
  }
}
