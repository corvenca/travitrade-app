'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { COUNTRIES } from '@/lib/countries';
import { 
  LayoutGrid, 
  BookOpen, 
  PieChart, 
  Wallet, 
  User as UserIcon, 
  Settings,
  CheckCircle2,
  Lock,
  ArrowLeft
} from 'lucide-react';

interface UserProfile {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  pais: string;
  username: string;
  plan: string;
  created_at: string;
}

interface Subscription {
  id: number;
  plan: string;
  monto: number;
  estado: string;
  created_at: string;
}

export default function PerfilPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    pais: '',
    username: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setSubscriptions(data.subscriptions);
        setFormData({
          nombre: data.user.nombre || '',
          apellido: data.user.apellido || '',
          telefono: data.user.telefono || '',
          pais: data.user.pais || '',
          username: data.user.username || ''
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error al guardar');
      } else {
        setSuccess('Perfil actualizado correctamente');
        setIsEditing(false);
        fetchProfile();
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1a0f] flex items-center justify-center text-white">
        Cargando perfil...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0a1a0f] flex flex-col items-center justify-center text-white">
        <h2 className="text-xl mb-4">Error al cargar el perfil</h2>
        <Link href="/dashboard" className="text-[#1D9E75] hover:underline">Volver al dashboard</Link>
      </div>
    );
  }

  const initials = `${profile.nombre?.charAt(0) || ''}${profile.apellido?.charAt(0) || ''}`.toUpperCase();

  return (
    <div className="min-h-screen bg-[#0a1a0f] text-white flex">
      {/* SIDEBAR */}
      <aside className="w-[260px] fixed top-0 left-0 h-full border-r border-gray-800 bg-[#0a1a0f] flex flex-col p-6 overflow-y-auto z-10 hidden md:flex">
        <div className="mb-10">
          <div className="text-3xl font-extrabold tracking-tight">
            <span className="text-white">Travi</span><span className="text-[#1D9E75]">trade</span>
          </div>
          <p className="text-xs text-gray-500 mt-1 font-medium tracking-widest">APP · V1.0</p>
        </div>

        <div className="mb-8">
          <p className="text-xs text-gray-500 mb-3 font-semibold tracking-wider">GENERAL</p>
          <Link href="/dashboard">
            <div className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800/30 rounded-lg font-medium cursor-pointer transition-colors mb-1">
              <LayoutGrid size={20} />
              <span>Dashboard</span>
            </div>
          </Link>
        </div>

        <div className="mb-8">
          <p className="text-xs text-gray-500 mb-3 font-semibold tracking-wider">HERRAMIENTAS</p>
          <div className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800/30 rounded-lg font-medium cursor-pointer transition-colors mb-1">
            <BookOpen size={20} />
            <span>Travi Journals</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800/30 rounded-lg font-medium cursor-pointer transition-colors mb-1">
            <PieChart size={20} />
            <span>Travi Portafolio</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800/30 rounded-lg font-medium cursor-pointer transition-colors">
            <Wallet size={20} />
            <span>Travi Finance</span>
          </div>
        </div>

        <div className="mt-auto">
          <p className="text-xs text-gray-500 mb-3 font-semibold tracking-wider">CUENTA</p>
          <div className="flex items-center gap-3 px-4 py-3 bg-[#112a18] rounded-lg text-[#1D9E75] font-medium cursor-pointer mb-1">
            <UserIcon size={20} />
            <span>Perfil</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800/30 rounded-lg font-medium cursor-pointer transition-colors">
            <Settings size={20} />
            <span>Ajustes</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="md:ml-[260px] flex-1 p-8">
        <Link href="/dashboard" className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft size={16} className="mr-2" />
          Volver al Dashboard
        </Link>

        <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>

        {/* 1. Header del Perfil */}
        <div className="bg-[#0d1f14] border border-[#1a3a24] rounded-xl p-8 mb-8 flex flex-col md:flex-row items-center justify-between border-t-4 border-t-[#1D9E75]">
          <div className="flex items-center gap-6 mb-6 md:mb-0">
            <div className="w-24 h-24 rounded-full bg-[#112a18] flex items-center justify-center border-2 border-[#1D9E75]">
              <span className="text-3xl font-bold text-[#1D9E75]">{initials}</span>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold">{profile.nombre} {profile.apellido}</h2>
                <span className="px-3 py-1 bg-green-900/30 border border-green-800/50 rounded-full text-[#9FE1CB] text-xs font-bold tracking-wide uppercase">
                  {profile.plan || 'FREE'}
                </span>
              </div>
              <p className="text-gray-400 font-medium mb-1">@{profile.username}</p>
              <p className="text-gray-500 text-sm">{profile.email}</p>
            </div>
          </div>
          <button onClick={() => {
            if (profile) {
              setFormData({
                nombre: profile.nombre || '',
                apellido: profile.apellido || '',
                telefono: profile.telefono || '',
                pais: profile.pais || '',
                username: profile.username || ''
              });
            }
            setIsEditing(true);
          }} className="px-6 py-2.5 bg-transparent border border-gray-600 hover:border-gray-400 text-white font-medium rounded-lg transition-colors">
            Editar perfil
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* COLUMNA IZQUIERDA */}
          <div className="space-y-8">
            {/* 2. Información Personal */}
            <div className="bg-[#0d1f14] border border-[#1a3a24] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#1a3a24] bg-[#0a1a0f]/50">
                <h3 className="text-lg font-bold">Información Personal</h3>
              </div>
              <div className="p-6">
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '11px', color: 'rgba(159,225,203,0.5)', marginBottom: '4px', display: 'block' }}>NOMBRE</label>
                        <input value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})}
                          style={{ width: '100%', background: '#0a1a0f', border: '0.5px solid #1a3a24', borderRadius: '6px', padding: '8px 10px', color: '#9FE1CB', fontSize: '13px' }} />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', color: 'rgba(159,225,203,0.5)', marginBottom: '4px', display: 'block' }}>APELLIDO</label>
                        <input value={formData.apellido} onChange={e => setFormData({...formData, apellido: e.target.value})}
                          style={{ width: '100%', background: '#0a1a0f', border: '0.5px solid #1a3a24', borderRadius: '6px', padding: '8px 10px', color: '#9FE1CB', fontSize: '13px' }} />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: 'rgba(159,225,203,0.5)', marginBottom: '4px', display: 'block' }}>USUARIO</label>
                      <input value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})}
                        style={{ width: '100%', background: '#0a1a0f', border: '0.5px solid #1a3a24', borderRadius: '6px', padding: '8px 10px', color: '#9FE1CB', fontSize: '13px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: 'rgba(159,225,203,0.5)', marginBottom: '4px', display: 'block' }}>TELÉFONO</label>
                      <input value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})}
                        style={{ width: '100%', background: '#0a1a0f', border: '0.5px solid #1a3a24', borderRadius: '6px', padding: '8px 10px', color: '#9FE1CB', fontSize: '13px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: 'rgba(159,225,203,0.5)', marginBottom: '4px', display: 'block' }}>PAÍS</label>
                      <select value={formData.pais} onChange={e => setFormData({...formData, pais: e.target.value})}
                        style={{ width: '100%', background: '#0a1a0f', border: '0.5px solid #1a3a24', borderRadius: '6px', padding: '8px 10px', color: '#9FE1CB', fontSize: '13px' }}>
                        <option value="">Selecciona un país</option>
                        {COUNTRIES.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    {error && <div style={{ color: '#E24B4A', fontSize: '12px', padding: '8px', background: 'rgba(226,75,74,0.1)', borderRadius: '6px' }}>{error}</div>}
                    {success && <div style={{ color: '#1D9E75', fontSize: '12px', padding: '8px', background: 'rgba(29,158,117,0.1)', borderRadius: '6px' }}>{success}</div>}

                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <button type="button" onClick={handleSave} disabled={saving}
                        style={{ flex: 1, padding: '9px', background: '#1D9E75', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                        {saving ? 'Guardando...' : 'Guardar cambios'}
                      </button>
                      <button type="button" onClick={() => { setIsEditing(false); setError(''); setSuccess('') }}
                        style={{ flex: 1, padding: '9px', background: 'transparent', border: '0.5px solid #1a3a24', borderRadius: '8px', color: '#9FE1CB', fontSize: '13px', cursor: 'pointer' }}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Nombre y Apellido</p>
                      <p className="font-medium">{profile.nombre} {profile.apellido}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Correo Electrónico</p>
                      <p className="font-medium">{profile.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Teléfono</p>
                      <p className="font-medium">{profile.telefono || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">País</p>
                      <p className="font-medium">{profile.pais || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Fecha de Registro</p>
                      <p className="font-medium">{new Date(profile.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Plan Actual */}
            <div className="bg-[#0d1f14] border border-[#1a3a24] rounded-xl overflow-hidden border-t-2 border-t-[#9FE1CB]">
              <div className="px-6 py-4 border-b border-[#1a3a24] bg-[#0a1a0f]/50 flex justify-between items-center">
                <h3 className="text-lg font-bold">Plan Actual</h3>
                <span className="px-3 py-1 bg-[#112a18] text-[#9FE1CB] border border-[#1D9E75]/30 rounded-lg text-sm font-bold uppercase">
                  {profile.plan || 'FREE'}
                </span>
              </div>
              <div className="p-6">
                <p className="text-gray-400 text-sm mb-6">
                  {profile.plan === 'free' || !profile.plan 
                    ? 'Estás en el plan gratuito con acceso limitado a nuestras herramientas.' 
                    : 'Disfrutas de acceso total a todas nuestras herramientas.'}
                </p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle2 size={18} className="text-[#1D9E75]" />
                    <span>Travi Journals — Acceso limitado</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <Lock size={18} />
                    <span>Travi Portafolio — Próximamente</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <Lock size={18} />
                    <span>Travi Finance — Próximamente</span>
                  </div>
                </div>

                <button className="w-full py-3 bg-[#1D9E75] hover:bg-[#157a5a] text-white font-bold rounded-lg transition-colors">
                  Actualizar a Premium
                </button>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA */}
          <div className="space-y-8">
            {/* 4. Servicios Activos */}
            <div className="bg-[#0d1f14] border border-[#1a3a24] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#1a3a24] bg-[#0a1a0f]/50">
                <h3 className="text-lg font-bold">Servicios Activos</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 border border-[#1a3a24] rounded-lg bg-[#0a1a0f]/30">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#112a18] rounded-md flex items-center justify-center text-[#1D9E75]">
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold">Travi Journals</h4>
                      <p className="text-xs text-gray-400">Diario de trading</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-900/20 text-green-400 text-xs font-semibold rounded border border-green-800/30">
                    Activo
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 border border-[#1a3a24] rounded-lg bg-[#0a1a0f]/30 opacity-70">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#112a18] rounded-md flex items-center justify-center text-gray-500">
                      <PieChart size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-300">Travi Portafolio</h4>
                      <p className="text-xs text-gray-500">Rastreador de inversiones</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-gray-800 text-gray-400 text-xs font-semibold rounded border border-gray-700">
                    Próximamente
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 border border-[#1a3a24] rounded-lg bg-[#0a1a0f]/30 opacity-70">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#112a18] rounded-md flex items-center justify-center text-gray-500">
                      <Wallet size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-300">Travi Finance</h4>
                      <p className="text-xs text-gray-500">Finanzas personales</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-gray-800 text-gray-400 text-xs font-semibold rounded border border-gray-700">
                    Próximamente
                  </span>
                </div>
              </div>
            </div>

            {/* 5. Suscripciones y Facturas */}
            <div className="bg-[#0d1f14] border border-[#1a3a24] rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#1a3a24] bg-[#0a1a0f]/50">
                <h3 className="text-lg font-bold">Suscripciones y Facturas</h3>
              </div>
              <div className="p-0">
                {subscriptions.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    No tienes facturas registradas aún
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#1a3a24] text-xs uppercase text-gray-500 bg-[#0a1a0f]/20">
                          <th className="px-6 py-4 font-semibold">Fecha</th>
                          <th className="px-6 py-4 font-semibold">Plan</th>
                          <th className="px-6 py-4 font-semibold">Monto</th>
                          <th className="px-6 py-4 font-semibold">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {subscriptions.map((sub) => {
                          let badgeClass = "bg-gray-800 text-gray-400";
                          if (sub.estado === 'Pagado' || sub.estado === 'Activo') badgeClass = "bg-green-900/30 text-green-400 border border-green-800/30";
                          else if (sub.estado === 'Pendiente') badgeClass = "bg-yellow-900/30 text-yellow-400 border border-yellow-800/30";
                          else if (sub.estado === 'Cancelado') badgeClass = "bg-red-900/30 text-red-400 border border-red-800/30";

                          return (
                            <tr key={sub.id} className="border-b border-[#1a3a24] hover:bg-[#112a18]/50 transition-colors">
                              <td className="px-6 py-4 text-gray-300">{new Date(sub.created_at).toLocaleDateString()}</td>
                              <td className="px-6 py-4 font-medium uppercase">{sub.plan}</td>
                              <td className="px-6 py-4">${sub.monto}</td>
                              <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${badgeClass}`}>
                                  {sub.estado}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
