import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('travitrade_session') || cookieStore.get('token')
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'travitrade_secret_2025') as any
    if (!decoded.isAdmin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const setupName = searchParams.get('setup')

    const result = await pool.query(`
      SELECT
        o.id, o.date, o.symbol, o.side, o.sesion,
        o.pnl, o.result_type, o.notes, o.image_url,
        o.contratos, o.riesgo_amount,
        s.name as setup_name, s.color as setup_color,
        ta.name as account_name
      FROM trading_operations o
      LEFT JOIN trading_setups s ON o.setup_id = s.id
      LEFT JOIN trading_accounts ta ON o.account_id = ta.id
      WHERE o.user_id = $1 AND s.name = $2
      ORDER BY o.date DESC, o.created_at DESC
    `, [id, setupName])

    return NextResponse.json({ operations: result.rows })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
