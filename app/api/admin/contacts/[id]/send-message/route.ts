import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('travitrade_session') || cookieStore.get('token')
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'travitrade_secret_2025') as any
    if (!decoded.isAdmin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

    const { subject, message } = await request.json()

    const contactRes = await pool.query('SELECT * FROM contacts WHERE id = $1', [id])
    if (contactRes.rows.length === 0) return NextResponse.json({ error: 'Contacto no encontrado' }, { status: 404 })
    const contact = contactRes.rows[0]

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    })

    await transporter.sendMail({
      from: `"Travitrade Soporte" <${process.env.SMTP_USER}>`,
      to: contact.email,
      subject: subject || 'Mensaje de Travitrade',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a1a0f; color: #fff; padding: 32px; border-radius: 12px;">
          <h1 style="color: #1D9E75; font-size: 22px; margin-bottom: 4px;">travitrade</h1>
          <p style="color: rgba(255,255,255,0.4); font-size: 12px; margin-bottom: 24px;">Código de cliente: <strong style="color:#1D9E75">${contact.code}</strong></p>
          <h2 style="font-size: 18px; margin-bottom: 16px;">Hola, ${contact.nombre} 👋</h2>
          <div style="background: #0d1f14; border-radius: 8px; padding: 16px; border: 0.5px solid #1a3a24; margin-bottom: 24px; line-height: 1.6;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <p style="color: rgba(255,255,255,0.4); font-size: 12px; text-align: center;">
            El equipo de Travitrade · atencionalcliente@travitrade.com
          </p>
        </div>
      `
    })

    // Actualizar último contacto
    await pool.query('UPDATE contacts SET last_contact = NOW(), updated_at = NOW() WHERE id = $1', [id])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
