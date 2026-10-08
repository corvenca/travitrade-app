import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'travitrade_secret_2025') as any
    if (!decoded.isAdmin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

    // Obtener estadísticas de todos los datos
    const [users, operations, accounts, setups, leads, chats] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM trading_operations'),
      pool.query('SELECT COUNT(*) FROM trading_accounts'),
      pool.query('SELECT COUNT(*) FROM trading_setups'),
      pool.query('SELECT COUNT(*) FROM leads'),
      pool.query('SELECT COUNT(DISTINCT session_id) FROM chat_sessions'),
    ])

    // Obtener usuarios con sus datos
    const usersData = await pool.query(`
      SELECT u.id, u.nombre, u.apellido, u.email, u.plan, u.created_at,
        COUNT(DISTINCT ta.id) as cuentas,
        COUNT(DISTINCT to2.id) as operaciones
      FROM users u
      LEFT JOIN trading_accounts ta ON ta.user_id = u.id
      LEFT JOIN trading_operations to2 ON to2.user_id = u.id
      GROUP BY u.id ORDER BY u.created_at DESC
    `)

    const fecha = new Date().toLocaleDateString('es-ES')
    const hora = new Date().toLocaleTimeString('es-ES')

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    })

    await transporter.sendMail({
      from: `"Travitrade Sistema" <${process.env.SMTP_USER}>`,
      to: 'atencionalcliente@travitrade.com',
      subject: `📊 Reporte de datos Travitrade — ${fecha}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background: #0a1a0f; color: #fff; padding: 32px; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <img src="https://travitrade.com/assets/images/Logo.png" alt="Travitrade" style="height: 44px;" />
          </div>
          <h2 style="color: #1D9E75; text-align: center; margin-bottom: 4px;">Reporte de Datos del Sistema</h2>
          <p style="color: rgba(255,255,255,0.5); text-align: center; font-size: 13px; margin-bottom: 24px;">${fecha} · ${hora}</p>

          <div style="display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-bottom: 24px;">
            ${[
              { label: 'Usuarios', value: users.rows[0].count, color: '#1D9E75' },
              { label: 'Operaciones', value: operations.rows[0].count, color: '#3b82f6' },
              { label: 'Cuentas', value: accounts.rows[0].count, color: '#F59E0B' },
              { label: 'Setups', value: setups.rows[0].count, color: '#9FE1CB' },
              { label: 'Leads', value: leads.rows[0].count, color: '#a855f7' },
              { label: 'Chats', value: chats.rows[0].count, color: '#E24B4A' },
            ].map(m => `
              <div style="background: #0d1f14; border-radius: 8px; padding: 14px; text-align: center; border-top: 2px solid ${m.color};">
                <div style="font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 1px; margin-bottom: 6px;">${m.label.toUpperCase()}</div>
                <div style="font-size: 24px; font-weight: 700; color: ${m.color};">${m.value}</div>
              </div>
            `).join('')}
          </div>

          <div style="background: #0d1f14; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
            <h3 style="font-size: 14px; color: #9FE1CB; margin-bottom: 14px;">Usuarios Registrados</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
              <thead>
                <tr style="border-bottom: 0.5px solid #1a3a24;">
                  <th style="padding: 8px; text-align: left; color: rgba(255,255,255,0.4);">Usuario</th>
                  <th style="padding: 8px; text-align: left; color: rgba(255,255,255,0.4);">Email</th>
                  <th style="padding: 8px; text-align: center; color: rgba(255,255,255,0.4);">Plan</th>
                  <th style="padding: 8px; text-align: center; color: rgba(255,255,255,0.4);">Cuentas</th>
                  <th style="padding: 8px; text-align: center; color: rgba(255,255,255,0.4);">Ops</th>
                </tr>
              </thead>
              <tbody>
                ${usersData.rows.map(u => `
                  <tr style="border-bottom: 0.5px solid #1a3a24;">
                    <td style="padding: 8px; color: #fff;">${u.nombre} ${u.apellido || ''}</td>
                    <td style="padding: 8px; color: rgba(255,255,255,0.6);">${u.email}</td>
                    <td style="padding: 8px; text-align: center;">
                      <span style="background: ${u.plan === 'pro' ? '#0f2e1a' : '#1a1d24'}; color: ${u.plan === 'pro' ? '#1D9E75' : 'rgba(255,255,255,0.4)'}; padding: 2px 8px; border-radius: 20px; font-size: 11px;">
                        ${u.plan?.toUpperCase()}
                      </span>
                    </td>
                    <td style="padding: 8px; text-align: center; color: rgba(255,255,255,0.6);">${u.cuentas}</td>
                    <td style="padding: 8px; text-align: center; color: rgba(255,255,255,0.6);">${u.operaciones}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <p style="color: rgba(255,255,255,0.3); font-size: 11px; text-align: center;">
            Reporte automático de Travitrade · <a href="https://app.travitrade.com/admin" style="color: #1D9E75;">Ver panel admin</a>
          </p>
        </div>
      `
    })

    return NextResponse.json({ success: true, fecha, stats: {
      users: users.rows[0].count,
      operations: operations.rows[0].count,
      accounts: accounts.rows[0].count
    }})
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
