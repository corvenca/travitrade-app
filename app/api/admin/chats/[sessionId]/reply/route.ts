import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function POST(request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const { sessionId } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get('travitrade_session') || cookieStore.get('token')
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'travitrade_secret_2025') as any
    if (!decoded.isAdmin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

    const { content } = await request.json()
    if (!content?.trim()) return NextResponse.json({ error: 'Mensaje vacío' }, { status: 400 })

    // Obtener datos del cliente
    const clientRes = await pool.query(
      'SELECT DISTINCT user_name, user_email, user_telefono, user_pais FROM chat_sessions WHERE session_id = $1 LIMIT 1',
      [sessionId]
    )
    const client = clientRes.rows[0]

    // Guardar respuesta del admin
    await pool.query(
      `INSERT INTO chat_sessions (session_id, user_email, user_name, user_pais, user_telefono, role, content, status)
       VALUES ($1, $2, $3, $4, $5, 'agent', $6, 'respondido')`,
      [sessionId, client?.user_email, client?.user_name, client?.user_pais, client?.user_telefono, content]
    )

    // Actualizar status de la conversación y marcar agente activo
    await pool.query(
      `UPDATE chat_sessions SET agent_active = true, status = 'respondido' WHERE session_id = $1`,
      [sessionId]
    )

    // Enviar email de respuesta al cliente si tiene email
    if (client?.user_email) {
      const nodemailer = require('nodemailer')
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      })
      await transporter.sendMail({
        from: `"Travitrade Soporte" <${process.env.SMTP_USER}>`,
        to: client.user_email,
        subject: 'Respuesta de Travitrade',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0a1a0f; color: #fff; border-radius: 12px;">
            <div style="background: #1D9E75; padding: 12px 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="margin: 0; font-size: 18px;">Respuesta de Travitrade</h2>
            </div>
            <p style="margin-bottom: 16px;">Hola ${client.user_name || ''},</p>
            <div style="background: #0d1f14; padding: 16px; border-radius: 8px; border: 0.5px solid #1a3a24; margin-bottom: 20px;">
              <p style="margin: 0; line-height: 1.6;">${content}</p>
            </div>
            <p style="font-size: 12px; color: rgba(255,255,255,0.5);">El equipo de Travitrade</p>
          </div>
        `
      }).catch(() => {})
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
