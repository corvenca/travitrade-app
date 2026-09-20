import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { detectBot, isValidEmailFormat, verifyEmailDomain, upsertContact } from '@/lib/contactUtils'
import nodemailer from 'nodemailer'

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
    const { nombre, apellido, email, whatsapp, pais, sessionId, timeToFill, honeypot, source } = await request.json()

    // Validar formato de email
    if (!isValidEmailFormat(email)) {
      return NextResponse.json({ error: 'Formato de email inválido' }, { status: 400, headers: corsHeaders })
    }

    // Verificar dominio del email
    const emailValid = await verifyEmailDomain(email)
    if (!emailValid) {
      return NextResponse.json({ error: 'El dominio del email no parece válido' }, { status: 400, headers: corsHeaders })
    }

    // Detectar bot
    const botCheck = detectBot({ nombre, email, whatsapp, timeToFill: timeToFill || 10, honeypot })

    // Guardar o actualizar contacto
    const contact = await upsertContact({
      nombre,
      apellido,
      email,
      whatsapp,
      pais,
      source: source || 'web',
      isBot: botCheck.isBot,
      botScore: botCheck.score,
      emailVerified: emailValid
    })

    // Si es bot, rechazar silenciosamente
    if (botCheck.isBot) {
      console.log('Bot detectado:', email, botCheck.reasons)
      return NextResponse.json({ success: true, code: 'blocked' }, { headers: corsHeaders })
    }

    // Guardar en tabla leads
    await pool.query(`
      INSERT INTO leads (nombre, apellido, email, whatsapp, pais, session_id, status, source)
      VALUES ($1,$2,$3,$4,$5,$6,'potencial',$7)
      ON CONFLICT (email) DO UPDATE SET
        whatsapp = EXCLUDED.whatsapp,
        pais = EXCLUDED.pais,
        updated_at = NOW()
    `, [nombre, apellido || null, email, whatsapp || null, pais || null, sessionId, source || 'web'])

    // Enviar email de bienvenida al contacto con su código único
    if (contact.isNew) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      })

      await transporter.sendMail({
        from: `"Travitrade" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `¡Hola ${nombre}! Tu código de cliente Travitrade`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a1a0f; color: #fff; padding: 32px; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #1D9E75; font-size: 24px; margin: 0;">travitrade</h1>
            </div>
            <h2 style="font-size: 20px; margin-bottom: 8px;">¡Hola, ${nombre}! 👋</h2>
            <p style="color: rgba(255,255,255,0.7); margin-bottom: 24px;">Gracias por contactar a Travitrade. Hemos registrado tu información y un agente se pondrá en contacto contigo pronto.</p>

            <div style="background: #0d1f14; border: 1px solid #1D9E75; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
              <p style="color: rgba(255,255,255,0.6); font-size: 12px; margin: 0 0 8px; letter-spacing: 2px;">TU CÓDIGO DE CLIENTE</p>
              <div style="font-size: 28px; font-weight: 700; color: #1D9E75; letter-spacing: 4px;">${contact.code}</div>
              <p style="color: rgba(255,255,255,0.4); font-size: 11px; margin: 8px 0 0;">Guarda este código — lo necesitarás para consultas futuras</p>
            </div>

            <div style="background: #0d1f14; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <p style="color: rgba(255,255,255,0.6); font-size: 12px; margin: 0 0 12px; letter-spacing: 1px;">TUS DATOS REGISTRADOS</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Nombre:</strong> ${nombre} ${apellido || ''}</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Email:</strong> ${email}</p>
              ${whatsapp ? `<p style="margin: 4px 0; font-size: 14px;"><strong>WhatsApp:</strong> ${whatsapp}</p>` : ''}
              ${pais ? `<p style="margin: 4px 0; font-size: 14px;"><strong>País:</strong> ${pais}</p>` : ''}
            </div>

            <div style="text-align: center; margin-bottom: 24px;">
              <a href="https://travitrade.com" style="display: inline-block; background: #1D9E75; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 500;">Visitar Travitrade →</a>
            </div>

            <p style="color: rgba(255,255,255,0.4); font-size: 12px; text-align: center;">Si tienes alguna pregunta escríbenos a atencionalcliente@travitrade.com</p>
          </div>
        `
      }).catch(() => {})
    }

    return NextResponse.json({
      success: true,
      code: contact.code,
      isNew: contact.isNew
    }, { headers: corsHeaders })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })
  }
}
