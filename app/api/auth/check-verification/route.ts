import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    const result = await pool.query(
      'SELECT id FROM email_verifications WHERE email = $1 AND used = true',
      [String(email || '').trim().toLowerCase()]
    )
    return NextResponse.json({ verified: result.rows.length > 0 })
  } catch {
    return NextResponse.json({ verified: false })
  }
}
