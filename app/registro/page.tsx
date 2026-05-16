'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PHONE_CODES, COUNTRIES } from '@/lib/countries';

export default function RegistroPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    phoneCode: '+1',
    telefono: '',
    pais: 'Venezuela',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        telefono: `${formData.phoneCode} ${formData.telefono}`,
        pais: formData.pais,
        username: formData.username,
        password: formData.password,
      };

      const res = await fetch('/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(data.error || 'Error al crear cuenta');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1a0f] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-white font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="text-center">
          <div className="text-5xl font-extrabold tracking-tight mb-2">
            <span className="text-white">Travi</span><span className="text-[#1D9E75]">trade</span>
          </div>
          <p className="mt-2 text-sm text-gray-400">Crea una cuenta para comenzar</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-[#0d1f14] py-8 px-4 shadow-2xl sm:rounded-xl sm:px-10 border border-[#1a3a24]">
          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-800/50">
              Plan Gratuito — Sin tarjeta de crédito
            </span>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-300">Nombre</label>
                <div className="mt-1">
                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 bg-[#0a1a0f] text-white focus:outline-none focus:ring-[#1D9E75] focus:border-[#1D9E75] sm:text-sm transition-colors"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="apellido" className="block text-sm font-medium text-gray-300">Apellido</label>
                <div className="mt-1">
                  <input
                    id="apellido"
                    name="apellido"
                    type="text"
                    required
                    value={formData.apellido}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 bg-[#0a1a0f] text-white focus:outline-none focus:ring-[#1D9E75] focus:border-[#1D9E75] sm:text-sm transition-colors"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">Correo Electrónico</label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 bg-[#0a1a0f] text-white focus:outline-none focus:ring-[#1D9E75] focus:border-[#1D9E75] sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="telefono" className="block text-sm font-medium text-gray-300">Número de teléfono</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <select
                    name="phoneCode"
                    value={formData.phoneCode}
                    onChange={handleChange}
                    className="inline-flex items-center px-3 border border-r-0 border-gray-700 bg-gray-800 text-gray-300 sm:text-sm rounded-l-md focus:outline-none focus:ring-[#1D9E75] focus:border-[#1D9E75]"
                  >
                    {PHONE_CODES.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.flag} {item.code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    name="telefono"
                    id="telefono"
                    required
                    value={formData.telefono}
                    onChange={handleChange}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-700 bg-[#0a1a0f] text-white focus:outline-none focus:ring-[#1D9E75] focus:border-[#1D9E75] sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="pais" className="block text-sm font-medium text-gray-300">País</label>
                <div className="mt-1">
                  <select
                    id="pais"
                    name="pais"
                    required
                    value={formData.pais}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 bg-[#0a1a0f] text-white focus:outline-none focus:ring-[#1D9E75] focus:border-[#1D9E75] sm:text-sm transition-colors"
                  >
                    {COUNTRIES.map((country) => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300">Nombre de usuario</label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 bg-[#0a1a0f] text-white focus:outline-none focus:ring-[#1D9E75] focus:border-[#1D9E75] sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">Contraseña</label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 bg-[#0a1a0f] text-white focus:outline-none focus:ring-[#1D9E75] focus:border-[#1D9E75] sm:text-sm transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">Confirmar Contraseña</label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 bg-[#0a1a0f] text-white focus:outline-none focus:ring-[#1D9E75] focus:border-[#1D9E75] sm:text-sm transition-colors"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div style={{
                background: 'rgba(226,75,74,0.15)',
                border: '0.5px solid #E24B4A',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#E24B4A',
                fontSize: '13px',
                marginBottom: '16px'
              }}>
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1D9E75] hover:bg-[#157a5a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1D9E75] focus:ring-offset-[#0a1a0f] transition-colors disabled:opacity-50"
              >
                {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#0d1f14] text-gray-400">
                  ¿Ya tienes cuenta?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link href="/login" className="font-medium text-[#1D9E75] hover:text-[#157a5a] transition-colors">
                Inicia sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
