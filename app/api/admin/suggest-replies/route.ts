import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('travitrade_session') || cookieStore.get('token')
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'travitrade_secret_2025') as any
    if (!decoded.isAdmin) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })

    const { lastMessage, context } = await request.json()

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 300,
        system: `Eres un asistente que ayuda a un agente de atención al cliente de Travitrade a responder mensajes.

Travitrade es una plataforma SaaS para traders. Productos:
- Travi Journals: Bitácora de trading $5.99/mes plan Pro
- Plan Free: gratis con limitaciones
- Plan Pro: $5.99/mes todo ilimitado

Genera exactamente 3 respuestas cortas y naturales en español para que el agente las use.
Responde SOLO con JSON válido, sin texto adicional, sin bloques de código:
{"suggestions": ["respuesta 1", "respuesta 2", "respuesta 3"]}

Las respuestas deben ser:
- Cortas (máximo 2 oraciones)
- Amigables y profesionales
- Directamente relacionadas con lo que preguntó el usuario
- Listas para enviar sin modificar`,
        messages: [
          {
            role: 'user',
            content: `Historial de la conversación:
${(context || []).map((m: any) => `${m.role === 'user' ? 'Cliente' : 'Agente'}: ${m.content}`).join('\n')}

Último mensaje del cliente: "${lastMessage}"

Genera 3 respuestas sugeridas para el agente.`
          }
        ]
      })
    })

    const data = await response.json()
    const text = data.content?.[0]?.text || '{"suggestions":[]}'

    try {
      const parsed = JSON.parse(text)
      return NextResponse.json({ suggestions: parsed.suggestions || [] })
    } catch {
      // Intentar extraer JSON del texto
      const match = text.match(/\{[\s\S]*\}/)
      if (match) {
        const parsed = JSON.parse(match[0])
        return NextResponse.json({ suggestions: parsed.suggestions || [] })
      }
      return NextResponse.json({ suggestions: [] })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
