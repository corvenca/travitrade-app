import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'travitrade_secret_2025') as any

    // Cuentas del usuario
    const accountsRes = await pool.query(
      'SELECT * FROM trading_accounts WHERE user_id = $1 ORDER BY created_at ASC',
      [decoded.userId]
    )

    // Estadísticas por cuenta
    const accountStats = await pool.query(`
      SELECT
        ta.id, ta.name, ta.broker, ta.type, ta.initial_capital,
        COUNT(o.id) as total_ops,
        SUM(o.pnl) as total_pnl,
        SUM(CASE WHEN o.result_type = 'GANADA' THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN o.result_type = 'PERDIDA' THEN 1 ELSE 0 END) as losses,
        SUM(CASE WHEN o.result_type = 'BREAK_EVEN' THEN 1 ELSE 0 END) as be
      FROM trading_accounts ta
      LEFT JOIN trading_operations o ON ta.id = o.account_id AND o.user_id = $1
      WHERE ta.user_id = $1
      GROUP BY ta.id, ta.name, ta.broker, ta.type, ta.initial_capital
      ORDER BY total_ops DESC NULLS LAST
    `, [decoded.userId])

    // Últimas 20 operaciones con imagen y setup
    const recentOps = await pool.query(`
      SELECT
        o.id, o.date, o.symbol, o.side, o.sesion,
        o.pnl, o.result_type, o.notes, o.image_url,
        o.contratos, o.riesgo_amount,
        s.name as setup_name, s.color as setup_color, s.direction as setup_direction,
        ta.name as account_name
      FROM trading_operations o
      LEFT JOIN trading_setups s ON o.setup_id = s.id
      LEFT JOIN trading_accounts ta ON o.account_id = ta.id
      WHERE o.user_id = $1
      ORDER BY o.date DESC, o.created_at DESC
      LIMIT 20
    `, [decoded.userId])

    return NextResponse.json({
      accounts: accountsRes.rows,
      accountStats: accountStats.rows,
      recentOps: recentOps.rows
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
