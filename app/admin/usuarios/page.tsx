'use client'
import { useState, useEffect } from 'react'

export default function UsuariosPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterPlan, setFilterPlan] = useState('todos')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showBlockModal, setShowBlockModal] = useState<any>(null)
  const [blockReason, setBlockReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [newUser, setNewUser] = useState({ nombre: '', apellido: '', email: '', telefono: '', pais: '', username: '', password: '', plan: 'free' })

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/users')
    const data = await res.json()
    setUsers(data.users || [])
    setLoading(false)
  }

  const handleBlock = async (userId: number, blocked: boolean, reason?: string) => {
    setSaving(true)
    await fetch(`/api/admin/users/${userId}/block`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocked, reason })
    })
    setSuccess(blocked ? 'Usuario bloqueado' : 'Usuario habilitado')
    setShowBlockModal(null)
    setBlockReason('')
    fetchUsers()
    setSaving(false)
    setTimeout(() => setSuccess(''), 3000)
  }

  const handleImpersonate = async (userId: number) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/impersonate`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        window.open(data.journalsUrl, '_blank')
      } else {
        alert('Error: ' + data.error)
      }
    } catch {
      alert('Error de conexión')
    }
  }

  const handleCreateUser = async () => {
    if (!newUser.nombre || !newUser.email || !newUser.password) { alert('Nombre, email y contraseña son obligatorios'); return }
    setSaving(true)
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    })
    const data = await res.json()
    if (res.ok) {
      setSuccess('Usuario creado correctamente')
      setShowCreateModal(false)
      setNewUser({ nombre: '', apellido: '', email: '', telefono: '', pais: '', username: '', password: '', plan: 'free' })
      fetchUsers()
      setTimeout(() => setSuccess(''), 3000)
    } else {
      alert('Error: ' + data.error)
    }
    setSaving(false)
  }

  const filteredUsers = users.filter(u => {
    const matchSearch = !search || u.nombre?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()) || u.username?.toLowerCase().includes(search.toLowerCase())
    const matchPlan = filterPlan === 'todos' || u.plan === filterPlan
    const matchStatus = filterStatus === 'todos' || (filterStatus === 'activo' && !u.blocked) || (filterStatus === 'bloqueado' && u.blocked)
    return matchSearch && matchPlan && matchStatus
  })

  const getLastLogin = (date: string) => {
    if (!date) return 'Nunca'
    const d = new Date(date)
    const diff = Date.now() - d.getTime()
    const hours = Math.floor(diff / 3600000)
    if (hours < 1) return 'Hace menos de 1 hora'
    if (hours < 24) return `Hace ${hours}h`
    const days = Math.floor(hours / 24)
    if (days < 30) return `Hace ${days} días`
    return d.toLocaleDateString('es-ES')
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
          { label: 'Usuarios', href: '/admin/usuarios', active: true },
          { label: 'Mensajería', href: '/admin/mensajeria' },
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
      <div style={{ padding: '24px', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '500', color: '#fff' }}>Gestión de Usuarios</div>
            <div style={{ fontSize: '12px', color: 'rgba(159,225,203,0.5)', marginTop: '2px' }}>{users.length} usuarios registrados</div>
          </div>
          <button onClick={() => setShowCreateModal(true)}
            style={{ padding: '9px 18px', background: '#1D9E75', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
            + Crear usuario
          </button>
        </div>

        {success && (
          <div style={{ background: 'rgba(29,158,117,0.1)', border: '0.5px solid #1D9E75', borderRadius: '8px', padding: '10px 14px', color: '#1D9E75', fontSize: '13px', marginBottom: '16px' }}>
            ✓ {success}
          </div>
        )}

        {/* FILTROS */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, email o usuario..."
            style={{ flex: 1, minWidth: '200px', background: '#0d1f14', border: '0.5px solid #1a3a24', borderRadius: '8px', padding: '8px 12px', color: '#9FE1CB', fontSize: '13px', outline: 'none' }} />
          {[
            { key: 'filterPlan', value: filterPlan, setter: setFilterPlan, options: [{ v: 'todos', l: 'Todos los planes' }, { v: 'free', l: 'Free' }, { v: 'pro', l: 'Pro' }] },
            { key: 'filterStatus', value: filterStatus, setter: setFilterStatus, options: [{ v: 'todos', l: 'Todos' }, { v: 'activo', l: 'Activos' }, { v: 'bloqueado', l: 'Bloqueados' }] },
          ].map(f => (
            <select key={f.key} value={f.value} onChange={e => f.setter(e.target.value)}
              style={{ background: '#0d1f14', border: '0.5px solid #1a3a24', borderRadius: '8px', padding: '8px 12px', color: '#9FE1CB', fontSize: '13px' }}>
              {f.options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
          ))}
        </div>

        {/* TABLA */}
        <div style={{ background: '#0d1f14', borderRadius: '10px', border: '0.5px solid #1a3a24', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '0.5px solid #1a3a24' }}>
                {['Usuario', 'Email', 'País', 'Plan', 'Estado', 'Último acceso', 'Registro', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: 'rgba(159,225,203,0.4)', fontSize: '10px', letterSpacing: '1px', fontWeight: '500' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: 'rgba(159,225,203,0.4)' }}>Cargando...</td></tr>
              ) : filteredUsers.map(u => (
                <tr key={u.id} style={{ borderBottom: '0.5px solid #1a3a24', opacity: u.blocked ? 0.6 : 1 }}>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#0f2e1a', border: '0.5px solid #1D9E75', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#1D9E75', fontWeight: '500', flexShrink: 0 }}>
                        {u.nombre?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div style={{ color: '#fff', fontWeight: '500' }}>{u.nombre} {u.apellido}</div>
                        <div style={{ color: 'rgba(159,225,203,0.4)', fontSize: '11px' }}>@{u.username || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', color: 'rgba(159,225,203,0.7)' }}>{u.email}</td>
                  <td style={{ padding: '10px 12px', color: 'rgba(159,225,203,0.6)' }}>{u.pais || '—'}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: u.plan === 'pro' ? '#0f2e1a' : '#1a1d24', color: u.plan === 'pro' ? '#1D9E75' : 'rgba(159,225,203,0.4)', border: `0.5px solid ${u.plan === 'pro' ? '#1D9E75' : '#2a2d34'}` }}>
                      {u.plan?.toUpperCase() || 'FREE'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', background: u.blocked ? 'rgba(226,75,74,0.15)' : 'rgba(29,158,117,0.1)', color: u.blocked ? '#E24B4A' : '#1D9E75', border: `0.5px solid ${u.blocked ? '#E24B4A' : '#1D9E75'}` }}>
                      {u.blocked ? '🔒 Bloqueado' : '✓ Activo'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', color: 'rgba(159,225,203,0.5)', fontSize: '11px' }}>{getLastLogin(u.last_login)}</td>
                  <td style={{ padding: '10px 12px', color: 'rgba(159,225,203,0.4)', fontSize: '11px' }}>{new Date(u.created_at).toLocaleDateString('es-ES')}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button onClick={() => setSelectedUser(u)}
                        style={{ padding: '4px 10px', background: 'transparent', border: '0.5px solid #1a3a24', borderRadius: '6px', color: '#9FE1CB', fontSize: '11px', cursor: 'pointer' }}>
                        Ver
                      </button>
                      <button onClick={() => handleImpersonate(u.id)}
                        style={{ padding: '4px 10px', background: 'transparent', border: '0.5px solid #3b82f6', borderRadius: '6px', color: '#3b82f6', fontSize: '11px', cursor: 'pointer' }}>
                        Ver Journals
                      </button>
                      {u.blocked ? (
                        <button onClick={() => handleBlock(u.id, false)}
                          style={{ padding: '4px 10px', background: 'transparent', border: '0.5px solid #1D9E75', borderRadius: '6px', color: '#1D9E75', fontSize: '11px', cursor: 'pointer' }}>
                          Habilitar
                        </button>
                      ) : (
                        <button onClick={() => setShowBlockModal(u)}
                          style={{ padding: '4px 10px', background: 'transparent', border: '0.5px solid #E24B4A', borderRadius: '6px', color: '#E24B4A', fontSize: '11px', cursor: 'pointer' }}>
                          Bloquear
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL VER USUARIO */}
      {selectedUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ background: '#0d1f14', border: '0.5px solid #1a3a24', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '480px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '500', color: '#fff' }}>Perfil del Usuario</h2>
              <button onClick={() => setSelectedUser(null)} style={{ background: 'transparent', border: 'none', color: 'rgba(159,225,203,0.5)', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '0.5px solid #1a3a24' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#0f2e1a', border: '1px solid #1D9E75', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#1D9E75', fontWeight: '500' }}>
                {selectedUser.nombre?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '500', color: '#fff' }}>{selectedUser.nombre} {selectedUser.apellido}</div>
                <div style={{ fontSize: '12px', color: 'rgba(159,225,203,0.5)' }}>@{selectedUser.username || '—'}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              {[
                { label: 'EMAIL', value: selectedUser.email },
                { label: 'TELÉFONO', value: selectedUser.telefono || '—' },
                { label: 'PAÍS', value: selectedUser.pais || '—' },
                { label: 'PLAN', value: selectedUser.plan?.toUpperCase() || 'FREE' },
                { label: 'ESTADO', value: selectedUser.blocked ? '🔒 Bloqueado' : '✓ Activo' },
                { label: 'ÚLTIMO ACCESO', value: getLastLogin(selectedUser.last_login) },
                { label: 'REGISTRO', value: new Date(selectedUser.created_at).toLocaleDateString('es-ES') },
                { label: 'ID', value: `#${selectedUser.id}` },
              ].map(item => (
                <div key={item.label} style={{ background: '#0a1a0f', borderRadius: '8px', padding: '10px 12px' }}>
                  <div style={{ fontSize: '9px', color: 'rgba(159,225,203,0.4)', letterSpacing: '1px', marginBottom: '4px' }}>{item.label}</div>
                  <div style={{ fontSize: '13px', color: '#9FE1CB' }}>{item.value}</div>
                </div>
              ))}
            </div>
            {selectedUser.blocked_reason && (
              <div style={{ background: 'rgba(226,75,74,0.1)', border: '0.5px solid #E24B4A', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#E24B4A', marginBottom: '16px' }}>
                Razón de bloqueo: {selectedUser.blocked_reason}
              </div>
            )}
            <button onClick={() => setSelectedUser(null)}
              style={{ width: '100%', padding: '9px', background: 'transparent', border: '0.5px solid #1a3a24', borderRadius: '8px', color: '#9FE1CB', fontSize: '13px', cursor: 'pointer' }}>
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* MODAL BLOQUEAR */}
      {showBlockModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ background: '#0d1f14', border: '0.5px solid #E24B4A', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '400px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '500', color: '#fff', marginBottom: '8px' }}>Bloquear usuario</h2>
            <p style={{ fontSize: '13px', color: 'rgba(159,225,203,0.5)', marginBottom: '16px' }}>
              {showBlockModal.nombre} {showBlockModal.apellido} — {showBlockModal.email}
            </p>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', color: 'rgba(159,225,203,0.5)', letterSpacing: '1px', marginBottom: '6px', display: 'block' }}>RAZÓN DEL BLOQUEO (opcional)</label>
              <textarea value={blockReason} onChange={e => setBlockReason(e.target.value)}
                placeholder="Ej: Violación de términos de uso..."
                rows={3}
                style={{ width: '100%', background: '#0a1a0f', border: '0.5px solid #1a3a24', borderRadius: '8px', padding: '10px 12px', color: '#9FE1CB', fontSize: '13px', resize: 'none', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => handleBlock(showBlockModal.id, true, blockReason)} disabled={saving}
                style={{ flex: 1, padding: '10px', background: '#E24B4A', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: '500', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Bloqueando...' : 'Confirmar bloqueo'}
              </button>
              <button onClick={() => { setShowBlockModal(null); setBlockReason('') }}
                style={{ flex: 1, padding: '10px', background: 'transparent', border: '0.5px solid #1a3a24', borderRadius: '8px', color: '#9FE1CB', fontSize: '13px', cursor: 'pointer' }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CREAR USUARIO */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ background: '#0d1f14', border: '0.5px solid #1a3a24', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '500', color: '#fff', marginBottom: '20px' }}>Crear nuevo usuario</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: 'NOMBRE *', key: 'nombre', placeholder: 'Nombre' },
                { label: 'APELLIDO', key: 'apellido', placeholder: 'Apellido' },
                { label: 'EMAIL *', key: 'email', placeholder: 'correo@email.com', type: 'email' },
                { label: 'TELÉFONO', key: 'telefono', placeholder: '+58 412...' },
                { label: 'PAÍS', key: 'pais', placeholder: 'Venezuela' },
                { label: 'USUARIO', key: 'username', placeholder: 'nombre_usuario' },
                { label: 'CONTRASEÑA *', key: 'password', placeholder: '••••••••', type: 'password' },
              ].map(f => (
                <div key={f.key} style={{ gridColumn: f.key === 'email' || f.key === 'password' ? 'span 2' : 'auto' }}>
                  <label style={{ fontSize: '11px', color: 'rgba(159,225,203,0.5)', letterSpacing: '1px', marginBottom: '6px', display: 'block' }}>{f.label}</label>
                  <input type={f.type || 'text'} value={(newUser as any)[f.key]} onChange={e => setNewUser({...newUser, [f.key]: e.target.value})}
                    placeholder={f.placeholder}
                    style={{ width: '100%', background: '#0a1a0f', border: '0.5px solid #1a3a24', borderRadius: '8px', padding: '9px 12px', color: '#9FE1CB', fontSize: '13px', outline: 'none' }} />
                </div>
              ))}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '11px', color: 'rgba(159,225,203,0.5)', letterSpacing: '1px', marginBottom: '6px', display: 'block' }}>PLAN</label>
                <select value={newUser.plan} onChange={e => setNewUser({...newUser, plan: e.target.value})}
                  style={{ width: '100%', background: '#0a1a0f', border: '0.5px solid #1a3a24', borderRadius: '8px', padding: '9px 12px', color: '#9FE1CB', fontSize: '13px' }}>
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={handleCreateUser} disabled={saving}
                style={{ flex: 1, padding: '10px', background: '#1D9E75', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: '500', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Creando...' : 'Crear usuario'}
              </button>
              <button onClick={() => setShowCreateModal(false)}
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
