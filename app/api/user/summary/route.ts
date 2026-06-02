import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('travitrade_session') || cookieStore.get('token')
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'travitrade_secret_2025') as any

    const userId = decoded.userId

    // Total operaciones del usuario
    let totalOps = 0
    let winRate = 0
    let totalPnl = 0
    let thisMonthPnl = 0
    let totalAccounts = 0
    let bestTrade = 0
    let worstTrade = 0
    let totalWins = 0
    let totalLosses = 0
    let totalBE = 0
    let userName = 'Usuario'

    try {
      const userRes = await pool.query('SELECT nombre FROM users WHERE id = $1', [userId])
      if (userRes.rows.length > 0) {
        userName = userRes.rows[0].nombre
      }
    } catch {}

    try {
      const opsRes = await pool.query(`
        SELECT
          COUNT(*) as total,
          SUM(pnl) as total_pnl,
          SUM(CASE WHEN result_type = 'GANADA' THEN 1 ELSE 0 END) as wins,
          SUM(CASE WHEN result_type = 'PERDIDA' THEN 1 ELSE 0 END) as losses,
          SUM(CASE WHEN result_type = 'BREAK_EVEN' THEN 1 ELSE 0 END) as be,
          MAX(pnl) as best_trade,
          MIN(pnl) as worst_trade,
          SUM(CASE WHEN date >= date_trunc('month', NOW()::date) THEN pnl ELSE 0 END) as month_pnl
        FROM trading_operations
        WHERE user_id = $1
      `, [userId])

      const row = opsRes.rows[0]
      totalOps = parseInt(row.total) || 0
      totalPnl = parseFloat(row.total_pnl) || 0
      thisMonthPnl = parseFloat(row.month_pnl) || 0
      totalWins = parseInt(row.wins) || 0
      totalLosses = parseInt(row.losses) || 0
      totalBE = parseInt(row.be) || 0
      bestTrade = parseFloat(row.best_trade) || 0
      worstTrade = parseFloat(row.worst_trade) || 0
      winRate = totalOps > 0 ? ((totalWins / totalOps) * 100) : 0
    } catch {}

    try {
      const accRes = await pool.query('SELECT COUNT(*) FROM trading_accounts WHERE user_id = $1', [userId])
      totalAccounts = parseInt(accRes.rows[0].count) || 0
    } catch {}

    return NextResponse.json({
      totalOps,
      winRate: winRate.toFixed(1),
      totalPnl: totalPnl.toFixed(2),
      thisMonthPnl: thisMonthPnl.toFixed(2),
      totalAccounts,
      bestTrade: bestTrade.toFixed(2),
      worstTrade: worstTrade.toFixed(2),
      totalWins,
      totalLosses,
      totalBE,
      userName
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
