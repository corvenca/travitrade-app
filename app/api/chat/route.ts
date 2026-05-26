import { NextResponse } from 'next/server'

const TRAVITRADE_CONTEXT = `
Eres el asistente virtual de Travitrade, una plataforma SaaS para traders e inversores.
Responde siempre en español, de manera amigable, concisa y profesional.
Si no sabes algo específico, sugiere contactar al soporte.

INFORMACIÓN DE TRAVITRADE:

PRODUCTOS:
- Travi Journals: Bitácora de trading profesional. Registra operaciones con TP, BE y SL. Curva de equity, calendario de rendimiento, análisis de setups, reportes avanzados. Soporta NQ, MNQ, ES, YM, Forex, Crypto y más.
- Travi Portafolio: Rastreador de inversiones en tiempo real (próximamente)
- Travi Finance: Control de finanzas personales (próximamente)

PLANES:
- Plan Free ($0/mes): 1 cuenta de trading, hasta 40 operaciones, setups ilimitados, dashboard básico. Sin calendario, sin análisis de setups, sin reportes avanzados.
- Plan Pro ($5.99/mes): Todo ilimitado. Cuentas ilimitadas, operaciones ilimitadas, calendario completo, análisis de setups, reportes avanzados PDF, soporte prioritario.

ACCESO:
- Registro en app.travitrade.com/registro
- Travi Journals en journals.travitrade.com
- Se puede acceder desde la app principal con el mismo usuario

COMPATIBILIDAD:
- Funciona en cualquier navegador, móvil, tablet y computadora
- Compatible con NinjaTrader (registro manual de operaciones)
- Integración automática con NinjaTrader en desarrollo

SOPORTE:
- Email: soporte@travitrade.com
- Instagram: @travitrade
- Tiempo de respuesta: menos de 24 horas

SEGURIDAD:
- Datos encriptados y almacenados de forma segura
- Sin venta de datos a terceros
- Backups automáticos diarios

PAGOS:
- Sin tarjeta de crédito para plan Free
- Cancelación en cualquier momento sin penalización
- Los datos se mantienen 30 días después de cancelar

Si el usuario quiere hablar con un humano, dile: "Puedo conectarte con nuestro equipo de soporte. Escribe 'hablar con soporte' y un agente te atenderá pronto."
`

export async function POST(request: Request) {
  try {
    const { messages, sessionId } = await request.json()
    console.log('API Key exists:', !!process.env.ANTHROPIC_API_KEY)
    console.log('Messages:', JSON.stringify(messages))

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 500,
        system: TRAVITRADE_CONTEXT,
        messages: messages.filter((m: any) => m.role !== 'assistant' || messages.indexOf(m) > 0).map((m: any) => ({
          role: m.role,
          content: m.content
        }))
      })
    })

    const data = await response.json()
    console.log('Anthropic response:', JSON.stringify(data))

    if (data.error) {
      console.error('Anthropic error:', data.error)
      return NextResponse.json({ reply: `Error: ${data.error.message}` })
    }

    const reply = data.content?.[0]?.text || 'Lo siento, no pude procesar tu mensaje.'

    // Guardar en base de datos
    const { Pool } = require('pg')
    const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false })

    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id SERIAL PRIMARY KEY,
        session_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // Guardar último mensaje del usuario y respuesta del bot
    const lastUserMsg = messages[messages.length - 1]
    await pool.query('INSERT INTO chat_sessions (session_id, role, content) VALUES ($1, $2, $3)', [sessionId, lastUserMsg.role, lastUserMsg.content])
    await pool.query('INSERT INTO chat_sessions (session_id, role, content) VALUES ($1, $2, $3)', [sessionId, 'assistant', reply])

    return NextResponse.json({ reply, sessionId })
  } catch (error: any) {
    console.error('Chat error:', error)
    return NextResponse.json({ reply: `Error: ${error.message}` }, { status: 500 })
  }
}
