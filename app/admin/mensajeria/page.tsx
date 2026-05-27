'use client'
import { useState, useEffect, useRef } from 'react'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  cliente_pro: { label: 'Cliente Pro', color: '#1D9E75', bg: '#0f2e1a' },
  cliente_free: { label: 'Cliente Free', color: '#3b82f6', bg: '#0a1929' },
  interes_alto: { label: 'Interés alto', color: '#F59E0B', bg: '#1f1a0a' },
  potencial: { label: 'Potencial', color: '#9FE1CB', bg: '#0d1f14' },
  sin_interes: { label: 'Sin interés', color: '#E24B4A', bg: '#2a1010' },
  visitante: { label: 'Visitante', color: 'rgba(159,225,203,0.4)', bg: '#1a1d24' },
}

export default function MensajeriaPage() {
  const [chats, setChats] = useState<any[]>([])
  const [selectedChat, setSelectedChat] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [filter, setFilter] = useState('todos')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/admin/chats').then(r => r.json()).then(d => {
      setChats(d.chats || [])
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (selectedChat) {
      fetch(`/api/admin/chats/${selectedChat.session_id}`)
        .then(r => r.json())
        .then(d => setMessages(d.messages || []))
    }
  }, [selectedChat])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const filteredChats = chats.filter(c => filter === 'todos' || c.status === filter)

  const updateStatus = async (sessionId: string, status: string) => {
    await fetch(`/api/admin/chats/${sessionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    setChats(prev => prev.map(c => c.session_id === sessionId ? { ...c, status } : c))
    if (selectedChat?.session_id === sessionId) setSelectedChat((prev: any) => ({ ...prev, status }))
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '100vh', background: '#0a1a0f' }}>

      {/* SIDEBAR */}
      <div style={{ background: '#0d1f14', borderRight: '0.5px solid #1a3a24', padding: '0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '0.5px solid #1a3a24' }}>
          <div style={{ fontSize: '15px', fontWeight: '500', color: '#fff' }}>travi<span style={{ color: '#1D9E75' }}>trade</span></div>
          <span style={{ fontSize: '10px', background: '#E24B4A', color: '#fff', padding: '2px 8px', borderRadius: '20px', marginTop: '6px', display: 'inline-block' }}>ADMIN</span>
        </div>
        {[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Usuarios', href: '/admin/usuarios' },
          { label: 'Mensajería', href: '/admin/mensajeria', active: true },
          { label: 'Seguridad', href: '/admin/seguridad' },
        ].map(item => (
          <a key={item.label} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px', fontSize: '13px', color: item.active ? '#1D9E75' : 'rgba(159,225,203,0.6)', background: item.active ? '#0f2a1a' : 'transparent', borderLeft: item.active ? '2px solid #1D9E75' : '2px solid transparent', textDecoration: 'none' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: item.active ? '#1D9E75' : 'rgba(159,225,203,0.3)' }} />
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
        <div style={{ background: '#0d1f14', borderRight: '0.5px solid #1a3a24', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px', borderBottom: '0.5px solid #1a3a24' }}>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#fff', marginBottom: '12px' }}>Conversaciones</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { key: 'todos', label: 'Todos' },
                { key: 'cliente', label: 'Clientes' },
                { key: 'interes_alto', label: 'Interés' },
                { key: 'potencial', label: 'Potencial' },
                { key: 'sin_interes', label: 'Sin interés' },
              ].map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', cursor: 'pointer', border: `0.5px solid ${filter === f.key ? '#1D9E75' : '#1a3a24'}`, background: filter === f.key ? '#0f2e1a' : 'transparent', color: filter === f.key ? '#1D9E75' : 'rgba(159,225,203,0.5)' }}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '20px', fontSize: '13px', color: 'rgba(159,225,203,0.4)', textAlign: 'center' }}>Cargando...</div>
            ) : filteredChats.length === 0 ? (
              <div style={{ padding: '20px', fontSize: '13px', color: 'rgba(159,225,203,0.4)', textAlign: 'center' }}>No hay conversaciones</div>
            ) : filteredChats.map(chat => {
              const st = STATUS_CONFIG[chat.status] || STATUS_CONFIG.visitante
              return (
                <div key={chat.session_id} onClick={() => setSelectedChat(chat)}
                  style={{ padding: '12px 16px', borderBottom: '0.5px solid #1a3a24', cursor: 'pointer', background: selectedChat?.session_id === chat.session_id ? '#0f2a1a' : 'transparent' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#fff' }}>{chat.user_name || 'Visitante'}</div>
                    <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: st.bg, color: st.color, border: `0.5px solid ${st.color}` }}>{st.label}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(159,225,203,0.4)', marginBottom: '4px' }}>{chat.user_email || 'Sin email'}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(159,225,203,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chat.last_message}</div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px', fontSize: '10px', color: 'rgba(159,225,203,0.3)' }}>
                    {chat.user_pais && <span>🌍 {chat.user_pais}</span>}
                    <span>💬 {chat.message_count} msgs</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* CONVERSACIÓN */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          {!selectedChat ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '32px' }}>💬</div>
              <div style={{ fontSize: '13px', color: 'rgba(159,225,203,0.4)' }}>Selecciona una conversación</div>
            </div>
          ) : (
            <>
              <div style={{ padding: '14px 20px', borderBottom: '0.5px solid #1a3a24', background: '#0d1f14' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#fff' }}>{selectedChat.user_name || 'Visitante'}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(159,225,203,0.5)', marginTop: '2px' }}>
                      {[selectedChat.user_email, selectedChat.user_telefono, selectedChat.user_pais].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: 'rgba(159,225,203,0.5)' }}>Clasificar:</span>
                    <select value={selectedChat.status || 'potencial'}
                      onChange={e => updateStatus(selectedChat.session_id, e.target.value)}
                      style={{ background: '#0a1a0f', border: '0.5px solid #1a3a24', borderRadius: '6px', padding: '4px 8px', color: '#9FE1CB', fontSize: '12px' }}>
                      <option value="cliente">Cliente</option>
                      <option value="interes_alto">Interés alto</option>
                      <option value="potencial">Potencial</option>
                      <option value="sin_interes">Sin interés</option>
                      <option value="visitante">Visitante</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
                  {[
                    { label: 'Plan', value: selectedChat.user_plan || 'visitante' },
                    { label: 'País', value: selectedChat.user_pais || '—' },
                    { label: 'Email', value: selectedChat.user_email || '—' },
                    { label: 'Teléfono', value: selectedChat.user_telefono || '—' },
                  ].map(item => (
                    <div key={item.label}>
                      <div style={{ fontSize: '9px', color: 'rgba(159,225,203,0.3)', letterSpacing: '1px', marginBottom: '2px' }}>{item.label.toUpperCase()}</div>
                      <div style={{ fontSize: '12px', color: '#9FE1CB' }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '70%', padding: '8px 12px',
                      borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                      background: msg.role === 'user' ? '#0f2e1a' : '#1D9E75',
                      border: msg.role === 'user' ? '0.5px solid #1a3a24' : 'none',
                      fontSize: '13px', color: '#fff', lineHeight: '1.5'
                    }}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
