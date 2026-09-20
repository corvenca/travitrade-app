'use client'
import { useState, useEffect, useRef } from 'react'

interface Message { role: 'user' | 'assistant'; content: string }

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '¡Hola! Soy el asistente de Travitrade. ¿En qué puedo ayudarte hoy?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).slice(2)}`)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userNameChat, setUserNameChat] = useState<string | null>(null)

  // Estado para datos del lead
  const [leadCaptured, setLeadCaptured] = useState(false)
  const [leadData, setLeadData] = useState<any>(null)
  const [showLeadFormForAgent, setShowLeadFormForAgent] = useState(false)
  const [showPreviousDataNotice, setShowPreviousDataNotice] = useState(false)
  const [formData, setFormData] = useState({ nombre: '', apellido: '', email: '', pais: '', whatsapp: '' })
  const [submittingForm, setSubmittingForm] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      if (data.email) {
        setUserEmail(data.email)
        setUserNameChat(data.nombre)
      }
    }).catch(() => {})
  }, [])

  // Al iniciar, buscar si el usuario ya tiene una sesión activa
  useEffect(() => {
    if (userEmail) {
      fetch('/api/chat/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      }).then(r => r.json()).then(data => {
        if (data.sessionId) {
          setSessionId(data.sessionId)
        }
      }).catch(() => {})
    }
  }, [userEmail])

  // Al abrir o detectar userEmail, verificar si el usuario logueado tiene datos
  useEffect(() => {
    if (userEmail) {
      fetch('/api/chat/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      }).then(r => r.json()).then(data => {
        if (data.found) {
          // Si ya está registrado o tiene historial, no mostrar formulario
          setLeadCaptured(true)
          setLeadData({
            nombre: data.data.nombre,
            email: data.data.email,
            pais: data.data.pais,
            whatsapp: data.data.telefono
          })
          if (data.data.nombre) setUserNameChat(data.data.nombre)
        }
      }).catch(() => {})
    }
  }, [userEmail])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, showLeadFormForAgent])

  // Cuando el usuario escribe su email, verificar si ya tiene historial
  const handleEmailBlur = async (email: string) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return
    try {
      const res = await fetch('/api/chat/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (data.found) {
        // Precargar datos en el formulario
        setFormData((prev: any) => ({
          ...prev,
          nombre: data.data.nombre || prev.nombre,
          apellido: data.data.apellido || prev.apellido,
          pais: data.data.pais || prev.pais,
          whatsapp: data.data.telefono || prev.whatsapp
        }))
        setShowPreviousDataNotice(true)
      }
    } catch {}
  }

  const handleAgentRequest = async (currentLead: any) => {
    if (currentLead && currentLead.nombre) {
      // Ya tenemos sus datos — guardar directamente sin pedir formulario
      await fetch('/api/chat/update-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userName: currentLead.nombre,
          userEmail: currentLead.email,
          userPais: currentLead.pais,
          userTelefono: currentLead.whatsapp,
          status: 'requiere_agente'
        })
      }).catch(() => {})
    } else {
      // No tenemos datos — mostrar formulario
      setShowLeadFormForAgent(true)
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email || !formData.nombre) return
    setSubmittingForm(true)
    const fullName = `${formData.nombre} ${formData.apellido}`.trim()
    try {
      await fetch('/api/chat/update-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userName: fullName,
          userEmail: formData.email,
          userPais: formData.pais,
          userTelefono: formData.whatsapp,
          status: 'requiere_agente'
        })
      })
      setLeadCaptured(true)
      const newLead = { nombre: fullName, email: formData.email, pais: formData.pais, whatsapp: formData.whatsapp }
      setLeadData(newLead)
      setUserNameChat(formData.nombre)
      setShowLeadFormForAgent(false)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `¡Perfecto, ${formData.nombre}! 🙌 Ya avisé al equipo con tus datos. Un agente te contactará pronto.`
      }])
    } catch {}
    setSubmittingForm(false)
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userText = input.trim()
    const userMessage = { role: 'user' as const, content: userText }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    const isAgentReq = userText.toLowerCase().includes('agente') || userText.toLowerCase().includes('soporte')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, sessionId, userEmail })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])

      // Actualizar datos de lead si vinieron del backend
      let activeLead = leadData
      if (data.previousLeadData && !leadCaptured) {
        setLeadCaptured(true)
        activeLead = {
          nombre: data.previousLeadData.user_name,
          email: data.previousLeadData.user_email,
          pais: data.previousLeadData.user_pais,
          whatsapp: data.previousLeadData.user_telefono
        }
        setLeadData(activeLead)
        if (data.previousLeadData.user_name) setUserNameChat(data.previousLeadData.user_name)
      }

      if (isAgentReq) {
        await handleAgentRequest(activeLead)
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, hubo un error. Intenta de nuevo.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000,
          width: '52px', height: '52px', borderRadius: '50%',
          background: '#1D9E75', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(29,158,117,0.4)'
        }}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M4 4h14a2 2 0 012 2v8a2 2 0 01-2 2H8l-4 4V6a2 2 0 012-2z" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round"/></svg>
        )}
      </button>

      {/* Panel de chat */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '88px', right: '24px', zIndex: 1000,
          width: '340px', height: '520px',
          background: '#0d1f14', border: '0.5px solid #1a3a24',
          borderRadius: '14px', display: 'flex', flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{ padding: '14px 16px', background: '#0f2e1a', borderBottom: '0.5px solid #1a3a24', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1D9E75', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '500', color: '#fff' }}>T</div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#fff' }}>Travi {userNameChat ? `(con ${userNameChat})` : ''}</div>
              <div style={{ fontSize: '11px', color: '#1D9E75', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1D9E75' }} />
                En línea
              </div>
            </div>
          </div>

          {/* Mensajes */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '80%', padding: '8px 12px', borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  background: msg.role === 'user' ? '#1D9E75' : '#0a1a0f',
                  border: msg.role === 'assistant' ? '0.5px solid #1a3a24' : 'none',
                  fontSize: '13px', color: '#fff', lineHeight: '1.5'
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Formulario para datos del agente si no se tenían */}
            {showLeadFormForAgent && (
              <form onSubmit={handleFormSubmit} style={{ background: '#0a1a0f', border: '0.5px solid #1D9E75', borderRadius: '10px', padding: '12px', marginTop: '6px' }}>
                <div style={{ fontSize: '12px', fontWeight: '500', color: '#fff', marginBottom: '8px' }}>
                  🙋 Por favor déjanos tus datos para avisar al agente:
                </div>

                {showPreviousDataNotice && (
                  <div style={{ fontSize: '11px', color: '#1D9E75', background: 'rgba(29,158,117,0.1)', padding: '6px 10px', borderRadius: '6px', border: '0.5px solid #1D9E75', marginBottom: '8px' }}>
                    ✓ Encontramos tus datos previos — verifica que estén correctos
                  </div>
                )}

                <input
                  type="email"
                  placeholder="Tu email *"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  onBlur={e => handleEmailBlur(e.target.value)}
                  required
                  style={{ width: '100%', background: '#0d1f14', border: '0.5px solid #1a3a24', borderRadius: '6px', padding: '6px 8px', color: '#9FE1CB', fontSize: '12px', marginBottom: '6px', outline: 'none' }}
                />
                <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                  <input
                    type="text"
                    placeholder="Nombre *"
                    value={formData.nombre}
                    onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                    required
                    style={{ flex: 1, background: '#0d1f14', border: '0.5px solid #1a3a24', borderRadius: '6px', padding: '6px 8px', color: '#9FE1CB', fontSize: '12px', outline: 'none' }}
                  />
                  <input
                    type="text"
                    placeholder="Apellido"
                    value={formData.apellido}
                    onChange={e => setFormData({ ...formData, apellido: e.target.value })}
                    style={{ flex: 1, background: '#0d1f14', border: '0.5px solid #1a3a24', borderRadius: '6px', padding: '6px 8px', color: '#9FE1CB', fontSize: '12px', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    placeholder="WhatsApp / Teléfono"
                    value={formData.whatsapp}
                    onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                    style={{ flex: 1, background: '#0d1f14', border: '0.5px solid #1a3a24', borderRadius: '6px', padding: '6px 8px', color: '#9FE1CB', fontSize: '12px', outline: 'none' }}
                  />
                  <input
                    type="text"
                    placeholder="País"
                    value={formData.pais}
                    onChange={e => setFormData({ ...formData, pais: e.target.value })}
                    style={{ flex: 1, background: '#0d1f14', border: '0.5px solid #1a3a24', borderRadius: '6px', padding: '6px 8px', color: '#9FE1CB', fontSize: '12px', outline: 'none' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingForm}
                  style={{ width: '100%', background: '#1D9E75', border: 'none', borderRadius: '6px', padding: '8px', color: '#fff', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}
                >
                  {submittingForm ? 'Enviando...' : 'Contactar agente →'}
                </button>
              </form>
            )}

            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ padding: '8px 14px', background: '#0a1a0f', border: '0.5px solid #1a3a24', borderRadius: '12px 12px 12px 2px', display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: '#1D9E75',
                      animationName: 'bounce',
                      animationDuration: '1s',
                      animationTimingFunction: 'ease-in-out',
                      animationIterationCount: 'infinite',
                      animationDelay: `${i * 0.15}s`
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '10px', borderTop: '0.5px solid #1a3a24', display: 'flex', gap: '8px' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Escribe tu mensaje..."
              style={{ flex: 1, background: '#0a1a0f', border: '0.5px solid #1a3a24', borderRadius: '8px', padding: '8px 10px', color: '#9FE1CB', fontSize: '13px', outline: 'none' }}
            />
            <button onClick={sendMessage} disabled={loading || !input.trim()}
              style={{ background: '#1D9E75', border: 'none', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8l12-6-6 12-2-4-4-2z" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>
      )}

    </>
  )
}
