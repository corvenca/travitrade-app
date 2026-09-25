import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import pool from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20' as any
})

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature') || ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET || '')
  } catch (err: any) {
    console.error('Webhook error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.userId
    const plan = session.metadata?.plan

    if (userId) {
      await pool.query(
        'UPDATE users SET plan = $1, billing_cycle = $2, stripe_customer_id = $3, updated_at = NOW() WHERE id = $4',
        [
          'pro',
          plan === 'annual' ? 'annual' : 'monthly',
          session.customer,
          userId
        ]
      )
      console.log(`Plan actualizado para usuario ${userId}: pro ${plan}`)
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

export const config = { api: { bodyParser: false } }
