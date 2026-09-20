'use client'
import { useState, useEffect, useRef } from 'react'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  requiere_agente: { label: '🔔 Requiere Agente', color: '#fff', bg: '#E24B4A', border: '#E24B4A' },
  respondido: { label: '✓ Respondido', color: '#1D9E75', bg: '#0f2e1a', border: '#1D9E75' },
  cliente_pro: { label: 'Cliente Pro', color: '#1D9E75', bg: '#0f2e1a', border: '#1D9E75' },
  cliente_free: { label: 'Cliente Free', color: '#3b82f6', bg: '#0a1929', border: '#3b82f6' },
  interes_alto: { label: 'Interés alto', color: '#F59E0B', bg: '#1f1a0a', border: '#F59E0B' },
  potencial: { label: 'Potencial', color: '#9FE1CB', bg: '#0d1f14', border: '#1a3a24' },
  sin_interes: { label: 'Sin interés', color: '#E24B4A', bg: '#2a1010', border: '#E24B4A' },
  visitante: { label: 'Visitante', color: 'rgba(159,225,203,0.4)', bg: '#1a1d24', border: '#2a2d34' },
}

export default function MensajeriaPage() {
  const [chats, setChats] = useState<any[]>([])
  const [selectedChat, setSelectedChat] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [filter, setFilter] = useState('todos')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)
  const [replySuccess, setReplySuccess] = useState('')
  const [agentActive, setAgentActive] = useState(false)
  const [botEnabled, setBotEnabled] = useState(true)
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchChats()
    const interval = setInterval(fetchChats, 30000) // actualizar cada 30s
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!selectedChat) return

    fetchMessages(selectedChat.session_id)
    fetch(`/api/chat/status?sessionId=${selectedChat.session_id}`)
      .then(r => r.json())
      .then(data => {
        setAgentActive(data.agentActive)
        setBotEnabled(data.botEnabled !== false)
      })
      .catch(() => {})

    const interval = setInterval(() => {
      fetchMessages(selectedChat.session_id)
    }, 5000)

    return () => clearInterval(interval)
  }, [selectedChat])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const generateSuggestions = async (msgs: any[]) => {
    setLoadingSuggestions(true)
    try {
      const lastUserMsg = msgs.filter(m => m.role === 'user').slice(-1)[0]?.content
      if (!lastUserMsg) {
        setSuggestedReplies([])
        setLoadingSuggestions(false)
        return
      }

      const res = await fetch('/api/admin/suggest-replies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lastMessage: lastUserMsg,
          context: msgs.slice(-6).map(m => ({ role: m.role, content: m.content }))
        })
      })
      const data = await res.json()
      setSuggestedReplies(data.suggestions || [])
    } catch {
      setSuggestedReplies([])
    }
    setLoadingSuggestions(false)
  }

  const fetchChats = async () => {
    const res = await fetch('/api/admin/chats')
    const data = await res.json()
    setChats(data.chats || [])
    setLoading(false)
  }

  const fetchMessages = async (sessionId: string) => {
    const res = await fetch(`/api/admin/chats/${sessionId}`)
    const data = await res.json()
    const msgs = data.messages || []
    setMessages(msgs)
    generateSuggestions(msgs)
  }

  const handleReply = async () => {
    if (!replyText.trim() || !selectedChat) return
    setSending(true)
    try {
      const res = await fetch(`/api/admin/chats/${selectedChat.session_id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyText })
      })
      if (res.ok) {
        setReplyText('')
        setReplySuccess('Respuesta enviada ✓')
        fetchMessages(selectedChat.session_id)
        fetchChats()
        setTimeout(() => setReplySuccess(''), 3000)
      }
    } catch {}
    setSending(false)
  }

  const updateStatus = async (sessionId: string, status: string) => {
    await fetch(`/api/admin/chats/${sessionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    setChats(prev => prev.map(c => c.session_id === sessionId ? { ...c, status } : c))
    if (selectedChat?.session_id === sessionId) setSelectedChat((p: any) => ({ ...p, status }))
  }

  const toggleBot = async () => {
    if (!selectedChat) return
    const newBotEnabled = !botEnabled
    await fetch(`/api/admin/chats/${selectedChat.session_id}/toggle-bot`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ botEnabled: newBotEnabled })
    })
    setBotEnabled(newBotEnabled)
    setAgentActive(!newBotEnabled)
  }

  const filteredChats = chats
    .filter(c => filter === 'todos' || c.status === filter)
    .filter(c => !search || (c.user_name || '').toLowerCase().includes(search.toLowerCase()) || (c.user_email || '').toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.last_activity || b.created_at).getTime() - new Date(a.last_activity || a.created_at).getTime())

  const getTimeAgo = (date: string) => {
    if (!date) return ''
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'ahora'
    if (mins < 60) return `${mins}m`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h`
    return `${Math.floor(hrs / 24)}d`
  }

  const getRoleBubbleStyle = (role: string) => {
    if (role === 'user') return { justifyContent: 'flex-end', bg: '#0f2e1a', border: '0.5px solid #1a3a24', radius: '12px 12px 2px 12px', color: '#9FE1CB' }
    if (role === 'agent') return { justifyContent: 'flex-end', bg: '#1D9E75', border: 'none', radius: '12px 12px 2px 12px', color: '#fff' }
    return { justifyContent: 'flex-start', bg: '#0a1a0f', border: '0.5px solid #1a3a24', radius: '12px 12px 12px 2px', color: '#9FE1CB' }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '100vh', background: '#0a1a0f' }}>

      {/* SIDEBAR ADMIN */}
      <div style={{ background: '#0d1f14', borderRight: '0.5px solid #1a3a24', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '0.5px solid #1a3a24' }}>
          <div style={{ fontSize: '15px', fontWeight: '500', color: '#fff' }}>travi<span style={{ color: '#1D9E75' }}>trade</span></div>
          <span style={{ fontSize: '10px', background: '#E24B4A', color: '#fff', padding: '2px 8px', borderRadius: '20px', marginTop: '6px', display: 'inline-block' }}>ADMIN</span>
        </div>
        {[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Usuarios', href: '/admin/usuarios' },
          { label: 'Mensajería', href: '/admin/mensajeria', active: true },
          { label: 'Contactos', href: '/admin/contactos' },
          { label: 'Seguridad', href: '/admin/seguridad' },
        ].map(item => (
          <a key={item.label} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px', fontSize: '13px', color: (item as any).active ? '#1D9E75' : 'rgba(159,225,203,0.6)', background: (item as any).active ? '#0f2a1a' : 'transparent', borderLeft: (item as any).active ? '2px solid #1D9E75' : '2px solid transparent', textDecoration: 'none' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: (item as any).active ? '#1D9E75' : 'rgba(159,225,203,0.3)' }} />
            {item.label}
          </a>
        ))}
        <div style={{ marginTop: 'auto', padding: '16px 20px', borderTop: '0.5px solid #1a3a24' }}>
          <div style={{ fontSize: '11px', color: 'rgba(159,225,203,0.5)' }}>Sesión admin</div>
          <div style={{ fontSize: '11px', color: '#1D9E75', marginTop: '2px' }}>altuveronalbis@gmail.com</div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', height: '100vh', overflow: 'hidden' }}>

        {/* LISTA CHATS */}
        <div style={{ background: '#0d1f14', borderRight: '0.5px solid #1a3a24', display: 'flex', flexDirection: 'column', height: '100vh' }}>
          <div style={{ padding: '14px 16px', borderBottom: '0.5px solid #1a3a24' }}>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#fff', marginBottom: '10px' }}>
              Conversaciones
              {chats.filter(c => c.status === 'requiere_agente').length > 0 && (
                <span style={{ marginLeft: '8px', background: '#E24B4A', color: '#fff', fontSize: '10px', padding: '2px 7px', borderRadius: '20px' }}>
                  {chats.filter(c => c.status === 'requiere_agente').length}
                </span>
              )}
            </div>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre o email..."
              style={{ width: '100%', background: '#0a1a0f', border: '0.5px solid #1a3a24', borderRadius: '8px', padding: '7px 10px', color: '#9FE1CB', fontSize: '12px', outline: 'none', marginBottom: '10px' }} />
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {[
                { key: 'todos', label: 'Todos' },
                { key: 'requiere_agente', label: '🔔' },
                { key: 'respondido', label: '✓' },
                { key: 'interes_alto', label: 'Interés' },
                { key: 'potencial', label: 'Potencial' },
                { key: 'sin_interes', label: 'Sin interés' },
              ].map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  style={{ padding: '3px 8px', borderRadius: '20px', fontSize: '11px', cursor: 'pointer', border: `0.5px solid ${filter === f.key ? '#1D9E75' : '#1a3a24'}`, background: filter === f.key ? '#0f2e1a' : 'transparent', color: filter === f.key ? '#1D9E75' : 'rgba(159,225,203,0.5)' }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(159,225,203,0.4)', fontSize: '13px' }}>Cargando...</div>
            ) : filteredChats.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(159,225,203,0.4)', fontSize: '13px' }}>No hay conversaciones</div>
            ) : filteredChats.map(chat => {
              const st = STATUS_CONFIG[chat.status] || STATUS_CONFIG.visitante
              const isSelected = selectedChat?.session_id === chat.session_id
              return (
                <div key={chat.session_id} onClick={() => setSelectedChat(chat)}
                  style={{ padding: '12px 16px', borderBottom: '0.5px solid #1a3a24', cursor: 'pointer', background: isSelected ? '#0f2a1a' : 'transparent', borderLeft: isSelected ? '2px solid #1D9E75' : '2px solid transparent' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#0f2e1a', border: '0.5px solid #1D9E75', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#1D9E75', fontWeight: '500', flexShrink: 0 }}>
                        {(chat.user_name || 'V').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '500', color: '#fff' }}>{chat.user_name || 'Visitante'}</div>
                        <div style={{ fontSize: '11px', color: 'rgba(159,225,203,0.4)' }}>{chat.user_email || 'Sin email'}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '10px', color: 'rgba(159,225,203,0.3)', marginBottom: '3px' }}>{getTimeAgo(chat.last_activity)}</div>
                      <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '20px', background: st.bg, color: st.color, border: `0.5px solid ${st.border}` }}>{st.label}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(159,225,203,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginLeft: '36px' }}>
                    {chat.last_user_message || '...'}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px', marginLeft: '36px', fontSize: '10px', color: 'rgba(159,225,203,0.3)' }}>
                    {chat.user_pais && <span>🌍 {chat.user_pais}</span>}
                    <span>💬 {chat.message_count}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* PANEL CONVERSACIÓN */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
          {!selectedChat ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '40px' }}>💬</div>
              <div style={{ fontSize: '14px', color: 'rgba(159,225,203,0.4)' }}>Selecciona una conversación</div>
              <div style={{ fontSize: '12px', color: 'rgba(159,225,203,0.3)' }}>Actualiza cada 30 segundos automáticamente</div>
            </div>
          ) : (
            <>
              {/* HEADER */}
              <div style={{ padding: '14px 20px', borderBottom: '0.5px solid #1a3a24', background: '#0d1f14' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#0f2e1a', border: '1px solid #1D9E75', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#1D9E75', fontWeight: '500' }}>
                      {(selectedChat.user_name || 'V').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#fff' }}>{selectedChat.user_name || 'Visitante'}</div>
                      <div style={{ fontSize: '11px', color: 'rgba(159,225,203,0.5)' }}>
                        {[selectedChat.user_email, selectedChat.user_telefono, selectedChat.user_pais].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button onClick={toggleBot}
                      style={{
                        padding: '6px 14px',
                        background: botEnabled ? 'rgba(29,158,117,0.1)' : 'rgba(226,75,74,0.1)',
                        border: `0.5px solid ${botEnabled ? '#1D9E75' : '#E24B4A'}`,
                        borderRadius: '20px',
                        color: botEnabled ? '#1D9E75' : '#E24B4A',
                        fontSize: '11px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                      {botEnabled ? '🤖 Bot activo' : '👤 Agente activo'}
                      <span style={{ fontSize: '10px', opacity: 0.7 }}>
                        {botEnabled ? '→ clic para tomar control' : '→ clic para activar bot'}
                      </span>
                    </button>
                    <span style={{ fontSize: '11px', color: 'rgba(159,225,203,0.5)' }}>Estado:</span>
                    <select value={selectedChat.status || 'potencial'}
                      onChange={e => updateStatus(selectedChat.session_id, e.target.value)}
                      style={{ background: '#0a1a0f', border: '0.5px solid #1a3a24', borderRadius: '6px', padding: '4px 8px', color: '#9FE1CB', fontSize: '12px' }}>
                      <option value="requiere_agente">🔔 Requiere Agente</option>
                      <option value="respondido">✓ Respondido</option>
                      <option value="cliente_pro">Cliente Pro</option>
                      <option value="cliente_free">Cliente Free</option>
                      <option value="interes_alto">Interés alto</option>
                      <option value="potencial">Potencial</option>
                      <option value="sin_interes">Sin interés</option>
                      <option value="visitante">Visitante</option>
                    </select>
                  </div>
                </div>

                {/* FICHA CRM */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
                  {[
                    { label: 'PLAN', value: selectedChat.user_plan || 'visitante' },
                    { label: 'PAÍS', value: selectedChat.user_pais || '—' },
                    { label: 'EMAIL', value: selectedChat.user_email || '—' },
                    { label: 'WHATSAPP', value: selectedChat.user_telefono || '—' },
                  ].map(item => (
                    <div key={item.label} style={{ background: '#0a1a0f', borderRadius: '6px', padding: '6px 10px' }}>
                      <div style={{ fontSize: '9px', color: 'rgba(159,225,203,0.3)', letterSpacing: '1px', marginBottom: '2px' }}>{item.label}</div>
                      <div style={{ fontSize: '12px', color: '#9FE1CB', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* MENSAJES */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {messages.map((msg, i) => {
                  const style = getRoleBubbleStyle(msg.role)
                  return (
                    <div key={i} style={{ display: 'flex', justifyContent: style.justifyContent }}>
                      <div style={{ maxWidth: '70%' }}>
                        {msg.role === 'agent' && (
                          <div style={{ fontSize: '10px', color: '#1D9E75', marginBottom: '3px', textAlign: 'right' }}>Agente Travitrade</div>
                        )}
                        {msg.role === 'assistant' && (
                          <div style={{ fontSize: '10px', color: 'rgba(159,225,203,0.4)', marginBottom: '3px' }}>Travi Bot</div>
                        )}
                        {msg.role === 'user' && (
                          <div style={{ fontSize: '10px', color: 'rgba(159,225,203,0.4)', marginBottom: '3px', textAlign: 'right' }}>{selectedChat.user_name || 'Visitante'}</div>
                        )}
                        <div style={{ padding: '8px 12px', borderRadius: style.radius, background: style.bg, border: style.border, fontSize: '13px', color: style.color, lineHeight: '1.5' }}>
                          {msg.content}
                        </div>
                        <div style={{ fontSize: '10px', color: 'rgba(159,225,203,0.25)', marginTop: '3px', textAlign: msg.role !== 'assistant' ? 'right' : 'left' }}>
                          {new Date(msg.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* SUGERENCIAS DINÁMICAS Y RESPONDER */}
              <div style={{ borderTop: '0.5px solid #1a3a24', background: '#0d1f14' }}>

                {/* SUGERENCIAS DINÁMICAS */}
                {selectedChat && (
                  <div style={{ padding: '10px 20px', borderBottom: '0.5px solid #1a3a24' }}>
                    <div style={{ fontSize: '10px', color: 'rgba(159,225,203,0.4)', letterSpacing: '1px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      ⚡ SUGERENCIAS
                      {loadingSuggestions && <span style={{ color: '#1D9E75', fontSize: '10px' }}>Generando...</span>}
                    </div>

                    {/* Sugerencias dinámicas de IA */}
                    {suggestedReplies.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '8px' }}>
                        {suggestedReplies.map((reply, i) => (
                          <button key={i}
                            onClick={() => {
                              setReplyText(reply)
                              setSuggestedReplies([])
                            }}
                            style={{
                              padding: '7px 12px', background: '#0a1a0f',
                              border: '0.5px solid #1D9E75', borderRadius: '8px',
                              color: '#9FE1CB', fontSize: '12px', cursor: 'pointer',
                              textAlign: 'left', lineHeight: '1.4',
                              transition: 'background 0.15s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#0f2a1a'}
                            onMouseLeave={e => e.currentTarget.style.background = '#0a1a0f'}
                          >
                            <span style={{ color: '#1D9E75', marginRight: '6px' }}>→</span>
                            {reply}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Respuestas fijas de inicio */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {[
                        { label: '👋 Saludo', text: '¡Hola! 👋 Soy José del equipo de Travitrade. ¿En qué puedo ayudarte?' },
                        { label: '⏳ Espera', text: 'Gracias por escribirnos. Estoy revisando tu consulta, en un momento te respondo. 🙏' },
                        { label: '✓ Cierre', text: '¡Fue un placer ayudarte! Si tienes más preguntas, aquí estaremos. ¡Éxito en tu trading! 📈' },
                      ].map((qr, i) => (
                        <button key={i}
                          onClick={() => setReplyText(qr.text)}
                          style={{
                            padding: '4px 10px', background: 'transparent',
                            border: '0.5px solid #1a3a24', borderRadius: '20px',
                            color: 'rgba(159,225,203,0.6)', fontSize: '11px', cursor: 'pointer'
                          }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = '#1D9E75'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = '#1a3a24'}
                        >
                          {qr.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ padding: '14px 20px' }}>
                  {replySuccess && (
                    <div style={{ fontSize: '12px', color: '#1D9E75', marginBottom: '8px' }}>{replySuccess}</div>
                  )}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                    <textarea
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply() } }}
                      placeholder="Escribe tu respuesta... (Enter para enviar, Shift+Enter para nueva línea)"
                      rows={2}
                      style={{ flex: 1, background: '#0a1a0f', border: '0.5px solid #1a3a24', borderRadius: '8px', padding: '10px 12px', color: '#9FE1CB', fontSize: '13px', resize: 'none', outline: 'none' }}
                    />
                    <button onClick={handleReply} disabled={!replyText.trim() || sending}
                      style={{ padding: '10px 20px', background: replyText.trim() ? '#1D9E75' : '#1a3a24', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: '500', cursor: replyText.trim() ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap', opacity: sending ? 0.6 : 1 }}>
                      {sending ? 'Enviando...' : 'Enviar →'}
                    </button>
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(159,225,203,0.3)', marginTop: '6px' }}>
                    La respuesta se enviará al chat y por email a {selectedChat.user_email || 'no disponible'}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
