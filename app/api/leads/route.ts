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
    const { nombre, apellido, email, whatsapp, sessionId } = await request.json()

    await pool.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        nombre TEXT,
        apellido TEXT,
        email TEXT,
        whatsapp TEXT,
        session_id TEXT,
        status TEXT DEFAULT 'potencial',
        source TEXT DEFAULT 'web',
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(email)
      )
    `)

    // Verificar si ya existe como usuario registrado
    const userExists = await pool.query('SELECT id, plan FROM users WHERE email = $1', [email])

    if (userExists.rows.length > 0) {
      // Ya es cliente — actualizar status
      await pool.query(`
        INSERT INTO leads (nombre, apellido, email, whatsapp, session_id, status, source)
        VALUES ($1, $2, $3, $4, $5, 'cliente', 'web')
        ON CONFLICT (email) DO UPDATE SET status = 'cliente'
      `, [nombre, apellido, email, whatsapp, sessionId])
    } else {
      // Es un lead nuevo
      await pool.query(`
        INSERT INTO leads (nombre, apellido, email, whatsapp, session_id, status, source)
        VALUES ($1, $2, $3, $4, $5, 'potencial', 'web')
        ON CONFLICT (email) DO NOTHING
      `, [nombre, apellido, email, whatsapp, sessionId])
    }

    return NextResponse.json({ success: true }, { headers: corsHeaders })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })
  }
}
