'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [activity, setActivity] = useState<any[]>([])
  const [activeSection, setActiveSection] = useState('dashboard')
  const [pendingPlans, setPendingPlans] = useState<Record<number, string>>({})
  const [saving, setSaving] = useState<Record<number, boolean>>({})
  const [saved, setSaved] = useState<Record<number, boolean>>({})

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(setStats)
    fetch('/api/admin/users').then(r => r.json()).then(d => setUsers(d.users || []))
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
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
          { id: 'dashboard', label: 'Dashboard', color: '#1D9E75', href: '/admin' },
          { id: 'usuarios', label: 'Usuarios', color: '#1D9E75', href: '/admin/usuarios' },
          { id: 'mensajeria', label: 'Mensajería', color: '#F59E0B', href: '/admin/mensajeria' },
          { id: 'seguridad', label: 'Seguridad', color: '#E24B4A', href: '/admin/seguridad' },
        ].map(item => (
          <a key={item.id}
            href={item.href}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 20px', fontSize: '13px', cursor: 'pointer',
              textDecoration: 'none',
              color: activeSection === item.id ? item.color : 'rgba(159,225,203,0.6)',
              background: activeSection === item.id ? '#0f2a1a' : 'transparent',
              borderLeft: activeSection === item.id ? `2px solid ${item.color}` : '2px solid transparent'
            }}
          >
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: item.color }} />
            {item.label}
          </a>
        ))}

        <div style={{ marginTop: 'auto', padding: '16px 20px', borderTop: '0.5px solid #1a3a24' }}>
          <div style={{ fontSize: '11px', color: 'rgba(159,225,203,0.5)', marginBottom: '4px' }}>Sesión admin</div>
          <div style={{ fontSize: '11px', color: '#1D9E75', marginBottom: '10px' }}>altuveronalbis@gmail.com</div>
          <button onClick={handleLogout} style={{ width: '100%', padding: '7px', background: 'transparent', border: '0.5px solid #1a3a24', borderRadius: '6px', color: 'rgba(159,225,203,0.5)', fontSize: '12px', cursor: 'pointer' }}>
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '500', color: '#fff' }}>Dashboard Admin</div>
            <div style={{ fontSize: '12px', color: 'rgba(159,225,203,0.5)', marginTop: '2px' }}>Vista general del sistema</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0d1f14', border: '0.5px solid #1D9E75', borderRadius: '20px', padding: '5px 12px', fontSize: '11px', color: '#1D9E75' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1D9E75' }} />
            Administrador
          </div>
        </div>

        {/* MÉTRICAS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '20px' }}>
          {[
            { label: 'TOTAL USUARIOS', value: stats?.totalUsers || 0, sub: `+${stats?.newThisMonth || 0} este mes`, color: '#1D9E75' },
            { label: 'PLAN PRO', value: stats?.proUsers || 0, sub: `${stats?.conversionRate || 0}% conversión`, color: '#3b82f6' },
            { label: 'PLAN FREE', value: stats?.freeUsers || 0, sub: 'usuarios gratuitos', color: '#F59E0B' },
            { label: 'INGRESOS MES', value: `$${stats?.monthlyRevenue || 0}`, sub: `${stats?.proUsers || 0} × $5.99/mes`, color: '#E24B4A' },
          ].map((m, i) => (
            <div key={i} style={{ background: '#0d1f14', borderRadius: '10px', padding: '14px', borderTop: `2px solid ${m.color}` }}>
              <div style={{ fontSize: '9px', color: 'rgba(159,225,203,0.4)', letterSpacing: '1.5px', marginBottom: '8px' }}>{m.label}</div>
              <div style={{ fontSize: '22px', fontWeight: '500', color: '#fff' }}>{m.value}</div>
              <div style={{ fontSize: '11px', color: 'rgba(159,225,203,0.4)', marginTop: '3px' }}>{m.sub}</div>
            </div>
          ))}
        </div>

        {/* USUARIOS RECIENTES */}
        <div style={{ background: '#0d1f14', borderRadius: '10px', padding: '16px', border: '0.5px solid #1a3a24', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ fontSize: '13px', fontWeight: '500', color: '#fff' }}>Usuarios registrados</div>
            <button
              onClick={() => fetch('/api/admin/users/export').then(r => r.blob()).then(b => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'usuarios.csv'; a.click() })}
              style={{ fontSize: '11px', color: '#1D9E75', background: 'transparent', border: '0.5px solid #1D9E75', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer' }}
            >
              Exportar CSV
            </button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr>
                {['Usuario', 'Email', 'País', 'Registro', 'Plan / Acción'].map(h => (
                  <th key={h} style={{ padding: '8px', textAlign: 'left', color: 'rgba(159,225,203,0.4)', fontSize: '10px', letterSpacing: '1px', borderBottom: '0.5px solid #1a3a24' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.slice(0, 8).map((u: any) => (
                <tr key={u.id}>
                  <td style={{ padding: '8px', color: '#fff' }}>{u.nombre} {u.apellido}</td>
                  <td style={{ padding: '8px', color: 'rgba(159,225,203,0.6)' }}>{u.email}</td>
                  <td style={{ padding: '8px', color: 'rgba(159,225,203,0.6)' }}>{u.pais || '—'}</td>
                  <td style={{ padding: '8px', color: 'rgba(159,225,203,0.4)' }}>{new Date(u.created_at).toLocaleDateString('es-ES')}</td>
                  <td style={{ padding: '8px' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <select
                        value={pendingPlans[u.id] ?? u.plan ?? 'free'}
                        onChange={e => {
                          setPendingPlans(prev => ({ ...prev, [u.id]: e.target.value }))
                          setSaved(prev => ({ ...prev, [u.id]: false }))
                        }}
                        style={{
                          background: '#0a1a0f',
                          border: `0.5px solid ${pendingPlans[u.id] && pendingPlans[u.id] !== u.plan ? '#F59E0B' : '#1a3a24'}`,
                          borderRadius: '6px',
                          padding: '4px 8px',
                          color: '#9FE1CB',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="free">Free</option>
                        <option value="pro">Pro</option>
                      </select>

                      {pendingPlans[u.id] && pendingPlans[u.id] !== u.plan && !saved[u.id] && (
                        <button
                          onClick={async () => {
                            setSaving(prev => ({ ...prev, [u.id]: true }))
                            try {
                              await fetch(`/api/admin/users/${u.id}/plan`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ plan: pendingPlans[u.id] })
                              })
                              setSaved(prev => ({ ...prev, [u.id]: true }))
                              setPendingPlans(prev => {
                                const next = { ...prev }
                                delete next[u.id]
                                return next
                              })
                              fetch('/api/admin/users').then(r => r.json()).then(d => setUsers(d.users || []))
                            } catch {
                              alert('Error al guardar')
                            } finally {
                              setSaving(prev => ({ ...prev, [u.id]: false }))
                            }
                          }}
                          disabled={saving[u.id]}
                          style={{
                            fontSize: '11px',
                            padding: '4px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            background: '#1D9E75',
                            color: '#fff',
                            cursor: 'pointer',
                            fontWeight: '500',
                            opacity: saving[u.id] ? 0.6 : 1
                          }}
                        >
                          {saving[u.id] ? 'Guardando...' : 'Guardar'}
                        </button>
                      )}

                      {saved[u.id] && (
                        <span style={{ fontSize: '11px', color: '#1D9E75' }}>✓ Guardado</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
