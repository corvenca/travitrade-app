import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import pool from '@/lib/db'

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
    const body = await request.json()
    console.log('CONTACT POST recibido:', JSON.stringify(body))
    console.log('SMTP_HOST:', process.env.SMTP_HOST)
    console.log('SMTP_USER exists:', !!process.env.SMTP_USER)
    console.log('SMTP_PASS exists:', !!process.env.SMTP_PASS)

    const { asunto, categoria, mensaje, nombre, email } = body

    if (!asunto || !mensaje) {
      return NextResponse.json({ error: 'Asunto y mensaje son obligatorios' }, { status: 400, headers: corsHeaders })
    }

    // Obtener datos completos del usuario logueado
    let userData: any = { nombre, email }
    try {
      const cookieStore = await cookies()
      const token = cookieStore.get('token')
      if (token) {
        const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'travitrade_secret_2025') as any
        const userRes = await pool.query(
          'SELECT nombre, apellido, email, telefono, pais, plan, username FROM users WHERE id = $1',
          [decoded.userId]
        )
        if (userRes.rows.length > 0) {
          const u = userRes.rows[0]
          userData = {
            nombre: `${u.nombre || ''} ${u.apellido || ''}`.trim(),
            email: u.email,
            telefono: u.telefono,
            pais: u.pais,
            plan: u.plan,
            username: u.username
          }
        }
      }
    } catch (e) {
      console.log('No hay token o error:', e)
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    })

    console.log('Intentando enviar email a atencionalcliente@travitrade.com')

    // Email al equipo de Travitrade
    await transporter.sendMail({
      from: `"Travitrade Contacto" <${process.env.SMTP_USER}>`,
      to: 'atencionalcliente@travitrade.com',
      replyTo: userData.email,
      subject: `[${categoria || 'Consulta'}] ${asunto}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a1a0f; color: #fff; padding: 32px; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 16px;">
            <img src="https://travitrade.com/assets/images/Logo.png" alt="Travitrade" style="height: 40px; width: auto; margin-bottom: 8px;" />
          </div>
          <div style="background: #1D9E75; padding: 12px 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 18px;">Nueva consulta desde Travitrade App</h2>
            <p style="margin: 4px 0 0; opacity: 0.8; font-size: 13px;">Categoría: ${categoria || 'General'}</p>
          </div>
          <div style="background: #0d1f14; padding: 16px; border-radius: 8px; margin-bottom: 16px; border: 0.5px solid #1a3a24;">
            <h3 style="margin: 0 0 12px; font-size: 14px; color: #9FE1CB;">Datos del cliente</h3>
            <p style="margin: 4px 0;"><strong>Nombre:</strong> ${userData.nombre || '—'}</p>
            <p style="margin: 4px 0;"><strong>Email:</strong> ${userData.email || '—'}</p>
            <p style="margin: 4px 0;"><strong>Teléfono:</strong> ${userData.telefono || '—'}</p>
            <p style="margin: 4px 0;"><strong>País:</strong> ${userData.pais || '—'}</p>
            <p style="margin: 4px 0;"><strong>Plan:</strong> ${userData.plan || '—'}</p>
            <p style="margin: 4px 0;"><strong>Usuario:</strong> @${userData.username || '—'}</p>
          </div>
          <div style="background: #0d1f14; padding: 16px; border-radius: 8px; margin-bottom: 16px; border: 0.5px solid #1a3a24;">
            <h3 style="margin: 0 0 8px; font-size: 14px; color: #9FE1CB;">Asunto: ${asunto}</h3>
            <p style="margin: 0; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${mensaje}</p>
          </div>
        </div>
      `
    })

    console.log('Email enviado exitosamente')

    // Email de confirmación al usuario
    if (userData.email) {
      try {
        await transporter.sendMail({
          from: `"Travitrade" <${process.env.SMTP_USER}>`,
          to: userData.email,
          subject: '✅ Recibimos tu consulta — Travitrade',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a1a0f; color: #fff; padding: 32px; border-radius: 12px;">

              <!-- Header con Logo -->
              <div style="text-align: center; margin-bottom: 28px; padding-bottom: 20px; border-bottom: 0.5px solid #1a3a24;">
                <img src="https://travitrade.com/assets/images/Logo.png" alt="Travitrade" style="height: 48px; width: auto; margin-bottom: 10px;" />
                <div style="font-size: 11px; color: #1D9E75; letter-spacing: 3px; font-weight: 500;">Herramientas para traders serios</div>
              </div>

              <!-- Icono éxito -->
              <div style="text-align: center; margin-bottom: 20px;">
                <div style="display: inline-block; width: 56px; height: 56px; background: rgba(29,158,117,0.15); border: 2px solid #1D9E75; border-radius: 50%; line-height: 56px; font-size: 26px;">✅</div>
              </div>

              <!-- Título -->
              <h2 style="font-size: 20px; text-align: center; color: #fff; margin-bottom: 8px;">¡Recibimos tu consulta!</h2>
              <p style="color: rgba(255,255,255,0.6); text-align: center; font-size: 14px; margin-bottom: 28px; line-height: 1.6;">
                Hola <strong style="color: #fff">${userData.nombre?.split(' ')[0] || 'trader'}</strong>, nuestro equipo te responderá a la brevedad posible.
              </p>

              <!-- Detalle consulta -->
              <div style="background: #0d1f14; border-radius: 10px; padding: 20px; border: 0.5px solid #1a3a24; margin-bottom: 20px;">
                <div style="font-size: 10px; color: rgba(159,225,203,0.4); letter-spacing: 2px; margin-bottom: 10px;">TU CONSULTA</div>
                <div style="font-size: 14px; font-weight: 600; color: #fff; margin-bottom: 8px;">${asunto}</div>
                <div style="font-size: 13px; color: rgba(255,255,255,0.6); line-height: 1.6; border-top: 0.5px solid #1a3a24; padding-top: 10px;">${mensaje}</div>
              </div>

              <!-- Datos -->
              <div style="background: #0d1f14; border-radius: 10px; padding: 16px; border: 0.5px solid #1a3a24; margin-bottom: 24px;">
                <div style="font-size: 10px; color: rgba(159,225,203,0.4); letter-spacing: 2px; margin-bottom: 10px;">TUS DATOS</div>
                <div style="font-size: 13px; color: rgba(255,255,255,0.7); line-height: 2;">
                  <span style="color: rgba(255,255,255,0.4);">Nombre:</span> ${userData.nombre || '—'}<br>
                  <span style="color: rgba(255,255,255,0.4);">Email:</span> ${userData.email}<br>
                  <span style="color: rgba(255,255,255,0.4);">Plan:</span> ${userData.plan || 'Free'}
                </div>
              </div>

              <!-- CTA -->
              <div style="text-align: center; margin-bottom: 28px;">
                <a href="https://app.travitrade.com/dashboard"
                  style="display: inline-block; background: #1D9E75; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500; margin-right: 10px;">
                  Ir a mi Dashboard →
                </a>
                <a href="https://travitrade.com"
                  style="display: inline-block; background: transparent; color: #1D9E75; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-size: 14px; border: 1px solid #1D9E75;">
                  travitrade.com
                </a>
              </div>

              <!-- Footer -->
              <div style="border-top: 0.5px solid #1a3a24; padding-top: 20px; text-align: center;">
                <p style="color: rgba(255,255,255,0.3); font-size: 11px; line-height: 2; margin: 0;">
                  Controla tu trading. Domina tus finanzas.<br>
                  <a href="mailto:atencionalcliente@travitrade.com" style="color: #1D9E75; text-decoration: none;">atencionalcliente@travitrade.com</a><br>
                  <a href="https://travitrade.com" style="color: rgba(255,255,255,0.3); text-decoration: none;">travitrade.com</a> ·
                  <a href="https://instagram.com/travitrade" style="color: rgba(255,255,255,0.3); text-decoration: none;">@travitrade</a>
                </p>
              </div>
            </div>
          `
        })
        console.log('Email de confirmacion enviado a:', userData.email)
      } catch (emailError: any) {
        console.error('Error enviando email de confirmacion:', emailError.message)
      }
    }

    return NextResponse.json({ success: true }, { headers: corsHeaders })
  } catch (error: any) {
    console.error('CONTACT ERROR:', error.message)
    console.error('STACK:', error.stack)
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })
  }
}
