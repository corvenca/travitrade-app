import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import pool from '@/lib/db';
import Link from 'next/link';
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

const secretKey = process.env.JWT_SECRET || 'fallback_secret';
const key = new TextEncoder().encode(secretKey);

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('travitrade_session')?.value;
  
  let userName = 'Usuario';

  if (token) {
    try {
      const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] });
      // Extraemos el nombre de la BD usando el userId del JWT
      if (payload.userId) {
        const userRes = await pool.query('SELECT nombre FROM users WHERE id = $1', [payload.userId]);
        if (userRes.rows.length > 0) {
          userName = userRes.rows[0].nombre;
        }
      }
    } catch (err) {
      console.error('Error verificando token en dashboard:', err);
    }
  }

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
          <div className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800/30 rounded-lg font-medium cursor-pointer transition-colors mb-1">
            <User size={20} />
            <span>Perfil</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800/30 rounded-lg font-medium cursor-pointer transition-colors">
            <Settings size={20} />
            <span>Ajustes</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="ml-[260px] flex-1 p-8">
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
        <div className="grid grid-cols-4 gap-6 mb-12">
          {/* Card 1 */}
          <div className="bg-[#0d1f14] border border-gray-800 p-6 rounded-xl">
            <h3 className="text-gray-400 text-sm font-medium mb-3">P&L DEL MES</h3>
            <div className="text-3xl font-bold mb-2">+$2,840</div>
            <div className="text-[#1D9E75] text-sm font-medium flex items-center gap-1">
              <TrendingUp size={16} />
              12.4% vs anterior
            </div>
          </div>
          {/* Card 2 */}
          <div className="bg-[#0d1f14] border border-gray-800 p-6 rounded-xl">
            <h3 className="text-gray-400 text-sm font-medium mb-3">WIN RATE</h3>
            <div className="text-3xl font-bold mb-2">67%</div>
            <div className="text-[#1D9E75] text-sm font-medium flex items-center gap-1">
              <TrendingUp size={16} />
              4% este mes
            </div>
          </div>
          {/* Card 3 */}
          <div className="bg-[#0d1f14] border border-gray-800 p-6 rounded-xl">
            <h3 className="text-gray-400 text-sm font-medium mb-3">OPERACIONES</h3>
            <div className="text-3xl font-bold mb-2">48</div>
            <div className="text-gray-400 text-sm font-medium">
              18 esta semana
            </div>
          </div>
          {/* Card 4 */}
          <div className="bg-[#0d1f14] border border-gray-800 p-6 rounded-xl">
            <h3 className="text-gray-400 text-sm font-medium mb-3">PORTAFOLIO</h3>
            <div className="text-3xl font-bold mb-2">$18,240</div>
            <div className="text-red-400 text-sm font-medium flex items-center gap-1">
              <TrendingDown size={16} />
              1.2% hoy
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
            <button className="w-full py-2.5 bg-[#1D9E75] hover:bg-[#157a5a] text-white font-medium rounded-lg transition-colors">
              Ingresar
            </button>
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
      </main>
    </div>
  );
}
