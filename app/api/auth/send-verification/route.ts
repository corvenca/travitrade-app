import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import nodemailer from 'nodemailer'
import { randomInt } from 'crypto'

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

    // Validar formato de email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Formato de email inválido' }, { status: 400, headers: corsHeaders })
    }

    // Verificar si el email ya está registrado
    const existing = await pool.query('SELECT id FROM users WHERE LOWER(email) = $1', [email])
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Este email ya está registrado' }, { status: 400, headers: corsHeaders })
    }

    // Generar código de 6 dígitos
    const code = randomInt(100000, 1000000).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutos

    // Eliminar códigos anteriores del mismo email
    await pool.query('DELETE FROM email_verifications WHERE email = $1', [email])

    // Guardar nuevo código
    await pool.query(
      'INSERT INTO email_verifications (email, code, expires_at) VALUES ($1, $2, $3)',
      [email, code, expiresAt]
    )

    // Enviar email con el código
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    })

    await transporter.sendMail({
      from: `"Travitrade" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `${code} — Código de verificación Travitrade`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #0a1a0f; color: #fff; padding: 32px; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <img src="https://travitrade.com/assets/images/Logo.png" alt="Travitrade" style="height: 44px;" />
          </div>
          <h2 style="text-align: center; font-size: 20px; margin-bottom: 8px;">Verifica tu correo</h2>
          <p style="color: rgba(255,255,255,0.6); text-align: center; font-size: 14px; margin-bottom: 28px;">
            Usa este código para completar tu registro en Travitrade.
          </p>
          <div style="background: #0d1f14; border: 1px solid #1D9E75; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <div style="font-size: 10px; color: rgba(159,225,203,0.4); letter-spacing: 3px; margin-bottom: 10px;">TU CÓDIGO DE VERIFICACIÓN</div>
            <div style="font-size: 42px; font-weight: 700; color: #1D9E75; letter-spacing: 10px;">${code}</div>
            <div style="font-size: 12px; color: rgba(255,255,255,0.3); margin-top: 10px;">Válido por 15 minutos</div>
          </div>
          <p style="color: rgba(255,255,255,0.3); font-size: 12px; text-align: center; line-height: 1.6;">
            Si no solicitaste este código ignora este mensaje.<br>
            <a href="mailto:atencionalcliente@travitrade.com" style="color: #1D9E75;">atencionalcliente@travitrade.com</a>
          </p>
        </div>
      `
    })

    return NextResponse.json({ success: true, message: 'Código enviado a tu correo' }, { headers: corsHeaders })
  } catch (error: any) {
    console.error('Send verification error:', error.message)
    return NextResponse.json({ error: 'No se pudo enviar el código' }, { status: 500, headers: corsHeaders })
  }
}
