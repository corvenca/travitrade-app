'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const CATEGORIAS = [
  { value: 'soporte_tecnico', label: '🛠 Soporte técnico' },
  { value: 'planes_pagos', label: '💳 Planes y pagos' },
  { value: 'cuenta', label: '👤 Mi cuenta' },
  { value: 'journals', label: '📊 Travi Journals' },
  { value: 'sugerencia', label: '💡 Sugerencia o mejora' },
  { value: 'otro', label: '📝 Otro' },
]

export default function ContactoPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [form, setForm] = useState({ asunto: '', categoria: 'soporte_tecnico', mensaje: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(setUser).catch(() => {})
  }, [])

  const handleSubmit = async () => {
    if (!form.asunto.trim() || !form.mensaje.trim()) {
      setError('Por favor completa el asunto y el mensaje')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (res.ok) {
        setSuccess(true)
        setForm({ asunto: '', categoria: 'soporte_tecnico', mensaje: '' })
      } else {
        const data = await res.json()
        setError(data.error || 'Error al enviar. Intenta de nuevo.')
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a1a0f' }}>

      {/* HEADER */}
      <div style={{ background: '#0d1f14', borderBottom: '0.5px solid #1a3a24', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={() => router.push('/dashboard')}
          style={{ background: 'transparent', border: '0.5px solid #1a3a24', borderRadius: '8px', padding: '6px 12px', color: 'rgba(159,225,203,0.6)', fontSize: '13px', cursor: 'pointer' }}>
          ← Volver
        </button>
        <div style={{ fontSize: '15px', fontWeight: '500', color: '#fff' }}>
          travi<span style={{ color: '#1D9E75' }}>trade</span>
        </div>
      </div>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '40px 24px' }}>

        {/* TÍTULO */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '500', color: '#fff', marginBottom: '6px' }}>Centro de Ayuda</h1>
          <p style={{ fontSize: '14px', color: 'rgba(159,225,203,0.5)', lineHeight: '1.6' }}>
            ¿Tienes alguna consulta? Envíanos un mensaje y te responderemos en menos de 24 horas.
          </p>
        </div>

        {/* INFO USUARIO */}
        {user && (
          <div style={{ background: '#0d1f14', border: '0.5px solid #1a3a24', borderRadius: '10px', padding: '12px 16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '13px', color: '#fff', fontWeight: '500' }}>{user.nombre} {user.apellido}</div>
              <div style={{ fontSize: '12px', color: 'rgba(159,225,203,0.5)' }}>{user.email}</div>
            </div>
            <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: user.plan === 'pro' ? '#0f2e1a' : '#1a1d24', color: user.plan === 'pro' ? '#1D9E75' : 'rgba(159,225,203,0.4)', border: `0.5px solid ${user.plan === 'pro' ? '#1D9E75' : '#2a2d34'}` }}>
              {user.plan?.toUpperCase() || 'FREE'}
            </span>
          </div>
        )}

        {success ? (
          /* ÉXITO */
          <div style={{ background: '#0d1f14', border: '0.5px solid #1D9E75', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <h2 style={{ fontSize: '18px', fontWeight: '500', color: '#fff', marginBottom: '8px' }}>¡Mensaje enviado!</h2>
            <p style={{ fontSize: '14px', color: 'rgba(159,225,203,0.5)', marginBottom: '24px', lineHeight: '1.6' }}>
              Recibimos tu consulta. Te responderemos en menos de 24 horas al correo registrado.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={() => setSuccess(false)}
                style={{ padding: '10px 20px', background: 'transparent', border: '0.5px solid #1a3a24', borderRadius: '8px', color: '#9FE1CB', fontSize: '13px', cursor: 'pointer' }}>
                Enviar otra consulta
              </button>
              <button onClick={() => router.push('/dashboard')}
                style={{ padding: '10px 20px', background: '#1D9E75', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                Ir al Dashboard →
              </button>
            </div>
          </div>
        ) : (
          /* FORMULARIO */
          <div style={{ background: '#0d1f14', border: '0.5px solid #1a3a24', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Categoría */}
            <div>
              <label style={{ fontSize: '11px', color: 'rgba(159,225,203,0.5)', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>CATEGORÍA</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {CATEGORIAS.map(cat => (
                  <button key={cat.value} onClick={() => setForm({ ...form, categoria: cat.value })}
                    style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', textAlign: 'left', border: `0.5px solid ${form.categoria === cat.value ? '#1D9E75' : '#1a3a24'}`, background: form.categoria === cat.value ? '#0f2e1a' : '#0a1a0f', color: form.categoria === cat.value ? '#1D9E75' : 'rgba(159,225,203,0.6)', transition: 'all 0.15s' }}>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Asunto */}
            <div>
              <label style={{ fontSize: '11px', color: 'rgba(159,225,203,0.5)', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>ASUNTO *</label>
              <input
                value={form.asunto}
                onChange={e => setForm({ ...form, asunto: e.target.value })}
                placeholder="Ej: No puedo acceder a mis reportes"
                style={{ width: '100%', background: '#0a1a0f', border: '0.5px solid #1a3a24', borderRadius: '8px', padding: '10px 12px', color: '#9FE1CB', fontSize: '13px', outline: 'none' }}
              />
            </div>

            {/* Mensaje */}
            <div>
              <label style={{ fontSize: '11px', color: 'rgba(159,225,203,0.5)', letterSpacing: '1px', marginBottom: '8px', display: 'block' }}>MENSAJE *</label>
              <textarea
                value={form.mensaje}
                onChange={e => setForm({ ...form, mensaje: e.target.value })}
                placeholder="Describe tu consulta con el mayor detalle posible para que podamos ayudarte mejor..."
                rows={6}
                style={{ width: '100%', background: '#0a1a0f', border: '0.5px solid #1a3a24', borderRadius: '8px', padding: '10px 12px', color: '#9FE1CB', fontSize: '13px', resize: 'vertical', outline: 'none' }}
              />
            </div>

            {error && (
              <div style={{ background: 'rgba(226,75,74,0.1)', border: '0.5px solid #E24B4A', borderRadius: '8px', padding: '10px 14px', color: '#E24B4A', fontSize: '13px' }}>
                {error}
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading}
              style={{ padding: '12px', background: loading ? '#0f2e1a' : '#1D9E75', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Enviando...' : '✉ Enviar consulta'}
            </button>

            <div style={{ fontSize: '12px', color: 'rgba(159,225,203,0.3)', textAlign: 'center', lineHeight: '1.6' }}>
              Respuesta en menos de 24 horas · atencionalcliente@travitrade.com
            </div>
          </div>
        )}

        {/* CANALES ALTERNATIVOS */}
        <div style={{ marginTop: '24px', background: '#0d1f14', border: '0.5px solid #1a3a24', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '12px', color: 'rgba(159,225,203,0.4)', letterSpacing: '1px', marginBottom: '14px' }}>OTROS CANALES DE CONTACTO</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <a href="mailto:soporte@travitrade.com"
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#0a1a0f', borderRadius: '8px', border: '0.5px solid #1a3a24', textDecoration: 'none' }}>
              <span style={{ fontSize: '16px' }}>✉</span>
              <div>
                <div style={{ fontSize: '13px', color: '#fff' }}>Email directo</div>
                <div style={{ fontSize: '11px', color: 'rgba(159,225,203,0.4)' }}>soporte@travitrade.com</div>
              </div>
            </a>
            <a href="https://instagram.com/travitrade" target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#0a1a0f', borderRadius: '8px', border: '0.5px solid #1a3a24', textDecoration: 'none' }}>
              <span style={{ fontSize: '16px' }}>📸</span>
              <div>
                <div style={{ fontSize: '13px', color: '#fff' }}>Instagram</div>
                <div style={{ fontSize: '11px', color: 'rgba(159,225,203,0.4)' }}>@travitrade</div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
