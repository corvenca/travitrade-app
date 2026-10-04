import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import nodemailer from 'nodemailer'
import crypto from 'crypto'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = String(body.email || '').trim().toLowerCase()

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Formato de email inválido' }, { status: 400, headers: corsHeaders })
    }

    const existing = await pool.query('SELECT id FROM users WHERE LOWER(email) = $1', [email])
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Este email ya está registrado' }, { status: 400, headers: corsHeaders })
    }

    // Generar token único
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutos

    // Eliminar tokens anteriores
    await pool.query('DELETE FROM email_verifications WHERE email = $1', [email])

    // Guardar token
    await pool.query(
      'INSERT INTO email_verifications (email, code, expires_at) VALUES ($1, $2, $3)',
      [email, token, expiresAt]
    )

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost'))
      ? process.env.NEXT_PUBLIC_APP_URL
      : 'https://app.travitrade.com'

    const verifyUrl = `${appUrl}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    })

    await transporter.sendMail({
      from: `"Travitrade" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '✉ Verifica tu correo — Travitrade',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #0a1a0f; color: #fff; padding: 32px; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <img src="https://travitrade.com/assets/images/Logo.png" alt="Travitrade" style="height: 44px;" />
          </div>
          <h2 style="text-align: center; font-size: 20px; margin-bottom: 8px;">Verifica tu correo electrónico</h2>
          <p style="color: rgba(255,255,255,0.6); text-align: center; font-size: 14px; margin-bottom: 28px; line-height: 1.6;">
            Haz clic en el botón para confirmar tu correo y continuar con el registro.
          </p>
          <div style="text-align: center; margin-bottom: 28px;">
            <a href="${verifyUrl}"
              style="display: inline-block; background: #1D9E75; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 15px; font-weight: 500;">
              ✓ Verificar correo y continuar →
            </a>
          </div>
          <div style="background: #0d1f14; border-radius: 8px; padding: 14px; margin-bottom: 20px; border: 0.5px solid #1a3a24;">
            <p style="color: rgba(255,255,255,0.4); font-size: 12px; margin: 0; text-align: center; line-height: 1.6;">
              Este enlace es válido por 30 minutos.<br/>
              Si no solicitaste este registro ignora este mensaje.
            </p>
          </div>
          <p style="color: rgba(255,255,255,0.3); font-size: 11px; text-align: center;">
            <a href="mailto:atencionalcliente@travitrade.com" style="color: #1D9E75;">atencionalcliente@travitrade.com</a> · travitrade.com
          </p>
        </div>
      `
    })

    return NextResponse.json({ success: true }, { headers: corsHeaders })
  } catch (error: any) {
    console.error('Send verification error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })
  }
}
