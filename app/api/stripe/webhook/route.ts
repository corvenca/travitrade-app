import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import pool from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-03-31.basil' as any
})

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature') || ''

  console.log('WEBHOOK recibido - sig exists:', !!sig)
  console.log('WEBHOOK_SECRET exists:', !!process.env.STRIPE_WEBHOOK_SECRET)

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET || '')
    console.log('WEBHOOK event type:', event.type)
  } catch (err: any) {
    console.error('WEBHOOK signature error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    console.log('CHECKOUT COMPLETED - metadata:', JSON.stringify(session.metadata))
    console.log('CHECKOUT COMPLETED - customer:', session.customer)

    const userId = session.metadata?.userId
    const plan = session.metadata?.plan

    console.log('userId:', userId, 'plan:', plan)

    if (userId) {
      const result = await pool.query(
        'UPDATE users SET plan = $1, billing_cycle = $2, stripe_customer_id = $3, updated_at = NOW() WHERE id = $4 RETURNING id, email, plan',
        ['pro', plan === 'annual' ? 'annual' : 'monthly', session.customer, userId]
      )
      console.log('Plan actualizado:', JSON.stringify(result.rows))
    } else {
      console.error('NO userId en metadata - no se puede actualizar plan')
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string
    await pool.query(
      "UPDATE users SET plan = 'free', billing_cycle = NULL WHERE stripe_customer_id = $1",
      [customerId]
    )
    console.log('Suscripcion cancelada para customer:', customerId)
  }

  return NextResponse.json({ received: true })
}
