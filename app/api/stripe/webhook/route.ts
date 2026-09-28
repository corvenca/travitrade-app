import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import pool from '@/lib/db'
import nodemailer from 'nodemailer'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-03-31.basil' as any
})

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature') || ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET || '')
    console.log('WEBHOOK event:', event.type)
  } catch (err: any) {
    console.error('Webhook error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed' || event.type === 'invoice.payment_succeeded') {
    try {
      let customerId: string | null = null
      let customerEmail: string | null = null
      let userId: string | null = null
      let billingCycle = 'monthly'

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session
        customerId = session.customer as string
        customerEmail = session.customer_email || session.customer_details?.email || null
        userId = session.metadata?.userId || null
        billingCycle = session.metadata?.plan === 'annual' ? 'annual' : 'monthly'
        console.log('Checkout completed - email:', customerEmail, 'userId:', userId)
      }

      if (event.type === 'invoice.payment_succeeded') {
        const invoice = event.data.object as Stripe.Invoice
        customerId = invoice.customer as string
        customerEmail = invoice.customer_email || null
        if (invoice.subscription) {
          const sub = await stripe.subscriptions.retrieve(invoice.subscription as string)
          const interval = sub.items.data[0]?.price?.recurring?.interval
          billingCycle = interval === 'year' ? 'annual' : 'monthly'
        }
        console.log('Invoice paid - email:', customerEmail)
      }

      // Obtener email del cliente de Stripe si no lo tenemos
      if (!customerEmail && customerId) {
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer
        customerEmail = customer.email || null
        console.log('Email from Stripe customer:', customerEmail)
      }

      // Buscar usuario por userId primero, luego por email
      let userFound = false

      if (userId) {
        const result = await pool.query(
          'UPDATE users SET plan = $1, billing_cycle = $2, stripe_customer_id = $3, updated_at = NOW() WHERE id = $4 RETURNING id, email',
          ['pro', billingCycle, customerId, userId]
        )
        if (result.rows.length > 0) {
          userFound = true
          console.log('Plan actualizado por userId:', result.rows[0].email)
          customerEmail = result.rows[0].email
        }
      }

      // Si no se encontró por userId, buscar por email
      if (!userFound && customerEmail) {
        const result = await pool.query(
          'UPDATE users SET plan = $1, billing_cycle = $2, stripe_customer_id = $3, updated_at = NOW() WHERE email = $4 RETURNING id, email',
          ['pro', billingCycle, customerId, customerEmail]
        )
        if (result.rows.length > 0) {
          userFound = true
          console.log('Plan actualizado por email:', result.rows[0].email)
        }
      }

      // Si no existe el usuario, crearlo automáticamente
      if (!userFound && customerEmail) {
        console.log('Usuario no encontrado en DB — creando cuenta automática para:', customerEmail)
        const customer = customerId ? await stripe.customers.retrieve(customerId) as Stripe.Customer : null
        const nombre = customer?.name?.split(' ')[0] || 'Cliente'
        const apellido = customer?.name?.split(' ').slice(1).join(' ') || ''
        const username = customerEmail.split('@')[0]

        await pool.query(`
          INSERT INTO users (nombre, apellido, email, username, plan, billing_cycle, stripe_customer_id, password_hash)
          VALUES ($1, $2, $3, $4, 'pro', $5, $6, 'stripe_auto')
          ON CONFLICT (email) DO UPDATE SET
            plan = 'pro',
            billing_cycle = $5,
            stripe_customer_id = $6,
            updated_at = NOW()
        `, [nombre, apellido, customerEmail, username, billingCycle, customerId])

        console.log('Cuenta creada/actualizada automáticamente para:', customerEmail)
      }

      // Enviar email de bienvenida Pro
      if (customerEmail) {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: false,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        })

        await transporter.sendMail({
          from: `"Travitrade" <${process.env.SMTP_USER}>`,
          to: customerEmail,
          subject: '🎉 ¡Bienvenido a Travi Journals Pro!',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a1a0f; color: #fff; padding: 32px; border-radius: 12px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <img src="https://travitrade.com/assets/images/Logo.png" alt="Travitrade" style="height: 48px;" />
              </div>
              <div style="text-align: center; margin-bottom: 20px; font-size: 48px;">🎉</div>
              <h2 style="text-align: center; color: #1D9E75; margin-bottom: 8px;">¡Tu plan Pro está activo!</h2>
              <p style="color: rgba(255,255,255,0.7); text-align: center; margin-bottom: 24px; line-height: 1.6;">
                ${billingCycle === 'annual' ? 'Suscripción anual ($50/año)' : 'Suscripción mensual ($5.99/mes)'} activada correctamente.
              </p>
              <div style="background: #0d1f14; border-radius: 10px; padding: 20px; border: 0.5px solid #1D9E75; margin-bottom: 24px;">
                ${['✓ Operaciones ilimitadas', '✓ Cuentas ilimitadas', '✓ Reportes avanzados PDF', '✓ Análisis de setups completo', '✓ Soporte prioritario'].map(b => `<div style="padding: 6px 0; border-bottom: 0.5px solid #1a3a24; font-size: 13px; color: #9FE1CB;">${b}</div>`).join('')}
              </div>
              <div style="text-align: center; margin-bottom: 24px;">
                <a href="https://journals.travitrade.com" style="display: inline-block; background: #1D9E75; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500;">
                  Ir a Travi Journals →
                </a>
              </div>
              <p style="color: rgba(255,255,255,0.3); font-size: 11px; text-align: center;">
                Controla tu trading. Domina tus finanzas.<br>
                <a href="mailto:atencionalcliente@travitrade.com" style="color: #1D9E75;">atencionalcliente@travitrade.com</a>
              </p>
            </div>
          `
        }).catch(e => console.error('Email error:', e.message))
      }

    } catch (err: any) {
      console.error('Error procesando webhook:', err.message)
    }
  }

  // Suscripción pausada
  if (event.type === 'customer.subscription.paused') {
    const subscription = event.data.object as Stripe.Subscription
    await pool.query(
      "UPDATE users SET plan = 'free' WHERE stripe_customer_id = $1",
      [subscription.customer as string]
    ).catch(e => console.error('Error pausando plan:', e.message))
    console.log('Plan pausado para customer:', subscription.customer)
  }

  // Suscripción reanudada
  if (event.type === 'customer.subscription.resumed') {
    const subscription = event.data.object as Stripe.Subscription
    const interval = subscription.items.data[0]?.price?.recurring?.interval
    await pool.query(
      "UPDATE users SET plan = 'pro', billing_cycle = $1 WHERE stripe_customer_id = $2",
      [interval === 'year' ? 'annual' : 'monthly', subscription.customer as string]
    ).catch(e => console.error('Error reanudando plan:', e.message))
    console.log('Plan reanudado para customer:', subscription.customer)
  }

  // Pago fallido — notificar al usuario
  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as Stripe.Invoice
    const customerEmail = invoice.customer_email
    console.log('Pago fallido para:', customerEmail)

    if (customerEmail) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      })

      await transporter.sendMail({
        from: `"Travitrade" <${process.env.SMTP_USER}>`,
        to: customerEmail,
        subject: '⚠️ Problema con tu pago — Travitrade',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a1a0f; color: #fff; padding: 32px; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <img src="https://travitrade.com/assets/images/Logo.png" alt="Travitrade" style="height: 48px;" />
            </div>
            <h2 style="color: #E24B4A; text-align: center;">⚠️ Problema con tu pago</h2>
            <p style="color: rgba(255,255,255,0.7); text-align: center; line-height: 1.6; margin-bottom: 24px;">
              No pudimos procesar el pago de tu suscripción Pro. Por favor actualiza tu método de pago para mantener el acceso.
            </p>
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="https://app.travitrade.com/upgrade" style="display: inline-block; background: #1D9E75; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500;">
                Actualizar método de pago →
              </a>
            </div>
            <p style="color: rgba(255,255,255,0.4); font-size: 12px; text-align: center;">
              Si necesitas ayuda escríbenos a <a href="mailto:atencionalcliente@travitrade.com" style="color: #1D9E75;">atencionalcliente@travitrade.com</a>
            </p>
          </div>
        `
      }).catch(e => console.error('Email pago fallido error:', e.message))
    }
  }

  // Suscripción actualizada (cambio de plan)
  if (event.type === 'customer.subscription.updated') {
    const subscription = event.data.object as Stripe.Subscription
    const interval = subscription.items.data[0]?.price?.recurring?.interval
    const billingCycle = interval === 'year' ? 'annual' : 'monthly'
    const status = subscription.status

    if (status === 'active') {
      await pool.query(
        "UPDATE users SET plan = 'pro', billing_cycle = $1 WHERE stripe_customer_id = $2",
        [billingCycle, subscription.customer as string]
      ).catch(e => console.error('Error actualizando plan:', e.message))
    } else if (status === 'canceled' || status === 'unpaid') {
      await pool.query(
        "UPDATE users SET plan = 'free' WHERE stripe_customer_id = $1",
        [subscription.customer as string]
      ).catch(e => console.error('Error actualizando plan cancelado:', e.message))
    }
    console.log('Suscripción actualizada:', status, 'para customer:', subscription.customer)
  }

  // Cancelación de suscripción
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string

    await pool.query(
      "UPDATE users SET plan = 'free', billing_cycle = NULL WHERE stripe_customer_id = $1",
      [customerId]
    ).catch(e => console.error('Error cancelando plan:', e.message))

    console.log('Plan cancelado para customer:', customerId)
  }

  return NextResponse.json({ received: true })
}
