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

  const [journalStats, setJournalStats] = useState<any>(null)
  const [loadingStats, setLoadingStats] = useState(false)
  const [showJournalModal, setShowJournalModal] = useState<any>(null)
  const [selectedSetupAdmin, setSelectedSetupAdmin] = useState<string | null>(null)
  const [setupOpsAdmin, setSetupOpsAdmin] = useState<any[]>([])
  const [loadingSetupOpsAdmin, setLoadingSetupOpsAdmin] = useState(false)

  const handleViewSetupOps = async (setupName: string, userId: number) => {
    setSelectedSetupAdmin(setupName)
    setLoadingSetupOpsAdmin(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}/setup-ops?setup=${encodeURIComponent(setupName)}`)
      const data = await res.json()
      setSetupOpsAdmin(data.operations || [])
    } catch {
      setSetupOpsAdmin([])
    }
    setLoadingSetupOpsAdmin(false)
  }

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


  const handleViewJournalStats = async (user: any) => {
    setShowJournalModal(user)
    setLoadingStats(true)
    try {
      const res = await fetch(`/api/admin/users/${user.id}/journal-stats`)
      const data = await res.json()
      setJournalStats(data)
    } catch {
      setJournalStats(null)
    }
    setLoadingStats(false)
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
                  <td style={{ padding: '8px 12px' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>

                      {/* Ver perfil */}
                      <button onClick={() => setSelectedUser(u)}
                        style={{ padding: '4px 10px', background: 'transparent', border: '0.5px solid #1a3a24', borderRadius: '6px', color: '#9FE1CB', fontSize: '11px', cursor: 'pointer' }}>
                        Ver
                      </button>

                      {/* Stats Journals */}
                      <button onClick={() => handleViewJournalStats(u)}
                        style={{ padding: '4px 10px', background: 'transparent', border: '0.5px solid #3b82f6', borderRadius: '6px', color: '#3b82f6', fontSize: '11px', cursor: 'pointer' }}>
                        📊 Stats
                      </button>

                      {/* Bloquear / Habilitar */}
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

      {/* MODAL ESTADÍSTICAS JOURNALS */}
      {showJournalModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ background: '#0d1f14', border: '0.5px solid #1a3a24', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '500', color: '#fff' }}>Journals — {showJournalModal.nombre} {showJournalModal.apellido}</div>
                <div style={{ fontSize: '12px', color: 'rgba(159,225,203,0.5)', marginTop: '2px' }}>{showJournalModal.email}</div>
              </div>
              <button onClick={() => { setShowJournalModal(null); setJournalStats(null); setSelectedSetupAdmin(null); setSetupOpsAdmin([]) }}
                style={{ background: 'transparent', border: 'none', color: 'rgba(159,225,203,0.5)', fontSize: '22px', cursor: 'pointer' }}>×</button>
            </div>

            {loadingStats ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(159,225,203,0.4)' }}>Cargando datos...</div>
            ) : !journalStats ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(159,225,203,0.4)' }}>No hay datos disponibles</div>
            ) : (
              <>
                {/* MÉTRICAS GLOBALES */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '20px' }}>
                  {[
                    { label: 'TOTAL OPS', value: journalStats.globalStats?.total_ops || 0, color: '#fff' },
                    { label: 'WIN RATE', value: `${journalStats.globalStats?.winRate || 0}%`, color: parseFloat(journalStats.globalStats?.winRate || '0') >= 50 ? '#1D9E75' : '#E24B4A' },
                    { label: 'PNL TOTAL', value: `$${parseFloat(journalStats.globalStats?.total_pnl || 0).toFixed(2)}`, color: parseFloat(journalStats.globalStats?.total_pnl || '0') >= 0 ? '#1D9E75' : '#E24B4A' },
                    { label: 'CUENTAS', value: journalStats.accounts?.length || 0, color: '#3b82f6' },
                  ].map(m => (
                    <div key={m.label} style={{ background: '#0a1a0f', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '9px', color: 'rgba(159,225,203,0.4)', letterSpacing: '1px', marginBottom: '6px' }}>{m.label}</div>
                      <div style={{ fontSize: '18px', fontWeight: '500', color: m.color }}>{m.value}</div>
                    </div>
                  ))}
                </div>

                {/* DISTRIBUCIÓN */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '20px' }}>
                  {[
                    { label: 'GANADAS', value: journalStats.globalStats?.wins || 0, color: '#1D9E75' },
                    { label: 'PERDIDAS', value: journalStats.globalStats?.losses || 0, color: '#E24B4A' },
                    { label: 'BREAK EVEN', value: journalStats.globalStats?.be || 0, color: '#F59E0B' },
                  ].map(m => (
                    <div key={m.label} style={{ background: '#0a1a0f', borderRadius: '8px', padding: '10px', textAlign: 'center', border: `0.5px solid ${m.color}22` }}>
                      <div style={{ fontSize: '9px', color: 'rgba(159,225,203,0.4)', letterSpacing: '1px', marginBottom: '4px' }}>{m.label}</div>
                      <div style={{ fontSize: '20px', fontWeight: '500', color: m.color }}>{m.value}</div>
                    </div>
                  ))}
                </div>

                {/* ESTADÍSTICAS POR SETUP */}
                {journalStats.bySetupDirection && journalStats.bySetupDirection.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '12px', color: 'rgba(159,225,203,0.5)', letterSpacing: '1px', marginBottom: '10px' }}>ESTADÍSTICAS POR SETUP</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                      <thead>
                        <tr>
                          {['Setup', 'Ops', 'Wins', 'Losses', 'BE', 'Win Rate', 'PNL Total'].map(h => (
                            <th key={h} style={{ padding: '6px 8px', textAlign: 'left', color: 'rgba(159,225,203,0.4)', fontSize: '10px', letterSpacing: '1px', borderBottom: '0.5px solid #1a3a24' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {journalStats.bySetupDirection.map((s: any, i: number) => {
                          const total = parseInt(s.total || '0', 10)
                          const wins = parseInt(s.wins || '0', 10)
                          const wr = total > 0 ? ((wins / total) * 100).toFixed(1) : 0
                          const pnl = parseFloat(s.total_pnl || '0')
                          return (
                            <tr key={i}
                              onClick={() => handleViewSetupOps(s.setup_name, showJournalModal.id)}
                              style={{ borderBottom: '0.5px solid #1a3a24', cursor: 'pointer', transition: 'background 0.15s' }}
                              onMouseEnter={e => e.currentTarget.style.background = '#0f2a1a'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                              title="Clic para ver operaciones de este setup"
                            >
                              <td style={{ padding: '6px 8px', color: '#fff', fontWeight: '500' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.setup_color || '#1D9E75' }} />
                                  {s.setup_name}
                                </span>
                              </td>
                              <td style={{ padding: '6px 8px', color: 'rgba(159,225,203,0.6)' }}>{s.total}</td>
                              <td style={{ padding: '6px 8px', color: '#1D9E75' }}>{s.wins}</td>
                              <td style={{ padding: '6px 8px', color: '#E24B4A' }}>{s.losses}</td>
                              <td style={{ padding: '6px 8px', color: '#F59E0B' }}>{s.be}</td>
                              <td style={{ padding: '6px 8px', color: parseFloat(wr as string) >= 50 ? '#1D9E75' : '#E24B4A' }}>{wr}%</td>
                              <td style={{ padding: '6px 8px', color: pnl >= 0 ? '#1D9E75' : '#E24B4A', fontWeight: '500' }}>
                                {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* VISTA OPERACIONES DEL SETUP SELECCIONADO */}
                {selectedSetupAdmin && (
                  <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                      <button onClick={() => { setSelectedSetupAdmin(null); setSetupOpsAdmin([]) }}
                        style={{ padding: '4px 10px', background: 'transparent', border: '0.5px solid #1a3a24', borderRadius: '6px', color: 'rgba(159,225,203,0.6)', fontSize: '12px', cursor: 'pointer' }}>
                        ← Volver
                      </button>
                      <div style={{ fontSize: '13px', fontWeight: '500', color: '#fff' }}>{selectedSetupAdmin}</div>
                      <span style={{ fontSize: '11px', color: 'rgba(159,225,203,0.4)' }}>{setupOpsAdmin.length} operaciones</span>
                    </div>

                    {loadingSetupOpsAdmin ? (
                      <div style={{ textAlign: 'center', padding: '24px', color: 'rgba(159,225,203,0.4)' }}>Cargando...</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
                        {setupOpsAdmin.map((op: any) => (
                          <div key={op.id} style={{ background: '#0a1a0f', borderRadius: '10px', padding: '12px 14px', border: '0.5px solid #1a3a24', display: 'grid', gridTemplateColumns: op.image_url ? '1fr 130px' : '1fr', gap: '12px', alignItems: 'start' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '13px', fontWeight: '500', color: '#fff' }}>{op.symbol}</span>
                                <span style={{ fontSize: '11px', padding: '1px 8px', borderRadius: '20px',
                                  background: op.side === 'LONG' ? 'rgba(29,158,117,0.15)' : 'rgba(226,75,74,0.15)',
                                  color: op.side === 'LONG' ? '#1D9E75' : '#E24B4A',
                                  border: `0.5px solid ${op.side === 'LONG' ? '#1D9E75' : '#E24B4A'}` }}>
                                  {op.side === 'LONG' ? '↑ LONG' : '↓ SHORT'}
                                </span>
                                <span style={{ fontSize: '11px', color: 'rgba(159,225,203,0.4)' }}>{op.date}</span>
                                {op.sesion && <span style={{ fontSize: '11px', color: 'rgba(159,225,203,0.4)' }}>🕐 {op.sesion}</span>}
                                <span style={{ fontSize: '10px', padding: '1px 8px', borderRadius: '20px',
                                  background: op.result_type === 'GANADA' ? 'rgba(29,158,117,0.15)' : op.result_type === 'PERDIDA' ? 'rgba(226,75,74,0.15)' : 'rgba(245,158,11,0.15)',
                                  color: op.result_type === 'GANADA' ? '#1D9E75' : op.result_type === 'PERDIDA' ? '#E24B4A' : '#F59E0B',
                                  border: `0.5px solid ${op.result_type === 'GANADA' ? '#1D9E75' : op.result_type === 'PERDIDA' ? '#E24B4A' : '#F59E0B'}` }}>
                                  {op.result_type === 'GANADA' ? '✓ TP' : op.result_type === 'PERDIDA' ? '✗ SL' : '— BE'}
                                </span>
                              </div>
                              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '15px', fontWeight: '500', color: parseFloat(op.pnl) >= 0 ? '#1D9E75' : '#E24B4A' }}>
                                  {parseFloat(op.pnl) >= 0 ? '+' : ''}${parseFloat(op.pnl).toFixed(2)}
                                </span>
                                {op.contratos && <span style={{ fontSize: '11px', color: 'rgba(159,225,203,0.4)' }}>{op.contratos} ctto{op.contratos > 1 ? 's' : ''}</span>}
                                {op.account_name && <span style={{ fontSize: '11px', color: 'rgba(159,225,203,0.3)' }}>📁 {op.account_name}</span>}
                              </div>
                              {op.notes && <div style={{ fontSize: '12px', color: 'rgba(159,225,203,0.5)', marginTop: '6px', fontStyle: 'italic' }}>"{op.notes}"</div>}
                            </div>
                            {op.image_url && (
                              <a href={op.image_url} target="_blank" rel="noopener noreferrer">
                                <img src={op.image_url} alt="Captura"
                                  style={{ width: '130px', height: '85px', objectFit: 'cover', borderRadius: '8px', border: '0.5px solid #1a3a24', cursor: 'pointer', display: 'block' }}
                                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                                />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* CUENTAS */}
                {journalStats.accountStats && journalStats.accountStats.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '12px', color: 'rgba(159,225,203,0.5)', letterSpacing: '1px', marginBottom: '10px' }}>CUENTAS DE TRADING</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {journalStats.accountStats.map((acc: any) => {
                        const ops = parseInt(acc.total_ops || '0', 10)
                        const wins = parseInt(acc.wins || '0', 10)
                        const wr = ops > 0 ? ((wins / ops) * 100).toFixed(1) : 0
                        return (
                          <div key={acc.id} style={{ background: '#0a1a0f', borderRadius: '8px', padding: '12px 14px', border: '0.5px solid #1a3a24' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <div>
                                <div style={{ fontSize: '13px', fontWeight: '500', color: '#fff' }}>{acc.name}</div>
                                <div style={{ fontSize: '11px', color: 'rgba(159,225,203,0.4)' }}>{acc.broker || '—'} · {acc.type}</div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '14px', fontWeight: '500', color: parseFloat(acc.total_pnl || 0) >= 0 ? '#1D9E75' : '#E24B4A' }}>
                                  {parseFloat(acc.total_pnl || 0) >= 0 ? '+' : ''}${parseFloat(acc.total_pnl || 0).toFixed(2)}
                                </div>
                                <div style={{ fontSize: '11px', color: 'rgba(159,225,203,0.4)' }}>Win Rate: {wr}%</div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', fontSize: '11px' }}>
                              <span style={{ color: 'rgba(159,225,203,0.6)' }}>{acc.total_ops} ops</span>
                              <span style={{ color: '#1D9E75' }}>{acc.wins}G</span>
                              <span style={{ color: '#E24B4A' }}>{acc.losses}P</span>
                              <span style={{ color: '#F59E0B' }}>{acc.be}BE</span>
                              {acc.last_operation && <span style={{ color: 'rgba(159,225,203,0.4)' }}>Última: {acc.last_operation}</span>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* ÚLTIMAS OPERACIONES */}
                {journalStats.recentOps && journalStats.recentOps.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '12px', color: 'rgba(159,225,203,0.5)', letterSpacing: '1px', marginBottom: '10px' }}>ÚLTIMAS OPERACIONES</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                      <thead>
                        <tr>
                          {['Fecha', 'Símbolo', 'Dirección', 'Setup', 'PNL', 'Resultado'].map(h => (
                            <th key={h} style={{ padding: '6px 8px', textAlign: 'left', color: 'rgba(159,225,203,0.4)', fontSize: '10px', letterSpacing: '1px', borderBottom: '0.5px solid #1a3a24' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {journalStats.recentOps.map((op: any) => (
                          <tr key={op.id} style={{ borderBottom: '0.5px solid #1a3a24' }}>
                            <td style={{ padding: '6px 8px', color: 'rgba(159,225,203,0.6)' }}>{op.date}</td>
                            <td style={{ padding: '6px 8px', color: '#fff', fontWeight: '500' }}>{op.symbol}</td>
                            <td style={{ padding: '6px 8px', color: op.side === 'LONG' ? '#1D9E75' : '#E24B4A' }}>{op.side}</td>
                            <td style={{ padding: '6px 8px', color: 'rgba(159,225,203,0.6)' }}>{op.setup_name || '—'}</td>
                            <td style={{ padding: '6px 8px', color: parseFloat(op.pnl || 0) >= 0 ? '#1D9E75' : '#E24B4A', fontWeight: '500' }}>
                              {parseFloat(op.pnl || 0) >= 0 ? '+' : ''}${parseFloat(op.pnl || 0).toFixed(2)}
                            </td>
                            <td style={{ padding: '6px 8px' }}>
                              <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '20px',
                                background: op.result_type === 'GANADA' ? 'rgba(29,158,117,0.15)' : op.result_type === 'PERDIDA' ? 'rgba(226,75,74,0.15)' : 'rgba(245,158,11,0.15)',
                                color: op.result_type === 'GANADA' ? '#1D9E75' : op.result_type === 'PERDIDA' ? '#E24B4A' : '#F59E0B' }}>
                                {op.result_type === 'GANADA' ? '✓' : op.result_type === 'PERDIDA' ? '✗' : '—'} {op.result_type}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* ACTIVIDAD MENSUAL */}
                {journalStats.monthlyActivity && journalStats.monthlyActivity.length > 0 && (
                  <div>
                    <div style={{ fontSize: '12px', color: 'rgba(159,225,203,0.5)', letterSpacing: '1px', marginBottom: '10px' }}>ACTIVIDAD MENSUAL</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {journalStats.monthlyActivity.map((m: any) => (
                        <div key={m.month} style={{ background: '#0a1a0f', borderRadius: '8px', padding: '10px 14px', border: '0.5px solid #1a3a24', textAlign: 'center', minWidth: '80px' }}>
                          <div style={{ fontSize: '10px', color: 'rgba(159,225,203,0.4)', marginBottom: '4px' }}>{m.month}</div>
                          <div style={{ fontSize: '13px', fontWeight: '500', color: '#fff' }}>{m.ops} ops</div>
                          <div style={{ fontSize: '11px', color: parseFloat(m.pnl || 0) >= 0 ? '#1D9E75' : '#E24B4A' }}>
                            {parseFloat(m.pnl || 0) >= 0 ? '+' : ''}${parseFloat(m.pnl || 0).toFixed(0)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(journalStats.globalStats?.total_ops === '0' || journalStats.globalStats?.total_ops === 0) ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(159,225,203,0.4)', fontSize: '13px' }}>
                    Este usuario aún no tiene operaciones registradas
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
