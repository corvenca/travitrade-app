'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [dialCode, setDialCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verified = params.get('verified');
    const emailParam = params.get('email');
    const errorParam = params.get('error');
    const plan = params.get('plan');

    if (plan === 'pro_annual') {
      setSelectedPlan('pro');
      setBillingCycle('annual');
    } else if (plan) {
      setSelectedPlan(plan);
    }

    if (verified === 'true' && emailParam) {
      const decoded = decodeURIComponent(emailParam).trim().toLowerCase();
      setEmailToVerify(decoded);
      setFormData(prev => ({ ...prev, email: decoded }));
      setStep('form');
    }

    if (errorParam === 'expired') {
      setCodeError('El enlace ha expirado. Solicita uno nuevo.');
      setStep('email');
    } else if (errorParam === 'invalid') {
      setCodeError('Enlace inválido. Intenta de nuevo.');
      setStep('email');
    } else if (errorParam === 'server') {
      setCodeError('Error al verificar el enlace. Intenta de nuevo.');
      setStep('email');
    }
  }, []);

  const isPro = selectedPlan === 'pro' || selectedPlan === 'pro_annual';
  const isAnnual = selectedPlan === 'pro_annual' || billingCycle === 'annual';
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Verificación de email
  const [step, setStep] = useState<'email' | 'code' | 'form'>('email');
  const [emailToVerify, setEmailToVerify] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Verificación de username
  const [usernameStatus, setUsernameStatus] = useState<{
    available: boolean | null
    message: string
    suggestions: string[]
  }>({ available: null, message: '', suggestions: [] });
  const [checkingUsername, setCheckingUsername] = useState(false);
  const checkUsernameTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleUsernameChange = (value: string) => {
    setFormData(prev => ({ ...prev, username: value }));
    setUsernameStatus({ available: null, message: '', suggestions: [] });

    if (checkUsernameTimeout.current) clearTimeout(checkUsernameTimeout.current);

    if (value.length < 3) {
      setUsernameStatus({ available: null, message: 'Mínimo 3 caracteres', suggestions: [] });
      return;
    }

    checkUsernameTimeout.current = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const res = await fetch('/api/auth/check-username', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: value })
        });
        const data = await res.json();
        setUsernameStatus({
          available: data.available,
          message: data.message || '',
          suggestions: data.suggestions || []
        });
      } catch {}
      setCheckingUsername(false);
    }, 500);
  };

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  // Polling cada 3 segundos para verificar si el email fue confirmado
  useEffect(() => {
    if (step !== 'code' || !emailToVerify) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/auth/check-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailToVerify })
        });
        const data = await res.json();
        if (data.verified) {
          clearInterval(interval);
          setFormData(prev => ({ ...prev, email: emailToVerify }));
          setStep('form');
        }
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [step, emailToVerify]);

  // Paso 1 — Enviar enlace al email
  const handleSendCode = async () => {
    if (!emailToVerify) { setCodeError('Ingresa tu email'); return; }
    setSendingCode(true);
    setCodeError('');
    try {
      const res = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToVerify })
      });
      const data = await res.json();
      if (res.ok) {
        setStep('code');
        setResendTimer(60);
      } else {
        setCodeError(data.error || 'Error al enviar enlace');
      }
    } catch { setCodeError('Error de conexión'); }
    setSendingCode(false);
  };

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
        billingCycle,
      };

      const res = await fetch('/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        if (isPro) {
          const planType = isAnnual ? 'annual' : 'monthly';
          // Login automático
          const loginRes = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: formData.email, password: formData.password }),
          });

          if (loginRes.ok) {
            const priceId = planType === 'annual'
              ? process.env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL
              : process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY;

            const checkoutRes = await fetch('/api/stripe/create-checkout', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ priceId, plan: planType }),
            });
            const checkoutData = await checkoutRes.json();
            if (checkoutData.url) {
              window.location.href = checkoutData.url;
              return;
            }
          }
          // Si falla el checkout, ir a upgrade
          router.push(`/upgrade?plan=${planType}`);
        } else {
          router.push('/login');
        }
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
          {isPro && (
            <div style={{ background: 'rgba(29,158,117,0.1)', border: '0.5px solid #1D9E75', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#1D9E75', textAlign: 'center' }}>
              ⭐ Después del registro serás redirigido al pago del plan {isAnnual ? 'Pro Anual ($50/año)' : 'Pro ($5.99/mes)'}
            </div>
          )}
          {step === 'email' && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '500', color: '#fff', marginBottom: '6px' }}>Crear cuenta</h2>
              <p style={{ fontSize: '13px', color: 'rgba(159,225,203,0.5)', marginBottom: '20px' }}>Ingresa tu correo para comenzar</p>
              <div style={{ marginBottom: '14px' }}>
                <label htmlFor="emailToVerify" style={{ fontSize: '11px', color: 'rgba(159,225,203,0.5)', letterSpacing: '1px', marginBottom: '6px', display: 'block' }}>CORREO ELECTRÓNICO</label>
                <input
                  id="emailToVerify"
                  type="email"
                  autoComplete="email"
                  value={emailToVerify}
                  onChange={e => setEmailToVerify(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendCode()}
                  placeholder="tu@correo.com"
                  style={{ width: '100%', background: '#0a1a0f', border: '0.5px solid #1a3a24', borderRadius: '8px', padding: '10px 12px', color: '#9FE1CB', fontSize: '13px', outline: 'none' }}
                />
              </div>
              {codeError && <div style={{ color: '#E24B4A', fontSize: '12px', marginBottom: '12px' }}>{codeError}</div>}
              <button id="sendCodeBtn" type="button" onClick={handleSendCode} disabled={sendingCode}
                style={{ width: '100%', padding: '11px', background: '#1D9E75', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: '500', cursor: 'pointer', opacity: sendingCode ? 0.7 : 1 }}>
                {sendingCode ? 'Procesando...' : 'Continuar →'}
              </button>
            </div>
          )}

          {step === 'code' && (
            <div style={{ background: '#0d1f14', border: '0.5px solid #1a3a24', borderRadius: '12px', padding: '32px', textAlign: 'center' }}>
              <div style={{ fontSize: '52px', marginBottom: '16px' }}>📧</div>
              <h2 style={{ fontSize: '18px', fontWeight: '500', color: '#fff', marginBottom: '8px' }}>Revisa tu correo</h2>
              <p style={{ fontSize: '14px', color: 'rgba(159,225,203,0.6)', marginBottom: '6px', lineHeight: '1.6' }}>
                Te enviamos un mensaje de confirmación a:
              </p>
              <div style={{ fontSize: '15px', fontWeight: '500', color: '#1D9E75', marginBottom: '20px' }}>
                {emailToVerify}
              </div>
              <div style={{ background: '#0a1a0f', borderRadius: '8px', padding: '14px', marginBottom: '20px', border: '0.5px solid #1a3a24', fontSize: '13px', color: 'rgba(159,225,203,0.5)', lineHeight: '1.6' }}>
                Revisa tu bandeja de entrada y confirma tu correo para continuar con el registro.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button onClick={handleSendCode} disabled={resendTimer > 0}
                  style={{ padding: '10px', background: 'transparent', border: '0.5px solid #1a3a24', borderRadius: '8px', color: resendTimer > 0 ? 'rgba(159,225,203,0.3)' : '#9FE1CB', fontSize: '13px', cursor: resendTimer > 0 ? 'not-allowed' : 'pointer' }}>
                  {resendTimer > 0 ? `Reenviar en ${resendTimer}s` : 'Reenviar confirmación'}
                </button>
                <button onClick={() => { setStep('email'); setCodeError('') }}
                  style={{ padding: '8px', background: 'transparent', border: 'none', color: 'rgba(159,225,203,0.4)', fontSize: '12px', cursor: 'pointer' }}>
                  ← Cambiar email
                </button>
              </div>
            </div>
          )}

          {step === 'form' && (
          <>
          {/* Email verificado — no editable */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '11px', color: 'rgba(159,225,203,0.5)', letterSpacing: '1px', marginBottom: '6px', display: 'block' }}>CORREO ELECTRÓNICO</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0a1a0f', border: '0.5px solid #1D9E75', borderRadius: '8px', padding: '10px 12px' }}>
              <span style={{ fontSize: '13px', color: '#1D9E75', flex: 1 }}>{emailToVerify || formData.email}</span>
              <span style={{ fontSize: '11px', color: '#1D9E75', background: 'rgba(29,158,117,0.15)', padding: '2px 8px', borderRadius: '20px' }}>✓ Verificado</span>
            </div>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', color: 'rgba(159,225,203,0.5)', letterSpacing: '1px', marginBottom: '6px', display: 'block' }}>PAÍS *</label>
              <select
                value={formData.pais}
                onChange={e => {
                  const country = COUNTRIES.find(c => c.name === e.target.value)
                  setFormData(prev => ({ ...prev, pais: e.target.value }))
                  if (country) {
                    setDialCode(country.dial)
                    // Actualizar teléfono con el nuevo código
                    setFormData(prev => ({ ...prev, telefono: country.dial + phoneNumber }))
                  }
                }}
                style={{ width: '100%', background: '#0a1a0f', border: '0.5px solid #1a3a24', borderRadius: '8px', padding: '10px 12px', color: '#9FE1CB', fontSize: '13px', outline: 'none' }}>
                <option value="">Selecciona tu país</option>
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.name}>{c.flag} {c.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', color: 'rgba(159,225,203,0.5)', letterSpacing: '1px', marginBottom: '6px', display: 'block' }}>TELÉFONO / WHATSAPP</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  value={dialCode}
                  readOnly
                  placeholder="+00"
                  style={{ width: '70px', background: '#0a1a0f', border: '0.5px solid #1a3a24', borderRadius: '8px', padding: '10px 8px', color: '#1D9E75', fontSize: '13px', textAlign: 'center', flexShrink: 0 }}
                />
                <input
                  value={phoneNumber}
                  onChange={e => {
                    const num = e.target.value.replace(/\D/g, '')
                    setPhoneNumber(num)
                    setFormData(prev => ({ ...prev, telefono: dialCode + num }))
                  }}
                  placeholder="Número sin código de país"
                  type="tel"
                  style={{ flex: 1, background: '#0a1a0f', border: '0.5px solid #1a3a24', borderRadius: '8px', padding: '10px 12px', color: '#9FE1CB', fontSize: '13px', outline: 'none' }}
                />
              </div>
              {dialCode && phoneNumber && (
                <div style={{ fontSize: '11px', color: 'rgba(159,225,203,0.4)', marginTop: '4px' }}>
                  Número completo: {dialCode}{phoneNumber}
                </div>
              )}
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

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', color: 'rgba(159,225,203,0.5)', letterSpacing: '1px', marginBottom: '6px', display: 'block' }}>NOMBRE DE USUARIO *</label>
              <div style={{ position: 'relative' }}>
                <input
                  value={formData.username}
                  onChange={e => handleUsernameChange(e.target.value.toLowerCase().replace(/\s/g, '_'))}
                  placeholder="ej: trader_juan"
                  style={{
                    width: '100%',
                    background: '#0a1a0f',
                    border: `0.5px solid ${usernameStatus.available === true ? '#1D9E75' : usernameStatus.available === false ? '#E24B4A' : '#1a3a24'}`,
                    borderRadius: '8px',
                    padding: '10px 40px 10px 12px',
                    color: '#9FE1CB',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
                <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px' }}>
                  {checkingUsername ? '⏳' : usernameStatus.available === true ? '✅' : usernameStatus.available === false ? '❌' : ''}
                </div>
              </div>

              {/* Mensaje de estado */}
              {usernameStatus.message && (
                <div style={{ fontSize: '12px', marginTop: '5px', color: usernameStatus.available ? '#1D9E75' : usernameStatus.available === false ? '#E24B4A' : 'rgba(159,225,203,0.4)' }}>
                  {usernameStatus.available === true ? '✓ ' : usernameStatus.available === false ? '✗ ' : ''}{usernameStatus.message}
                </div>
              )}

              {/* Sugerencias */}
              {usernameStatus.suggestions.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ fontSize: '11px', color: 'rgba(159,225,203,0.4)', marginBottom: '5px' }}>Sugerencias disponibles:</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {usernameStatus.suggestions.map(s => (
                      <button key={s} type="button"
                        onClick={() => {
                          handleUsernameChange(s)
                        }}
                        style={{ padding: '4px 12px', background: '#0f2e1a', border: '0.5px solid #1D9E75', borderRadius: '20px', color: '#1D9E75', fontSize: '12px', cursor: 'pointer' }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
              
              {/* Toggle de facturación */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <button type="button" onClick={() => setBillingCycle('monthly')}
                  style={{ flex: 1, padding: '8px', borderRadius: '8px', border: `0.5px solid ${billingCycle === 'monthly' ? '#1D9E75' : '#1a3a24'}`, background: billingCycle === 'monthly' ? '#0f2e1a' : 'transparent', color: billingCycle === 'monthly' ? '#1D9E75' : 'rgba(159,225,203,0.5)', fontSize: '12px', cursor: 'pointer' }}>
                  Mensual — $5.99/mes
                </button>
                <button type="button" onClick={() => setBillingCycle('annual')}
                  style={{ flex: 1, padding: '8px', borderRadius: '8px', border: `0.5px solid ${billingCycle === 'annual' ? '#1D9E75' : '#1a3a24'}`, background: billingCycle === 'annual' ? '#0f2e1a' : 'transparent', color: billingCycle === 'annual' ? '#1D9E75' : 'rgba(159,225,203,0.5)', fontSize: '12px', cursor: 'pointer', position: 'relative' }}>
                  Anual — $4.16/mes
                  <span style={{ position: 'absolute', top: '-8px', right: '8px', background: '#1D9E75', color: '#fff', fontSize: '9px', padding: '1px 6px', borderRadius: '20px' }}>AHORRA $21.88</span>
                </button>
              </div>

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
              <button type="submit" disabled={loading}
                style={{ width: '100%', padding: '12px', background: '#1D9E75', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Creando cuenta...' :
                  isPro && isAnnual ? 'Crear cuenta y suscribirse anual →' :
                  isPro ? 'Crear cuenta y suscribirse a Pro →' :
                  'Crear cuenta gratis →'
                }
              </button>
            </div>
          </form>
          </>
          )}

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
