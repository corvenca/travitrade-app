import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import pool from '@/lib/db'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-03-31.basil' as any
})

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'travitrade_secret_2025') as any
    if (!decoded.isAdmin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

    const { email } = await request.json()

    // Buscar cliente en Stripe por email
    const customers = await stripe.customers.list({ email, limit: 1 })

    if (customers.data.length === 0) {
      return NextResponse.json({ error: 'No se encontró cliente en Stripe con ese email' }, { status: 404 })
    }

    const customer = customers.data[0]

    // Buscar suscripciones activas
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1
    })

    if (subscriptions.data.length === 0) {
      return NextResponse.json({ error: 'No hay suscripciones activas en Stripe' }, { status: 404 })
    }

    const sub = subscriptions.data[0]
    const interval = sub.items.data[0]?.price?.recurring?.interval
    const billingCycle = interval === 'year' ? 'annual' : 'monthly'

    // Actualizar plan en DB
    await pool.query(
      'UPDATE users SET plan = $1, billing_cycle = $2, stripe_customer_id = $3, updated_at = NOW() WHERE email = $4',
      ['pro', billingCycle, customer.id, email]
    )

    return NextResponse.json({
      success: true,
      message: `Plan Pro (${billingCycle}) activado para ${email}`
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
