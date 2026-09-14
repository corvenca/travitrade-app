import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS blocked BOOLEAN DEFAULT false;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS blocked_reason TEXT;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
    `)
    return NextResponse.json({ success: true, message: 'Database schema updated successfully' })
  } catch (error: any) {
    console.error('Init DB error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
