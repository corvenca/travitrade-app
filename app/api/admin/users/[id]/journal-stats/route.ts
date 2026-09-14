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

    // Cuentas del usuario
    const accountsRes = await pool.query(
      'SELECT * FROM trading_accounts WHERE user_id = $1 ORDER BY created_at ASC',
      [id]
    )

    // Estadísticas globales del usuario
    const globalStats = await pool.query(`
      SELECT
        COUNT(*) as total_ops,
        COALESCE(SUM(pnl), 0) as total_pnl,
        COALESCE(SUM(comision), 0) as total_comision,
        COALESCE(SUM(CASE WHEN result_type = 'GANADA' THEN 1 ELSE 0 END), 0) as wins,
        COALESCE(SUM(CASE WHEN result_type = 'PERDIDA' THEN 1 ELSE 0 END), 0) as losses,
        COALESCE(SUM(CASE WHEN result_type = 'BREAK_EVEN' THEN 1 ELSE 0 END), 0) as be,
        MAX(pnl) as best_trade,
        MIN(pnl) as worst_trade,
        MAX(date) as last_operation,
        MIN(date) as first_operation
      FROM trading_operations
      WHERE user_id = $1
    `, [id])

    // Estadísticas por cuenta
    const accountStats = await pool.query(`
      SELECT
        ta.id, ta.name, ta.broker, ta.type, ta.initial_capital,
        COUNT(o.id) as total_ops,
        COALESCE(SUM(o.pnl), 0) as total_pnl,
        COALESCE(SUM(CASE WHEN o.result_type = 'GANADA' THEN 1 ELSE 0 END), 0) as wins,
        COALESCE(SUM(CASE WHEN o.result_type = 'PERDIDA' THEN 1 ELSE 0 END), 0) as losses,
        COALESCE(SUM(CASE WHEN o.result_type = 'BREAK_EVEN' THEN 1 ELSE 0 END), 0) as be,
        MAX(o.date) as last_operation
      FROM trading_accounts ta
      LEFT JOIN trading_operations o ON ta.id = o.account_id
      WHERE ta.user_id = $1
      GROUP BY ta.id, ta.name, ta.broker, ta.type, ta.initial_capital
      ORDER BY total_ops DESC
    `, [id])

    // Últimas 10 operaciones
    const recentOps = await pool.query(`
      SELECT o.*, s.name as setup_name, ta.name as account_name
      FROM trading_operations o
      LEFT JOIN trading_setups s ON o.setup_id = s.id
      LEFT JOIN trading_accounts ta ON o.account_id = ta.id
      WHERE o.user_id = $1
      ORDER BY o.date DESC, o.created_at DESC
      LIMIT 10
    `, [id])

    // Setups del usuario
    const setupsRes = await pool.query(
      'SELECT * FROM trading_setups WHERE user_id = $1',
      [id]
    )

    // Actividad por mes (últimos 6 meses)
    const monthlyActivity = await pool.query(`
      SELECT
        to_char(date::date, 'Mon YY') as month,
        COUNT(*) as ops,
        COALESCE(SUM(pnl), 0) as pnl
      FROM trading_operations
      WHERE user_id = $1
        AND date::date >= NOW() - INTERVAL '6 months'
      GROUP BY date_trunc('month', date::date), to_char(date::date, 'Mon YY')
      ORDER BY date_trunc('month', date::date) ASC
    `, [id])

    const stats = globalStats.rows[0] || {}
    const totalOps = parseInt(stats.total_ops || '0', 10)
    const wins = parseInt(stats.wins || '0', 10)
    const winRate = totalOps > 0
      ? ((wins / totalOps) * 100).toFixed(1)
      : 0

    return NextResponse.json({
      accounts: accountsRes.rows,
      accountStats: accountStats.rows,
      globalStats: { ...stats, winRate },
      recentOps: recentOps.rows,
      setups: setupsRes.rows,
      monthlyActivity: monthlyActivity.rows
    })
  } catch (error: any) {
    console.error('Error fetching journal stats:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
