import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('travitrade_session')
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'travitrade_secret_2025') as any
    if (!decoded.isAdmin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

    const totalUsers = await pool.query('SELECT COUNT(*) FROM users')
    const proUsers = await pool.query("SELECT COUNT(*) FROM users WHERE plan = 'pro'")
    const freeUsers = await pool.query("SELECT COUNT(*) FROM users WHERE plan = 'free' OR plan IS NULL")
    const newThisMonth = await pool.query("SELECT COUNT(*) FROM users WHERE created_at >= date_trunc('month', NOW())")

    const total = parseInt(totalUsers.rows[0].count)
    const pro = parseInt(proUsers.rows[0].count)
    const free = parseInt(freeUsers.rows[0].count)
    const newMonth = parseInt(newThisMonth.rows[0].count)

    return NextResponse.json({
      totalUsers: total,
      proUsers: pro,
      freeUsers: free,
      newThisMonth: newMonth,
      monthlyRevenue: pro * 5.99,
      conversionRate: total > 0 ? ((pro / total) * 100).toFixed(1) : 0
    })
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 })
  }
}
