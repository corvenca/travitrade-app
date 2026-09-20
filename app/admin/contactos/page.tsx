'use client'
import { useState, useEffect } from 'react'

export default function ContactosPage() {
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [showMessageModal, setShowMessageModal] = useState<any>(null)
  const [msgSubject, setMsgSubject] = useState('')
  const [msgBody, setMsgBody] = useState('')
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => { fetchContacts() }, [filter, search])

  const fetchContacts = async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/contacts?filter=${filter}&search=${search}`)
    const data = await res.json()
    setContacts(data.contacts || [])
    setLoading(false)
  }

  const handleSendMessage = async () => {
    if (!msgBody.trim() || !showMessageModal) return
    setSending(true)
    const res = await fetch(`/api/admin/contacts/${showMessageModal.id}/send-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: msgSubject, message: msgBody })
    })
    if (res.ok) {
      setSuccess('Mensaje enviado correctamente')
      setShowMessageModal(null)
      setMsgSubject('')
      setMsgBody('')
      setTimeout(() => setSuccess(''), 3000)
    }
    setSending(false)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '100vh', background: '#0a1a0f' }}>

      {/* SIDEBAR */}
      <div style={{ background: '#0d1f14', borderRight: '0.5px solid #1a3a24', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '0.5px solid #1a3a24' }}>
          <div style={{ fontSize: '15px', fontWeight: '500', color: '#fff' }}>travi<span style={{ color: '#1D9E75' }}>trade</span></div>
          <span style={{ fontSize: '10px', background: '#E24B4A', color: '#fff', padding: '2px 8px', borderRadius: '20px', marginTop: '6px', display: 'inline-block' }}>ADMIN</span>
        </div>
        {[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Usuarios', href: '/admin/usuarios' },
          { label: 'Mensajería', href: '/admin/mensajeria' },
          { label: 'Contactos', href: '/admin/contactos', active: true },
          { label: 'Seguridad', href: '/admin/seguridad' },
        ].map(item => (
          <a key={item.label} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px', fontSize: '13px', color: (item as any).active ? '#1D9E75' : 'rgba(159,225,203,0.6)', background: (item as any).active ? '#0f2a1a' : 'transparent', borderLeft: (item as any).active ? '2px solid #1D9E75' : '2px solid transparent', textDecoration: 'none' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: (item as any).active ? '#1D9E75' : 'rgba(159,225,203,0.3)' }} />
            {item.label}
          </a>
        ))}
      </div>

      {/* MAIN */}
      <div style={{ padding: '24px', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '500', color: '#fff' }}>Base de Contactos</div>
            <div style={{ fontSize: '12px', color: 'rgba(159,225,203,0.5)', marginTop: '2px' }}>{contacts.length} contactos registrados</div>
          </div>
        </div>

        {success && (
          <div style={{ background: 'rgba(29,158,117,0.1)', border: '0.5px solid #1D9E75', borderRadius: '8px', padding: '10px 14px', color: '#1D9E75', fontSize: '13px', marginBottom: '16px' }}>
            ✓ {success}
          </div>
        )}

        {/* FILTROS */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, email o código..."
            style={{ flex: 1, minWidth: '200px', background: '#0d1f14', border: '0.5px solid #1a3a24', borderRadius: '8px', padding: '8px 12px', color: '#9FE1CB', fontSize: '13px', outline: 'none' }} />
          {[
            { key: 'all', label: 'Todos' },
            { key: 'nuevo', label: 'Nuevos' },
            { key: 'bots', label: '🤖 Bots' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', border: `0.5px solid ${filter === f.key ? '#1D9E75' : '#1a3a24'}`, background: filter === f.key ? '#0f2e1a' : 'transparent', color: filter === f.key ? '#1D9E75' : 'rgba(159,225,203,0.5)' }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* TABLA */}
        <div style={{ background: '#0d1f14', borderRadius: '10px', border: '0.5px solid #1a3a24', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '0.5px solid #1a3a24' }}>
                {['Código', 'Nombre', 'Email', 'WhatsApp', 'País', 'Fuente', 'Estado', 'Registro', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'rgba(159,225,203,0.4)', fontSize: '10px', letterSpacing: '1px', fontWeight: '500' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ padding: '24px', textAlign: 'center', color: 'rgba(159,225,203,0.4)' }}>Cargando...</td></tr>
              ) : contacts.map(c => (
                <tr key={c.id} style={{ borderBottom: '0.5px solid #1a3a24', opacity: c.is_bot ? 0.5 : 1 }}>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#1D9E75', letterSpacing: '1px', background: '#0f2e1a', padding: '3px 8px', borderRadius: '6px' }}>{c.code}</span>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#fff', fontWeight: '500' }}>{c.nombre} {c.apellido || ''}</td>
                  <td style={{ padding: '10px 12px', color: 'rgba(159,225,203,0.7)' }}>{c.email}</td>
                  <td style={{ padding: '10px 12px', color: 'rgba(159,225,203,0.6)' }}>{c.whatsapp || '—'}</td>
                  <td style={{ padding: '10px 12px', color: 'rgba(159,225,203,0.6)' }}>{c.pais || '—'}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: c.source === 'web' ? '#0a1929' : '#0f2e1a', color: c.source === 'web' ? '#3b82f6' : '#1D9E75', border: `0.5px solid ${c.source === 'web' ? '#3b82f6' : '#1D9E75'}` }}>
                      {c.source === 'web' ? '🌐 Web' : '📱 App'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    {c.is_bot ? (
                      <span style={{ fontSize: '10px', color: '#E24B4A' }}>🤖 Bot ({c.bot_score})</span>
                    ) : (
                      <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: '#0f2e1a', color: '#1D9E75', border: '0.5px solid #1D9E75' }}>✓ Verificado</span>
                    )}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'rgba(159,225,203,0.4)', fontSize: '11px' }}>
                    {new Date(c.created_at).toLocaleDateString('es-ES')}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    {!c.is_bot && (
                      <button onClick={() => setShowMessageModal(c)}
                        style={{ padding: '4px 10px', background: 'transparent', border: '0.5px solid #1D9E75', borderRadius: '6px', color: '#1D9E75', fontSize: '11px', cursor: 'pointer' }}>
                        ✉ Escribir
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL ENVIAR MENSAJE */}
      {showMessageModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ background: '#0d1f14', border: '0.5px solid #1a3a24', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '500px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '500', color: '#fff' }}>Enviar mensaje</div>
                <div style={{ fontSize: '12px', color: 'rgba(159,225,203,0.5)', marginTop: '2px' }}>
                  {showMessageModal.nombre} · <span style={{ color: '#1D9E75' }}>{showMessageModal.code}</span>
                </div>
              </div>
              <button onClick={() => setShowMessageModal(null)} style={{ background: 'transparent', border: 'none', color: 'rgba(159,225,203,0.5)', fontSize: '22px', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', color: 'rgba(159,225,203,0.5)', letterSpacing: '1px', marginBottom: '6px', display: 'block' }}>ASUNTO</label>
              <input value={msgSubject} onChange={e => setMsgSubject(e.target.value)}
                placeholder="Ej: Seguimiento de tu consulta en Travitrade"
                style={{ width: '100%', background: '#0a1a0f', border: '0.5px solid #1a3a24', borderRadius: '8px', padding: '9px 12px', color: '#9FE1CB', fontSize: '13px', outline: 'none' }} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '11px', color: 'rgba(159,225,203,0.5)', letterSpacing: '1px', marginBottom: '6px', display: 'block' }}>MENSAJE</label>
              <textarea value={msgBody} onChange={e => setMsgBody(e.target.value)}
                placeholder="Escribe tu mensaje aquí..."
                rows={6}
                style={{ width: '100%', background: '#0a1a0f', border: '0.5px solid #1a3a24', borderRadius: '8px', padding: '9px 12px', color: '#9FE1CB', fontSize: '13px', resize: 'none', outline: 'none' }} />
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(159,225,203,0.4)', marginBottom: '14px', padding: '8px 12px', background: '#0a1a0f', borderRadius: '6px' }}>
              Se enviará a: <strong style={{ color: '#9FE1CB' }}>{showMessageModal.email}</strong> con el código <strong style={{ color: '#1D9E75' }}>{showMessageModal.code}</strong>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleSendMessage} disabled={!msgBody.trim() || sending}
                style={{ flex: 1, padding: '10px', background: '#1D9E75', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: '500', cursor: 'pointer', opacity: sending ? 0.6 : 1 }}>
                {sending ? 'Enviando...' : '✉ Enviar mensaje'}
              </button>
              <button onClick={() => setShowMessageModal(null)}
                style={{ flex: 1, padding: '10px', background: 'transparent', border: '0.5px solid #1a3a24', borderRadius: '8px', color: '#9FE1CB', fontSize: '13px', cursor: 'pointer' }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
