import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import pool from '@/lib/db'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20' as any
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders })
}

export async function POST(request: Request) {
  try {
    const { priceId, plan } = await request.json()

    // Verificar si el usuario está logueado
    let userEmail = null
    let userName = null
    let userId = null
    try {
      const cookieStore = await cookies()
      const token = cookieStore.get('token')
      if (token) {
        const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'travitrade_secret_2025') as any
        const userRes = await pool.query('SELECT id, nombre, apellido, email FROM users WHERE id = $1', [decoded.userId])
        if (userRes.rows.length > 0) {
          const u = userRes.rows[0]
          userEmail = u.email
          userName = `${u.nombre} ${u.apellido || ''}`.trim()
          userId = u.id
        }
      }
    } catch {}

    // Crear sesión de checkout en Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade/success?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade?canceled=true`,
      customer_email: userEmail || undefined,
      metadata: {
        userId: userId?.toString() || '',
        plan,
        userName: userName || ''
      },
      subscription_data: {
        metadata: {
          userId: userId?.toString() || '',
          plan
        }
      },
      allow_promotion_codes: true,
      locale: 'es'
    })

    return NextResponse.json({ url: session.url, sessionId: session.id }, { headers: corsHeaders })
  } catch (error: any) {
    console.error('Stripe checkout error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })
  }
}
