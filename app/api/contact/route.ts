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
  return new NextResponse(null, { headers: corsHeaders })
}

export async function POST(request: Request) {
  try {
    const { asunto, categoria, mensaje, nombre, email } = await request.json()

    if (!asunto || !mensaje) {
      return NextResponse.json({ error: 'Asunto y mensaje son obligatorios' }, { status: 400, headers: corsHeaders })
    }

    // Obtener datos del usuario logueado si existe
    let userData = { nombre, email }
    try {
      const cookieStore = await cookies()
      const token = cookieStore.get('token')
      if (token) {
        const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'travitrade_secret_2025') as any
        const userRes = await pool.query('SELECT nombre, apellido, email, plan FROM users WHERE id = $1', [decoded.userId])
        if (userRes.rows.length > 0) {
          const u = userRes.rows[0]
          userData = { nombre: `${u.nombre} ${u.apellido || ''}`.trim(), email: u.email, ...u }
        }
      }
    } catch {}

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    })

    // Email al equipo de Travitrade
    await transporter.sendMail({
      from: `"Travitrade Contacto" <${process.env.SMTP_USER}>`,
      to: 'atencionalcliente@travitrade.com',
      replyTo: userData.email,
      subject: `[${categoria || 'Consulta'}] ${asunto}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a1a0f; color: #fff; padding: 32px; border-radius: 12px;">
          <div style="background: #1D9E75; padding: 12px 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 18px;">Nueva consulta desde Travitrade App</h2>
            <p style="margin: 4px 0 0; opacity: 0.8; font-size: 13px;">Categoría: ${categoria || 'General'}</p>
          </div>
          <div style="background: #0d1f14; padding: 16px; border-radius: 8px; margin-bottom: 16px; border: 0.5px solid #1a3a24;">
            <h3 style="margin: 0 0 12px; font-size: 14px; color: #9FE1CB;">Datos del cliente</h3>
            <p style="margin: 4px 0;"><strong>Nombre:</strong> ${userData.nombre || '—'}</p>
            <p style="margin: 4px 0;"><strong>Email:</strong> ${userData.email || '—'}</p>
            <p style="margin: 4px 0;"><strong>Plan:</strong> ${(userData as any).plan || 'No registrado'}</p>
          </div>
          <div style="background: #0d1f14; padding: 16px; border-radius: 8px; border: 0.5px solid #1a3a24;">
            <h3 style="margin: 0 0 8px; font-size: 14px; color: #9FE1CB;">Asunto: ${asunto}</h3>
            <p style="margin: 0; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${mensaje}</p>
          </div>
        </div>
      `
    })

    // Email de confirmación al usuario
    if (userData.email) {
      await transporter.sendMail({
        from: `"Travitrade" <${process.env.SMTP_USER}>`,
        to: userData.email,
        subject: 'Recibimos tu consulta — Travitrade',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a1a0f; color: #fff; padding: 32px; border-radius: 12px;">
            <h1 style="color: #1D9E75; font-size: 22px; margin-bottom: 4px;">travitrade</h1>
            <h2 style="font-size: 18px; margin-bottom: 16px;">¡Recibimos tu consulta! 👋</h2>
            <p style="color: rgba(255,255,255,0.7); line-height: 1.6; margin-bottom: 20px;">
              Hola ${userData.nombre?.split(' ')[0] || ''},<br><br>
              Recibimos tu mensaje y nuestro equipo te responderá en menos de 24 horas al correo <strong>${userData.email}</strong>.
            </p>
            <div style="background: #0d1f14; border-radius: 8px; padding: 16px; border: 0.5px solid #1a3a24; margin-bottom: 20px;">
              <p style="color: rgba(255,255,255,0.5); font-size: 12px; margin: 0 0 6px;">TU CONSULTA</p>
              <p style="font-weight: 500; margin: 0 0 8px;">${asunto}</p>
              <p style="color: rgba(255,255,255,0.6); font-size: 13px; margin: 0; line-height: 1.5;">${mensaje}</p>
            </div>
            <p style="color: rgba(255,255,255,0.4); font-size: 12px;">
              Si necesitas ayuda inmediata escríbenos a atencionalcliente@travitrade.com<br>
              El equipo de Travitrade
            </p>
          </div>
        `
      }).catch(() => {})
    }

    return NextResponse.json({ success: true }, { headers: corsHeaders })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })
  }
}
