'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MarketTicker from '@/components/MarketTicker';
import SidebarLink from '@/components/SidebarLink';
import LogoutButton from '@/components/LogoutButton';
import { 
  LayoutGrid, 
  BookOpen, 
  PieChart, 
  Wallet, 
  User, 
  Settings,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

export default function DashboardPage() {
  const [userStats, setUserStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/user/summary')
      .then(r => r.json())
      .then(data => setUserStats(data))
      .catch(() => {})
  }, []);

  const userName = userStats?.userName || 'Usuario';

  return (
    <div className="min-h-screen bg-[#0a1a0f] text-white flex">
      {/* SIDEBAR */}
      <aside className="w-[260px] fixed top-0 left-0 h-full border-r border-gray-800 bg-[#0a1a0f] flex flex-col p-6 overflow-y-auto">
        <div className="mb-10">
          <div className="text-3xl font-extrabold tracking-tight">
            <span className="text-white">Travi</span><span className="text-[#1D9E75]">trade</span>
          </div>
          <p className="text-xs text-gray-500 mt-1 font-medium tracking-widest">APP · V1.0</p>
        </div>

        <div className="mb-8">
          <p className="text-xs text-gray-500 mb-3 font-semibold tracking-wider">GENERAL</p>
          <div className="flex items-center gap-3 px-4 py-3 bg-[#112a18] rounded-lg text-[#1D9E75] font-medium cursor-pointer">
            <LayoutGrid size={20} />
            <span>Dashboard</span>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-xs text-gray-500 mb-3 font-semibold tracking-wider">HERRAMIENTAS</p>
          <SidebarLink href="https://journals.travitrade.com">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 10 L4 7 L7 9 L10 4 L13 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Travi Journals
          </SidebarLink>
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
          <Link href="/perfil">
            <div className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800/30 rounded-lg font-medium cursor-pointer transition-colors mb-1">
              <User size={20} />
              <span>Perfil</span>
            </div>
          </Link>
          <div className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800/30 rounded-lg font-medium cursor-pointer transition-colors">
            <Settings size={20} />
            <span>Ajustes</span>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="ml-[260px] flex-1 flex flex-col">
        <MarketTicker />
        <div className="p-8 flex-1">
        {/* HEADER */}
        <header className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
            <p className="text-gray-400">Martes 28 abril, 2026</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-green-900/30 border border-green-800/50 rounded-full text-green-400 text-sm font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Mercado abierto
            </div>
            <div className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-full text-gray-300 text-sm font-medium">
              NQ 21,430
            </div>
            <div className="px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-full text-gray-300 text-sm font-medium">
              MNQ 2,143
            </div>
          </div>
        </header>

        {/* METRICS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '24px' }}>
          <div style={{ background: '#0d1f14', borderRadius: '10px', padding: '16px', borderTop: '2px solid #1D9E75' }}>
            <div style={{ fontSize: '10px', color: 'rgba(159,225,203,0.4)', letterSpacing: '1.5px', marginBottom: '8px' }}>PNL TOTAL</div>
            <div style={{ fontSize: '22px', fontWeight: '500', color: parseFloat(userStats?.totalPnl) >= 0 ? '#1D9E75' : '#E24B4A' }}>
              {parseFloat(userStats?.totalPnl) >= 0 ? '+' : ''}${userStats?.totalPnl || '0.00'}
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(159,225,203,0.4)', marginTop: '3px' }}>
              Este mes: {parseFloat(userStats?.thisMonthPnl) >= 0 ? '+' : ''}${userStats?.thisMonthPnl || '0.00'}
            </div>
          </div>
          <div style={{ background: '#0d1f14', borderRadius: '10px', padding: '16px', borderTop: '2px solid #3b82f6' }}>
            <div style={{ fontSize: '10px', color: 'rgba(159,225,203,0.4)', letterSpacing: '1.5px', marginBottom: '8px' }}>WIN RATE</div>
            <div style={{ fontSize: '22px', fontWeight: '500', color: '#fff' }}>{userStats?.winRate || '0'}%</div>
            <div style={{ fontSize: '11px', color: 'rgba(159,225,203,0.4)', marginTop: '3px' }}>
              {userStats?.totalWins || 0}G · {userStats?.totalLosses || 0}P · {userStats?.totalBE || 0}BE
            </div>
          </div>
          <div style={{ background: '#0d1f14', borderRadius: '10px', padding: '16px', borderTop: '2px solid #F59E0B' }}>
            <div style={{ fontSize: '10px', color: 'rgba(159,225,203,0.4)', letterSpacing: '1.5px', marginBottom: '8px' }}>OPERACIONES</div>
            <div style={{ fontSize: '22px', fontWeight: '500', color: '#fff' }}>{userStats?.totalOps || 0}</div>
            <div style={{ fontSize: '11px', color: 'rgba(159,225,203,0.4)', marginTop: '3px' }}>
              {userStats?.totalAccounts || 0} cuenta{userStats?.totalAccounts !== 1 ? 's' : ''}
            </div>
          </div>
          <div style={{ background: '#0d1f14', borderRadius: '10px', padding: '16px', borderTop: '2px solid #9FE1CB' }}>
            <div style={{ fontSize: '10px', color: 'rgba(159,225,203,0.4)', letterSpacing: '1.5px', marginBottom: '8px' }}>MEJOR TRADE</div>
            <div style={{ fontSize: '22px', fontWeight: '500', color: '#1D9E75' }}>+${userStats?.bestTrade || '0.00'}</div>
            <div style={{ fontSize: '11px', color: 'rgba(159,225,203,0.4)', marginTop: '3px' }}>
              Peor: ${userStats?.worstTrade || '0.00'}
            </div>
          </div>
        </div>

        {/* WELCOME / USER INFO */}
        <div className="mb-8">
          <h2 className="text-xl font-bold">Bienvenido de nuevo, {userName}</h2>
          <p className="text-gray-400 mt-1">Explora tus herramientas de trading y finanzas.</p>
        </div>

        {/* TUS HERRAMIENTAS */}
        <h3 className="text-lg font-bold mb-6">TUS HERRAMIENTAS</h3>
        <div className="grid grid-cols-3 gap-6">
          {/* Tool 1 */}
          <div className="bg-[#0d1f14] border border-gray-800 p-6 rounded-xl flex flex-col">
            <div className="w-12 h-12 bg-[#112a18] rounded-lg flex items-center justify-center text-[#1D9E75] mb-4">
              <BookOpen size={24} />
            </div>
            <h4 className="text-lg font-bold mb-2">Travi Journals</h4>
            <p className="text-gray-400 text-sm mb-6 flex-1">
              Registra y analiza cada operación. Patrones y disciplina
            </p>
            <a 
              href="https://journals.travitrade.com" 
              rel="noopener noreferrer"
              style={{
                display: 'block',
                width: '100%',
                padding: '10px',
                background: '#1D9E75',
                color: '#fff',
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: '500',
                textDecoration: 'none',
                marginTop: 'auto'
              }}
            >
              Ingresar
            </a>
          </div>
          
          {/* Tool 2 */}
          <div className="bg-[#0d1f14] border border-gray-800 p-6 rounded-xl flex flex-col opacity-80">
            <div className="w-12 h-12 bg-[#112a18] rounded-lg flex items-center justify-center text-[#1D9E75] mb-4">
              <PieChart size={24} />
            </div>
            <h4 className="text-lg font-bold mb-2">Travi Portafolio</h4>
            <p className="text-gray-400 text-sm mb-6 flex-1">
              Rastrea inversiones y el rendimiento de tu portafolio
            </p>
            <button className="w-full py-2.5 bg-gray-800 text-gray-500 font-medium rounded-lg cursor-not-allowed">
              Próximamente
            </button>
          </div>

          {/* Tool 3 */}
          <div className="bg-[#0d1f14] border border-gray-800 p-6 rounded-xl flex flex-col opacity-80">
            <div className="w-12 h-12 bg-[#112a18] rounded-lg flex items-center justify-center text-[#1D9E75] mb-4">
              <Wallet size={24} />
            </div>
            <h4 className="text-lg font-bold mb-2">Travi Finance</h4>
            <p className="text-gray-400 text-sm mb-6 flex-1">
              Controla gastos, metas y presupuestos personales
            </p>
            <button className="w-full py-2.5 bg-gray-800 text-gray-500 font-medium rounded-lg cursor-not-allowed">
              Próximamente
            </button>
          </div>
        </div>
        </div>
      </main>
    </div>
  );
}
