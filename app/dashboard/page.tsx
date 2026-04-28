'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: number;
  nombre: string;
  email: string;
  plan: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.error('Error fetching user', err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1a0f] flex items-center justify-center text-white font-sans">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1D9E75]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1a0f] text-white font-sans">
      {/* 1. Navbar superior */}
      <nav className="bg-[#112a18] border-b border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-extrabold text-[#1D9E75] tracking-tight">TRAVITRADE</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <span className="font-medium">{user?.nombre}</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#1D9E75]/20 text-[#9FE1CB] border border-[#1D9E75]/30">
              {user?.plan.toUpperCase()}
            </span>
          </div>

          <div>
            <button 
              onClick={handleLogout}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* 2. Sección de bienvenida */}
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Bienvenido, <span className="text-[#9FE1CB]">{user?.nombre.split(' ')[0]}</span>
          </h1>
          <p className="text-gray-400 text-lg">Selecciona un producto para comenzar</p>
        </div>

        {/* 3. Grid de productos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Tarjeta 1 - Travi Journals */}
          <div className="bg-[#112a18] rounded-xl border border-[#1D9E75]/30 p-6 flex flex-col h-full shadow-lg shadow-[#1D9E75]/5 hover:border-[#1D9E75]/70 transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-[#1D9E75]/10 rounded-lg text-[#9FE1CB]">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-[#1D9E75]/20 text-[#9FE1CB] border border-[#1D9E75]/30">
                Disponible
              </span>
            </div>
            <h3 className="text-xl font-bold mb-2">Travi Journals</h3>
            <p className="text-gray-400 mb-8 flex-grow">Bitácora de trading, setups y estadísticas.</p>
            <Link 
              href="https://journals.travitrade.com" 
              className="w-full text-center py-2.5 bg-[#1D9E75] hover:bg-[#157a5a] text-white font-medium rounded-lg transition-colors"
            >
              Ingresar
            </Link>
          </div>

          {/* Tarjeta 2 - Travi Portafolio */}
          <div className="bg-[#0e1d13] rounded-xl border border-gray-800 p-6 flex flex-col h-full opacity-80">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-gray-800/50 rounded-lg text-gray-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-800 text-gray-400">
                Próximamente
              </span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-300">Travi Portafolio</h3>
            <p className="text-gray-500 mb-8 flex-grow">Seguimiento de inversiones en tiempo real.</p>
            <button disabled className="w-full py-2.5 bg-gray-800 text-gray-500 font-medium rounded-lg cursor-not-allowed">
              Próximamente
            </button>
          </div>

          {/* Tarjeta 3 - Travi Finance */}
          <div className="bg-[#0e1d13] rounded-xl border border-gray-800 p-6 flex flex-col h-full opacity-80">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-gray-800/50 rounded-lg text-gray-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-800 text-gray-400">
                Próximamente
              </span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-300">Travi Finance</h3>
            <p className="text-gray-500 mb-8 flex-grow">Gestión de finanzas personales.</p>
            <button disabled className="w-full py-2.5 bg-gray-800 text-gray-500 font-medium rounded-lg cursor-not-allowed">
              Próximamente
            </button>
          </div>
        </div>

        {/* 4. Sección de plan activo */}
        <div className="bg-[#112a18] rounded-xl border border-gray-800 p-8 flex flex-col md:flex-row items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Tu Plan Actual</h2>
            <p className="text-gray-400">
              Estás suscrito al plan <span className="text-[#9FE1CB] font-semibold">{user?.plan.toUpperCase()}</span>.
            </p>
          </div>
          
          <div className="mt-6 md:mt-0">
            {user?.plan.toLowerCase() === 'free' ? (
              <button className="px-6 py-3 bg-[#1D9E75] hover:bg-[#157a5a] text-white font-medium rounded-lg transition-colors shadow-lg shadow-[#1D9E75]/20">
                Actualizar a Premium
              </button>
            ) : (
              <span className="px-4 py-2 bg-[#1D9E75]/20 border border-[#1D9E75]/50 text-[#9FE1CB] font-semibold rounded-lg flex items-center space-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Plan Activo</span>
              </span>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
