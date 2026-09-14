import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('travitrade_session') || cookieStore.get('token')
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'travitrade_secret_2025') as any
    if (!decoded.isAdmin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

    // Obtener datos del usuario objetivo
    const result = await pool.query(
      'SELECT id, nombre, email, plan FROM users WHERE id = $1',
      [id]
    )
    if (result.rows.length === 0) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

    const targetUser = result.rows[0]

    // Generar token temporal de acceso (expira en 1 hora)
    const impersonateToken = jwt.sign(
      {
        userId: targetUser.id,
        email: targetUser.email,
        nombre: targetUser.nombre,
        plan: targetUser.plan || 'free',
        impersonatedBy: decoded.email // registro de quién lo impersonó
      },
      process.env.JWT_SECRET || 'travitrade_secret_2025',
      { expiresIn: '1h' }
    )

    const journalsBaseUrl = process.env.JOURNALS_URL || 'http://localhost:3001'

    return NextResponse.json({
      success: true,
      token: impersonateToken,
      user: targetUser,
      journalsUrl: `${journalsBaseUrl}/auth/impersonate?token=${impersonateToken}`
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
