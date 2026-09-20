import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'travitrade_secret_2025') as any

    const { searchParams } = new URL(request.url)
    const setupName = searchParams.get('setup')

    if (setupName) {
      // Traer operaciones de un setup específico con imágenes
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
      `, [decoded.userId, setupName])
      return NextResponse.json({ operations: result.rows })
    }

    // Traer resumen de setups
    const result = await pool.query(`
      SELECT
        s.name as setup_name,
        s.color as setup_color,
        s.direction as setup_direction,
        COUNT(o.id) as total,
        SUM(CASE WHEN o.result_type = 'GANADA' THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN o.result_type = 'PERDIDA' THEN 1 ELSE 0 END) as losses,
        SUM(CASE WHEN o.result_type = 'BREAK_EVEN' THEN 1 ELSE 0 END) as be,
        SUM(o.pnl) as total_pnl,
        COUNT(CASE WHEN o.image_url IS NOT NULL AND o.image_url != '' THEN 1 END) as with_images
      FROM trading_setups s
      LEFT JOIN trading_operations o ON s.id = o.setup_id AND o.user_id = $1
      WHERE s.user_id = $1
      GROUP BY s.name, s.color, s.direction
      ORDER BY total DESC
    `, [decoded.userId])

    return NextResponse.json({ setups: result.rows })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
