'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { COUNTRIES } from '@/lib/countries';

const PHONE_CODES = [
  { code: '+93', flag: '🇦🇫', abbr: 'AFG' },
  { code: '+355', flag: '🇦🇱', abbr: 'ALB' },
  { code: '+213', flag: '🇩🇿', abbr: 'DZA' },
  { code: '+376', flag: '🇦🇩', abbr: 'AND' },
  { code: '+244', flag: '🇦🇴', abbr: 'AGO' },
  { code: '+54', flag: '🇦🇷', abbr: 'ARG' },
  { code: '+374', flag: '🇦🇲', abbr: 'ARM' },
  { code: '+61', flag: '🇦🇺', abbr: 'AUS' },
  { code: '+43', flag: '🇦🇹', abbr: 'AUT' },
  { code: '+994', flag: '🇦🇿', abbr: 'AZE' },
  { code: '+1', flag: '🇧🇸', abbr: 'BHS' },
  { code: '+973', flag: '🇧🇭', abbr: 'BHR' },
  { code: '+880', flag: '🇧🇩', abbr: 'BGD' },
  { code: '+375', flag: '🇧🇾', abbr: 'BLR' },
  { code: '+32', flag: '🇧🇪', abbr: 'BEL' },
  { code: '+501', flag: '🇧🇿', abbr: 'BLZ' },
  { code: '+229', flag: '🇧🇯', abbr: 'BEN' },
  { code: '+975', flag: '🇧🇹', abbr: 'BTN' },
  { code: '+591', flag: '🇧🇴', abbr: 'BOL' },
  { code: '+387', flag: '🇧🇦', abbr: 'BIH' },
  { code: '+267', flag: '🇧🇼', abbr: 'BWA' },
  { code: '+55', flag: '🇧🇷', abbr: 'BRA' },
  { code: '+673', flag: '🇧🇳', abbr: 'BRN' },
  { code: '+359', flag: '🇧🇬', abbr: 'BGR' },
  { code: '+226', flag: '🇧🇫', abbr: 'BFA' },
  { code: '+257', flag: '🇧🇮', abbr: 'BDI' },
  { code: '+855', flag: '🇰🇭', abbr: 'KHM' },
  { code: '+237', flag: '🇨🇲', abbr: 'CMR' },
  { code: '+1', flag: '🇨🇦', abbr: 'CAN' },
  { code: '+238', flag: '🇨🇻', abbr: 'CPV' },
  { code: '+236', flag: '🇨🇫', abbr: 'CAF' },
  { code: '+235', flag: '🇹🇩', abbr: 'TCD' },
  { code: '+56', flag: '🇨🇱', abbr: 'CHL' },
  { code: '+86', flag: '🇨🇳', abbr: 'CHN' },
  { code: '+57', flag: '🇨🇴', abbr: 'COL' },
  { code: '+269', flag: '🇰🇲', abbr: 'COM' },
  { code: '+242', flag: '🇨🇬', abbr: 'COG' },
  { code: '+506', flag: '🇨🇷', abbr: 'CRI' },
  { code: '+385', flag: '🇭🇷', abbr: 'HRV' },
  { code: '+53', flag: '🇨🇺', abbr: 'CUB' },
  { code: '+357', flag: '🇨🇾', abbr: 'CYP' },
  { code: '+420', flag: '🇨🇿', abbr: 'CZE' },
  { code: '+45', flag: '🇩🇰', abbr: 'DNK' },
  { code: '+253', flag: '🇩🇯', abbr: 'DJI' },
  { code: '+1', flag: '🇩🇴', abbr: 'DOM' },
  { code: '+593', flag: '🇪🇨', abbr: 'ECU' },
  { code: '+20', flag: '🇪🇬', abbr: 'EGY' },
  { code: '+503', flag: '🇸🇻', abbr: 'SLV' },
  { code: '+240', flag: '🇬🇶', abbr: 'GNQ' },
  { code: '+291', flag: '🇪🇷', abbr: 'ERI' },
  { code: '+372', flag: '🇪🇪', abbr: 'EST' },
  { code: '+251', flag: '🇪🇹', abbr: 'ETH' },
  { code: '+679', flag: '🇫🇯', abbr: 'FJI' },
  { code: '+358', flag: '🇫🇮', abbr: 'FIN' },
  { code: '+33', flag: '🇫🇷', abbr: 'FRA' },
  { code: '+241', flag: '🇬🇦', abbr: 'GAB' },
  { code: '+220', flag: '🇬🇲', abbr: 'GMB' },
  { code: '+995', flag: '🇬🇪', abbr: 'GEO' },
  { code: '+49', flag: '🇩🇪', abbr: 'DEU' },
  { code: '+233', flag: '🇬🇭', abbr: 'GHA' },
  { code: '+30', flag: '🇬🇷', abbr: 'GRC' },
  { code: '+502', flag: '🇬🇹', abbr: 'GTM' },
  { code: '+224', flag: '🇬🇳', abbr: 'GIN' },
  { code: '+245', flag: '🇬🇼', abbr: 'GNB' },
  { code: '+592', flag: '🇬🇾', abbr: 'GUY' },
  { code: '+509', flag: '🇭🇹', abbr: 'HTI' },
  { code: '+504', flag: '🇭🇳', abbr: 'HND' },
  { code: '+36', flag: '🇭🇺', abbr: 'HUN' },
  { code: '+354', flag: '🇮🇸', abbr: 'ISL' },
  { code: '+91', flag: '🇮🇳', abbr: 'IND' },
  { code: '+62', flag: '🇮🇩', abbr: 'IDN' },
  { code: '+98', flag: '🇮🇷', abbr: 'IRN' },
  { code: '+964', flag: '🇮🇶', abbr: 'IRQ' },
  { code: '+353', flag: '🇮🇪', abbr: 'IRL' },
  { code: '+972', flag: '🇮🇱', abbr: 'ISR' },
  { code: '+39', flag: '🇮🇹', abbr: 'ITA' },
  { code: '+1', flag: '🇯🇲', abbr: 'JAM' },
  { code: '+81', flag: '🇯🇵', abbr: 'JPN' },
  { code: '+962', flag: '🇯🇴', abbr: 'JOR' },
  { code: '+7', flag: '🇰🇿', abbr: 'KAZ' },
  { code: '+254', flag: '🇰🇪', abbr: 'KEN' },
  { code: '+82', flag: '🇰🇷', abbr: 'KOR' },
  { code: '+965', flag: '🇰🇼', abbr: 'KWT' },
  { code: '+996', flag: '🇰🇬', abbr: 'KGZ' },
  { code: '+856', flag: '🇱🇦', abbr: 'LAO' },
  { code: '+371', flag: '🇱🇻', abbr: 'LVA' },
  { code: '+961', flag: '🇱🇧', abbr: 'LBN' },
  { code: '+266', flag: '🇱🇸', abbr: 'LSO' },
  { code: '+231', flag: '🇱🇷', abbr: 'LBR' },
  { code: '+218', flag: '🇱🇾', abbr: 'LBY' },
  { code: '+423', flag: '🇱🇮', abbr: 'LIE' },
  { code: '+370', flag: '🇱🇹', abbr: 'LTU' },
  { code: '+352', flag: '🇱🇺', abbr: 'LUX' },
  { code: '+261', flag: '🇲🇬', abbr: 'MDG' },
  { code: '+265', flag: '🇲🇼', abbr: 'MWI' },
  { code: '+60', flag: '🇲🇾', abbr: 'MYS' },
  { code: '+960', flag: '🇲🇻', abbr: 'MDV' },
  { code: '+223', flag: '🇲🇱', abbr: 'MLI' },
  { code: '+356', flag: '🇲🇹', abbr: 'MLT' },
  { code: '+222', flag: '🇲🇷', abbr: 'MRT' },
  { code: '+230', flag: '🇲🇺', abbr: 'MUS' },
  { code: '+52', flag: '🇲🇽', abbr: 'MEX' },
  { code: '+373', flag: '🇲🇩', abbr: 'MDA' },
  { code: '+377', flag: '🇲🇨', abbr: 'MCO' },
  { code: '+976', flag: '🇲🇳', abbr: 'MNG' },
  { code: '+382', flag: '🇲🇪', abbr: 'MNE' },
  { code: '+212', flag: '🇲🇦', abbr: 'MAR' },
  { code: '+258', flag: '🇲🇿', abbr: 'MOZ' },
  { code: '+264', flag: '🇳🇦', abbr: 'NAM' },
  { code: '+977', flag: '🇳🇵', abbr: 'NPL' },
  { code: '+31', flag: '🇳🇱', abbr: 'NLD' },
  { code: '+64', flag: '🇳🇿', abbr: 'NZL' },
  { code: '+505', flag: '🇳🇮', abbr: 'NIC' },
  { code: '+227', flag: '🇳🇪', abbr: 'NER' },
  { code: '+234', flag: '🇳🇬', abbr: 'NGA' },
  { code: '+47', flag: '🇳🇴', abbr: 'NOR' },
  { code: '+968', flag: '🇴🇲', abbr: 'OMN' },
  { code: '+92', flag: '🇵🇰', abbr: 'PAK' },
  { code: '+507', flag: '🇵🇦', abbr: 'PAN' },
  { code: '+675', flag: '🇵🇬', abbr: 'PNG' },
  { code: '+595', flag: '🇵🇾', abbr: 'PRY' },
  { code: '+51', flag: '🇵🇪', abbr: 'PER' },
  { code: '+63', flag: '🇵🇭', abbr: 'PHL' },
  { code: '+48', flag: '🇵🇱', abbr: 'POL' },
  { code: '+351', flag: '🇵🇹', abbr: 'PRT' },
  { code: '+974', flag: '🇶🇦', abbr: 'QAT' },
  { code: '+40', flag: '🇷🇴', abbr: 'ROU' },
  { code: '+7', flag: '🇷🇺', abbr: 'RUS' },
  { code: '+250', flag: '🇷🇼', abbr: 'RWA' },
  { code: '+966', flag: '🇸🇦', abbr: 'SAU' },
  { code: '+221', flag: '🇸🇳', abbr: 'SEN' },
  { code: '+381', flag: '🇷🇸', abbr: 'SRB' },
  { code: '+232', flag: '🇸🇱', abbr: 'SLE' },
  { code: '+65', flag: '🇸🇬', abbr: 'SGP' },
  { code: '+421', flag: '🇸🇰', abbr: 'SVK' },
  { code: '+386', flag: '🇸🇮', abbr: 'SVN' },
  { code: '+252', flag: '🇸🇴', abbr: 'SOM' },
  { code: '+27', flag: '🇿🇦', abbr: 'ZAF' },
  { code: '+34', flag: '🇪🇸', abbr: 'ESP' },
  { code: '+94', flag: '🇱🇰', abbr: 'LKA' },
  { code: '+249', flag: '🇸🇩', abbr: 'SDN' },
  { code: '+597', flag: '🇸🇷', abbr: 'SUR' },
  { code: '+268', flag: '🇸🇿', abbr: 'SWZ' },
  { code: '+46', flag: '🇸🇪', abbr: 'SWE' },
  { code: '+41', flag: '🇨🇭', abbr: 'CHE' },
  { code: '+963', flag: '🇸🇾', abbr: 'SYR' },
  { code: '+886', flag: '🇹🇼', abbr: 'TWN' },
  { code: '+992', flag: '🇹🇯', abbr: 'TJK' },
  { code: '+255', flag: '🇹🇿', abbr: 'TZA' },
  { code: '+66', flag: '🇹🇭', abbr: 'THA' },
  { code: '+228', flag: '🇹🇬', abbr: 'TGO' },
  { code: '+1', flag: '🇹🇹', abbr: 'TTO' },
  { code: '+216', flag: '🇹🇳', abbr: 'TUN' },
  { code: '+90', flag: '🇹🇷', abbr: 'TUR' },
  { code: '+993', flag: '🇹🇲', abbr: 'TKM' },
  { code: '+256', flag: '🇺🇬', abbr: 'UGA' },
  { code: '+380', flag: '🇺🇦', abbr: 'UKR' },
  { code: '+971', flag: '🇦🇪', abbr: 'ARE' },
  { code: '+44', flag: '🇬🇧', abbr: 'GBR' },
  { code: '+1', flag: '🇺🇸', abbr: 'USA' },
  { code: '+598', flag: '🇺🇾', abbr: 'URY' },
  { code: '+998', flag: '🇺🇿', abbr: 'UZB' },
  { code: '+58', flag: '🇻🇪', abbr: 'VEN' },
  { code: '+84', flag: '🇻🇳', abbr: 'VNM' },
  { code: '+967', flag: '🇾🇪', abbr: 'YEM' },
  { code: '+260', flag: '🇿🇲', abbr: 'ZMB' },
  { code: '+263', flag: '🇿🇼', abbr: 'ZWE' },
];

const PLANS = [
  {
    id: 'free',
    name: 'Plan Free',
    price: '$0',
    period: '/mes',
    features: [
      '1 cuenta de trading',
      'Hasta 30 operaciones registradas',
      'Setups ilimitados',
      'Dashboard básico',
    ],
    locked: [
      'Calendario de rendimiento',
      'Análisis de setups',
      'Reportes avanzados',
      'Múltiples cuentas',
    ]
  },
  {
    id: 'pro',
    name: 'Plan Pro',
    price: '$5.99',
    period: '/mes',
    recommended: true,
    features: [
      'Cuentas ilimitadas',
      'Operaciones ilimitadas',
      'Análisis avanzado de setups',
      'Reportes avanzados PDF',
      'Calendario completo',
      'Curva de equity avanzada',
      'Soporte prioritario'
    ],
    locked: []
  },
  {
    id: 'business',
    name: 'Plan Business',
    price: '$49',
    period: '/mes',
    features: [
      'Todo lo del Plan Pro',
      'Travi Portafolio incluido',
      'Travi Finance incluido',
      'API access',
      'Múltiples usuarios'
    ],
    locked: []
  }
];

export default function RegistroPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    phoneCode: '',
    telefono: '',
    pais: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [selectedPlan, setSelectedPlan] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const planParam = params.get('plan');
      if (planParam && ['free', 'pro', 'business'].includes(planParam)) {
        return planParam;
      }
    }
    return 'free';
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
        plan: selectedPlan,
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
          <div className="flex justify-center">
            {selectedPlan === 'free' && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: '#0f2e1a', border: '0.5px solid #1D9E75',
                borderRadius: '20px', padding: '4px 14px',
                fontSize: '11px', color: '#1D9E75', fontWeight: '500',
                marginBottom: '16px'
              }}>
                Plan Gratuito — Sin tarjeta de crédito
              </div>
            )}
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
                <div className="mt-1" style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '100%' }}>
                  <select
                    name="phoneCode"
                    value={formData.phoneCode}
                    onChange={handleChange}
                    style={{
                      background: '#0d1f14',
                      border: '0.5px solid #1a3a24',
                      borderRadius: '6px',
                      padding: '8px 6px',
                      color: '#9FE1CB',
                      fontSize: '13px',
                      width: '100px',
                      minWidth: '100px',
                      flexShrink: 0
                    }}
                  >
                    <option value="">🌐 Código</option>
                    {PHONE_CODES.map((p, i) => (
                      <option key={i} value={p.code}>{p.flag} {p.code}</option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    name="telefono"
                    id="telefono"
                    required
                    placeholder="Número de teléfono"
                    value={formData.telefono}
                    onChange={handleChange}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      background: '#0d1f14',
                      border: '0.5px solid #1a3a24',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      color: '#9FE1CB',
                      fontSize: '13px',
                      width: '100%'
                    }}
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
                    <option value="">Selecciona tu país</option>
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

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '11px', color: 'rgba(159,225,203,0.5)', letterSpacing: '1px', marginBottom: '10px', display: 'block' }}>SELECCIONA TU PLAN</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {PLANS.map(plan => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    style={{
                      background: selectedPlan === plan.id ? '#0f2e1a' : '#0a1a0f',
                      border: `${selectedPlan === plan.id ? '1.5px' : '0.5px'} solid ${selectedPlan === plan.id ? '#1D9E75' : '#1a3a24'}`,
                      borderRadius: '10px', padding: '14px', cursor: 'pointer', position: 'relative'
                    }}
                  >
                    {plan.recommended && (
                      <div style={{ position: 'absolute', top: '-10px', left: '12px', background: '#1D9E75', color: '#fff', fontSize: '10px', fontWeight: '500', padding: '2px 10px', borderRadius: '20px' }}>RECOMENDADO</div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: `2px solid ${selectedPlan === plan.id ? '#1D9E75' : '#1a3a24'}`, background: selectedPlan === plan.id ? '#1D9E75' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {selectedPlan === plan.id && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />}
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: '500', color: '#fff' }}>{plan.name}</span>
                      </div>
                      <span style={{ fontSize: '16px', fontWeight: '500', color: '#1D9E75' }}>{plan.price}<span style={{ fontSize: '11px', color: 'rgba(159,225,203,0.4)' }}>{plan.period}</span></span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {plan.features.map(f => (
                        <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(159,225,203,0.7)' }}>
                          <span style={{ color: '#1D9E75' }}>✓</span> {f}
                        </div>
                      ))}
                      {plan.locked?.map(f => (
                        <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(159,225,203,0.3)' }}>
                          <span>—</span> {f}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

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
