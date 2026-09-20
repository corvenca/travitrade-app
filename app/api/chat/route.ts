import { NextResponse } from 'next/server'
import { Pool } from 'pg'
import { sendAdminNotification } from '@/lib/mailer'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders })
}

const TRAVITRADE_CONTEXT = `
Eres el asistente virtual de Travitrade. Tu nombre es Travi.

REGLAS DE COMPORTAMIENTO:
- Respuestas CORTAS, máximo 3 oraciones. Ve al grano.
- Tono amigable, cercano y humano. Como un amigo experto en trading.
- Usa emojis ocasionalmente 😊
- Si conoces el nombre del usuario, salúdalo por su nombre.
- Nunca des respuestas largas o técnicas innecesarias.
- Si no sabes algo, di "Déjame conectarte con nuestro equipo 👋"

SALUDO INICIAL:
Cuando el usuario saluda por primera vez responde:
"¡Hola! 👋 Soy Travi, tu asistente de Travitrade. ¿En qué puedo ayudarte hoy?"

Luego responde según lo que el usuario escriba libremente.
Si el usuario quiere hablar con un agente di: "¡Perfecto! 🙌 Ya avisé al equipo. Estarán contigo en breve."

INFORMACIÓN DE TRAVITRADE:
- Travi Journals: Bitácora de trading profesional. TP, BE, SL, curva de equity, calendario, reportes avanzados.
- Plan Free: $0/mes — 1 cuenta, 40 operaciones, dashboard básico. Sin calendario ni reportes avanzados.
- Plan Pro: $5.99/mes — todo ilimitado, calendario completo, análisis de setups, reportes PDF, soporte prioritario.
- Registro: app.travitrade.com/registro
- Soporte: soporte@travitrade.com | Instagram: @travitrade
- Compatible con NinjaTrader, Forex, Crypto, Futuros y más.
- Sin tarjeta de crédito para plan Free. Cancela cuando quieras.
`

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false })

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('CHAT POST body keys:', Object.keys(body))
    console.log('Messages count:', body.messages?.length)
    console.log('Session:', body.sessionId)
    console.log('Email:', body.userEmail)

    const { messages, sessionId, userEmail } = body

    const activeSessionId = sessionId

    const validMessages = messages.filter((m: any) => m.content && m.content.trim().length > 0)
    if (validMessages.length === 0) {
      return NextResponse.json({ reply: '¿En qué puedo ayudarte? 😊' }, { headers: corsHeaders })
    }

    // Buscar si el usuario está registrado o tiene historial previo
    let userName = null
    let userData: any = null
    let previousLeadData: any = null

    if (userEmail) {
      const result = await pool.query('SELECT nombre, apellido, email, telefono, pais, plan FROM users WHERE email = $1', [userEmail])
      if (result.rows.length > 0) {
        userData = result.rows[0]
        userName = userData.nombre
        previousLeadData = {
          user_name: userData.nombre,
          user_email: userData.email,
          user_pais: userData.pais,
          user_telefono: userData.telefono
        }
      }
    }

    if (!userData && userEmail) {
      const prevChat = await pool.query(`
        SELECT user_name, user_email, user_pais, user_telefono
        FROM chat_sessions
        WHERE user_email = $1
        ORDER BY created_at DESC
        LIMIT 1
      `, [userEmail])
      if (prevChat.rows.length > 0) previousLeadData = prevChat.rows[0]
    }

    if (!userData && !previousLeadData) {
      const prevBySession = await pool.query(`
        SELECT user_name, user_email, user_pais, user_telefono
        FROM chat_sessions
        WHERE user_name IS NOT NULL AND user_email IS NOT NULL
          AND session_id != $1
        ORDER BY created_at DESC
        LIMIT 1
      `, [activeSessionId])
      if (prevBySession.rows.length > 0 && prevBySession.rows[0].user_email === userEmail) {
        previousLeadData = prevBySession.rows[0]
      }
    }

    // Verificar si el bot está habilitado para esta sesión
    let botEnabled = true
    let agentIsActive = false
    try {
      const sessionCheck = await pool.query(
        'SELECT bot_enabled, agent_active FROM chat_sessions WHERE session_id = $1 LIMIT 1',
        [sessionId]
      )
      if (sessionCheck.rows.length > 0) {
        botEnabled = sessionCheck.rows[0].bot_enabled !== false
        agentIsActive = sessionCheck.rows[0].agent_active === true
      }
    } catch {}

    const lastUserMsg = messages[messages.length - 1]

    // Si agente activo o bot deshabilitado, solo guardar mensaje
    if (agentIsActive || !botEnabled) {
      await pool.query(
        'INSERT INTO chat_sessions (session_id, user_email, user_name, role, content, status, agent_active) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [sessionId, userEmail || null, userName || 'Visitante', 'user', lastUserMsg.content, 'requiere_agente', true]
      )
      return NextResponse.json({
        reply: null,
        agentActive: true,
        sessionId
      }, { headers: corsHeaders })
    }

    // Inyectar contexto del usuario si está registrado
    const userContext = userName
      ? `\nEl usuario registrado se llama ${userName} y tiene plan ${userData?.plan || 'free'}. Salúdalo por su nombre.`
      : '\nEl usuario no está registrado aún. Es un visitante potencial.'

    const cleanMessages = messages
      .filter((m: any) => m.content && m.content.trim().length > 0)
      .map((m: any) => ({
        role: m.role === 'agent' ? 'assistant' : m.role === 'user' ? 'user' : m.role,
        content: m.content
      }))
      .filter((m: any) => m.role === 'user' || m.role === 'assistant')

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
        messages: cleanMessages
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
    if (userData?.plan === 'pro') status = 'cliente_pro'
    else if (userData?.plan === 'free') status = 'cliente_free'
    else if (lastMsg.includes('no me interesa') || lastMsg.includes('no gracias')) status = 'sin_interes'
    else if (lastMsg.includes('precio') || lastMsg.includes('plan') || lastMsg.includes('suscrib') || lastMsg.includes('comprar') || lastMsg.includes('pagar')) status = 'interes_alto'

    await pool.query(
      'INSERT INTO chat_sessions (session_id, user_email, user_name, user_pais, user_telefono, user_plan, role, content, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
      [activeSessionId, userEmail || null, userName || 'Visitante', userData?.pais || null, userData?.telefono || null, userData?.plan || 'visitante', lastUserMsg.role, lastUserMsg.content, status]
    )
    await pool.query(
      'INSERT INTO chat_sessions (session_id, user_email, user_name, user_pais, user_telefono, user_plan, role, content, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
      [activeSessionId, userEmail || null, userName || 'Visitante', userData?.pais || null, userData?.telefono || null, userData?.plan || 'visitante', 'assistant', reply, status]
    )

    const isFirstMessage = messages.length === 1
    const wantsAgent = lastUserMsg.content.toLowerCase().includes('agente') ||
      lastUserMsg.content.toLowerCase().includes('soporte')

    if (isFirstMessage || wantsAgent) {
      sendAdminNotification({
        from: userEmail || 'visitante@web',
        subject: wantsAgent ? '🔔 Solicitud de agente humano' : '💬 Nueva conversación iniciada',
        message: lastUserMsg.content,
        clientName: userName || 'Visitante',
        clientEmail: userEmail || undefined,
        clientPhone: userData?.telefono || undefined,
        clientCountry: userData?.pais || undefined,
        source: userEmail ? 'app' : 'web',
        sessionId: activeSessionId
      }).catch(() => {})
    }

    return NextResponse.json({
      reply,
      sessionId: activeSessionId,
      userName,
      previousLeadData: previousLeadData || null
    }, { headers: corsHeaders })
  } catch (error: any) {
    console.error('CHAT ERROR COMPLETO:', error.message, error.stack)
    return NextResponse.json(
      { reply: 'Ups, algo salió mal 😅 Intenta de nuevo.', error: error.message },
      { status: 500, headers: corsHeaders }
    )
  }
}
