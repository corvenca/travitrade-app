import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('travitrade_session') || cookieStore.get('token')
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'travitrade_secret_2025') as any
    if (!decoded.isAdmin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

    // No permitir eliminar al admin principal
    const userCheck = await pool.query('SELECT email FROM users WHERE id = $1', [id])
    if (userCheck.rows[0]?.email === 'altuveronalbis@gmail.com') {
      return NextResponse.json({ error: 'No puedes eliminar al administrador principal' }, { status: 403 })
    }

    // Eliminar datos relacionados primero
    await pool.query('DELETE FROM trading_operations WHERE user_id = $1', [id])
    await pool.query('DELETE FROM trading_setups WHERE user_id = $1', [id])
    await pool.query('DELETE FROM trading_accounts WHERE user_id = $1', [id])
    await pool.query('DELETE FROM chat_sessions WHERE user_email = (SELECT email FROM users WHERE id = $1)', [id])
    await pool.query('DELETE FROM users WHERE id = $1', [id])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
