import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import pool from '@/lib/db'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-03-31.basil' as any
})

export async function POST() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'travitrade_secret_2025') as any

    // Obtener stripe_customer_id del usuario
    const userRes = await pool.query(
      'SELECT stripe_customer_id, plan FROM users WHERE id = $1',
      [decoded.userId]
    )
    if (userRes.rows.length === 0) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

    const { stripe_customer_id, plan } = userRes.rows[0]

    if (!stripe_customer_id) {
      return NextResponse.json({ error: 'No tienes una suscripción activa de Stripe' }, { status: 400 })
    }

    // Obtener suscripciones activas del cliente
    const subscriptions = await stripe.subscriptions.list({
      customer: stripe_customer_id,
      status: 'active'
    })

    if (subscriptions.data.length === 0) {
      return NextResponse.json({ error: 'No tienes suscripciones activas' }, { status: 400 })
    }

    // Cancelar al final del período actual
    await stripe.subscriptions.update(subscriptions.data[0].id, {
      cancel_at_period_end: true
    })

    return NextResponse.json({
      success: true,
      message: 'Suscripción cancelada. Mantendrás acceso Pro hasta el final del período actual.'
    })
  } catch (error: any) {
    console.error('Cancel subscription error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
