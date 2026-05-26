import { NextResponse } from 'next/server'
import { Pool } from 'pg'

const TRAVITRADE_CONTEXT = `
Eres el asistente virtual de Travitrade. Tu nombre es Travi.

REGLAS DE COMPORTAMIENTO:
- Respuestas CORTAS, máximo 3 oraciones. Ve al grano.
- Tono amigable, cercano y humano. Como un amigo experto en trading.
- Usa emojis ocasionalmente para dar calidez 😊
- Si el usuario ya está registrado y conoces su nombre, salúdalo por su nombre.
- Nunca des respuestas largas o técnicas innecesarias.
- Si no sabes algo, di "Déjame conectarte con nuestro equipo 👋"

MENÚ INICIAL (solo en el primer mensaje del usuario):
Si el usuario dice "hola", "buenos días", "hey" o cualquier saludo, responde con:
"¡Hola! 👋 Soy Travi, tu asistente de Travitrade. ¿De qué te gustaría hablar hoy?

1️⃣ Productos
2️⃣ Planes y precios  
3️⃣ Suscripción
4️⃣ Pagos
5️⃣ Otra información
6️⃣ Hablar con un agente

Cuando el usuario elija una opción, responde específicamente sobre ese tema.
Si elige "Hablar con un agente" (opción 6), dile: "¡Perfecto! 🙌 Ya avisé a nuestro equipo. Estarán contigo en breve. Mientras tanto, ¿hay algo más en que pueda ayudarte?"

INFORMACIÓN DE TRAVITRADE:
- Travi Journals: Bitácora de trading profesional. TP, BE, SL, curva de equity, calendario, reportes.
- Plan Free: $0/mes — 1 cuenta, 40 operaciones, dashboard básico.
- Plan Pro: $5.99/mes — todo ilimitado, calendario, análisis, reportes PDF, soporte prioritario.
- Registro: app.travitrade.com/registro
- Soporte: soporte@travitrade.com | Instagram: @travitrade
- Compatible con NinjaTrader, Forex, Crypto, Futuros y más.
`

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false })

export async function POST(request: Request) {
  try {
    const { messages, sessionId, userEmail } = await request.json()

    const validMessages = messages.filter((m: any) => m.content && m.content.trim().length > 0)
    if (validMessages.length === 0) {
      return NextResponse.json({ reply: '¿En qué puedo ayudarte? 😊' })
    }

    // Buscar si el usuario está registrado
    let userName = null
    let userData: any = null
    if (userEmail) {
      const result = await pool.query('SELECT nombre, apellido, email, telefono, pais, plan FROM users WHERE email = $1', [userEmail])
      if (result.rows.length > 0) {
        userData = result.rows[0]
        userName = userData.nombre
      }
    }

    // Inyectar contexto del usuario si está registrado
    const userContext = userName
      ? `\nEl usuario registrado se llama ${userName} y tiene plan ${userData?.plan || 'free'}. Salúdalo por su nombre.`
      : '\nEl usuario no está registrado aún. Es un visitante potencial.'

    const apiKey = process.env.ANTHROPIC_API_KEY
    console.log('API KEY EXISTS:', !!apiKey)
    console.log('API KEY STARTS WITH:', apiKey?.substring(0, 10))

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 300,
        system: TRAVITRADE_CONTEXT + userContext,
        messages: messages.map((m: any) => ({ role: m.role, content: m.content }))
      })
    })

    const data = await response.json()
    console.log('STATUS:', response.status)
    console.log('RESPONSE DATA:', JSON.stringify(data))

    if (!response.ok || data.error) {
      console.error('Anthropic error:', data.error)
      throw new Error(data.error?.message || 'Error de API')
    }

    const reply = data.content?.[0]?.text || 'Lo siento, intenta de nuevo 😅'

    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id SERIAL PRIMARY KEY,
        session_id TEXT NOT NULL,
        user_email TEXT,
        user_name TEXT,
        user_pais TEXT,
        user_telefono TEXT,
        user_plan TEXT,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        status TEXT DEFAULT 'potencial',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // Detectar estado del cliente
    const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || ''
    let status = 'potencial'
    if (userData?.plan === 'pro') status = 'cliente'
    else if (lastMsg.includes('no me interesa') || lastMsg.includes('no gracias') || lastMsg.includes('adiós')) status = 'sin_interes'
    else if (lastMsg.includes('precio') || lastMsg.includes('plan') || lastMsg.includes('suscrib') || lastMsg.includes('comprar')) status = 'interes_alto'

    const lastUserMsg = messages[messages.length - 1]
    await pool.query(
      'INSERT INTO chat_sessions (session_id, user_email, user_name, user_pais, user_telefono, user_plan, role, content, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
      [sessionId, userEmail || null, userName || 'Visitante', userData?.pais || null, userData?.telefono || null, userData?.plan || 'visitante', lastUserMsg.role, lastUserMsg.content, status]
    )
    await pool.query(
      'INSERT INTO chat_sessions (session_id, user_email, user_name, user_pais, user_telefono, user_plan, role, content, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
      [sessionId, userEmail || null, userName || 'Visitante', userData?.pais || null, userData?.telefono || null, userData?.plan || 'visitante', 'assistant', reply, status]
    )

    return NextResponse.json({ reply, sessionId, userName })
  } catch (error: any) {
    console.error('Chat error:', error)
    return NextResponse.json({ reply: 'Ups, algo salió mal 😅 Intenta de nuevo.', error: error.message }, { status: 500 })
  }
}
