import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  }
})

export async function sendAdminNotification({
  from,
  subject,
  message,
  clientName,
  clientEmail,
  clientPhone,
  clientCountry,
  source,
  sessionId
}: {
  from: string
  subject: string
  message: string
  clientName?: string
  clientEmail?: string
  clientPhone?: string
  clientCountry?: string
  source: 'web' | 'app'
  sessionId: string
}) {
  try {
    await transporter.sendMail({
      from: `"Travitrade CRM" <${process.env.SMTP_USER}>`,
      to: 'atencionalcliente@travitrade.com',
      subject: `[${source.toUpperCase()}] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a1a0f; color: #fff; padding: 24px; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 16px;">
            <img src="https://travitrade.com/assets/images/Logo.png" alt="Travitrade" style="height: 40px; width: auto; margin-bottom: 8px;" />
          </div>
          <div style="background: #1D9E75; padding: 12px 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 18px;">Nuevo mensaje en Travitrade CRM</h2>
            <p style="margin: 4px 0 0; opacity: 0.8; font-size: 13px;">Fuente: ${source === 'web' ? '🌐 Sitio Web' : '📱 App'}</p>
          </div>

          <div style="background: #0d1f14; padding: 16px; border-radius: 8px; margin-bottom: 16px; border: 0.5px solid #1a3a24;">
            <h3 style="margin: 0 0 12px; font-size: 14px; color: #9FE1CB;">Datos del cliente</h3>
            <p style="margin: 4px 0;"><strong>Nombre:</strong> ${clientName || 'Visitante'}</p>
            <p style="margin: 4px 0;"><strong>Email:</strong> ${clientEmail || '—'}</p>
            <p style="margin: 4px 0;"><strong>WhatsApp:</strong> ${clientPhone || '—'}</p>
            <p style="margin: 4px 0;"><strong>País:</strong> ${clientCountry || '—'}</p>
          </div>

          <div style="background: #0d1f14; padding: 16px; border-radius: 8px; margin-bottom: 16px; border: 0.5px solid #1a3a24;">
            <h3 style="margin: 0 0 8px; font-size: 14px; color: #9FE1CB;">Mensaje</h3>
            <p style="margin: 0; font-size: 14px; line-height: 1.6;">${message}</p>
          </div>

          <a href="https://app.travitrade.com/admin/mensajeria?session=${sessionId}"
            style="display: block; background: #1D9E75; color: #fff; text-align: center; padding: 12px; border-radius: 8px; text-decoration: none; font-weight: 500;">
            Ver conversación en el Admin →
          </a>
        </div>
      `
    })
  } catch (error) {
    console.error('Error enviando email:', error)
  }
}
