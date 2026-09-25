'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function UpgradePage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState('monthly')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(setUser).catch(() => {})
  }, [])

  const handleCheckout = async (planType: string) => {
    try {
      const priceId = planType === 'annual'
        ? process.env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL
        : process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY

      console.log('Enviando priceId:', priceId, 'plan:', planType)

      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, plan: planType })
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Error al iniciar el pago. Intenta de nuevo.')
      }
    } catch {
      alert('Error de conexión.')
    }
  }

  const isPro = user?.plan === 'pro' || user?.plan === 'pro_annual' || user?.plan === 'free_full'

  return (
    <div style={{ minHeight: '100vh', background: '#0a1a0f' }}>

      {/* HEADER */}
      <div style={{ background: '#0d1f14', borderBottom: '0.5px solid #1a3a24', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={() => router.push('/dashboard')}
          style={{ background: 'transparent', border: '0.5px solid #1a3a24', borderRadius: '8px', padding: '6px 12px', color: 'rgba(159,225,203,0.6)', fontSize: '13px', cursor: 'pointer' }}>
          ← Volver
        </button>
        <div style={{ fontSize: '15px', fontWeight: '500', color: '#fff' }}>
          travi<span style={{ color: '#1D9E75' }}>trade</span>
        </div>
      </div>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '40px 24px' }}>

        {/* TÍTULO */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '28px', marginBottom: '12px' }}>🚀</div>
          <h1 style={{ fontSize: '22px', fontWeight: '500', color: '#fff', marginBottom: '8px' }}>
            Actualiza a <span style={{ color: '#1D9E75' }}>Travi Journals Pro</span>
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(159,225,203,0.5)', lineHeight: '1.6' }}>
            {isPro
              ? 'Ya tienes acceso Pro. Tus datos y operaciones están completamente disponibles.'
              : 'Tus datos están seguros. Al actualizar recuperas acceso inmediato a todo sin perder nada.'
            }
          </p>
        </div>

        {/* PLAN ACTUAL */}
        {user && (
          <div style={{ background: '#0d1f14', border: '0.5px solid #1a3a24', borderRadius: '10px', padding: '12px 16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '13px', color: 'rgba(159,225,203,0.5)' }}>Tu plan actual</div>
            <span style={{ fontSize: '12px', padding: '3px 12px', borderRadius: '20px', background: isPro ? '#0f2e1a' : '#1a1d24', color: isPro ? '#1D9E75' : 'rgba(159,225,203,0.4)', border: `0.5px solid ${isPro ? '#1D9E75' : '#2a2d34'}`, fontWeight: '500' }}>
              {isPro ? '⭐ PRO' : 'FREE'}
            </span>
          </div>
        )}

        {!isPro && (
          <>
            {/* SELECTOR DE PLAN */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              <div onClick={() => setSelectedPlan('monthly')}
                style={{ background: selectedPlan === 'monthly' ? '#0f2e1a' : '#0d1f14', border: `1.5px solid ${selectedPlan === 'monthly' ? '#1D9E75' : '#1a3a24'}`, borderRadius: '12px', padding: '20px 16px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
                <div style={{ fontSize: '12px', color: 'rgba(159,225,203,0.5)', marginBottom: '8px' }}>MENSUAL</div>
                <div style={{ fontSize: '30px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>$5.99</div>
                <div style={{ fontSize: '12px', color: 'rgba(159,225,203,0.5)' }}>por mes</div>
                <div style={{ fontSize: '11px', color: 'rgba(159,225,203,0.3)', marginTop: '6px' }}>Cancela cuando quieras</div>
              </div>
              <div onClick={() => setSelectedPlan('annual')}
                style={{ background: selectedPlan === 'annual' ? '#0f2e1a' : '#0d1f14', border: `1.5px solid ${selectedPlan === 'annual' ? '#1D9E75' : '#1a3a24'}`, borderRadius: '12px', padding: '20px 16px', cursor: 'pointer', textAlign: 'center', position: 'relative', transition: 'all 0.15s' }}>
                <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: '#1D9E75', color: '#fff', fontSize: '10px', padding: '2px 10px', borderRadius: '20px', fontWeight: '500', whiteSpace: 'nowrap' }}>AHORRA $21.88</div>
                <div style={{ fontSize: '12px', color: 'rgba(159,225,203,0.5)', marginBottom: '8px' }}>ANUAL</div>
                <div style={{ fontSize: '30px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>$4.16</div>
                <div style={{ fontSize: '12px', color: 'rgba(159,225,203,0.5)' }}>por mes</div>
                <div style={{ fontSize: '11px', color: '#1D9E75', marginTop: '6px', fontWeight: '500' }}>$50 pago único anual</div>
              </div>
            </div>

            {/* BENEFICIOS */}
            <div style={{ background: '#0d1f14', border: '0.5px solid #1a3a24', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
              <div style={{ fontSize: '11px', color: 'rgba(159,225,203,0.4)', letterSpacing: '1.5px', marginBottom: '14px' }}>TODO LO QUE INCLUYE PRO</div>
              {[
                ['🔓', 'Operaciones ilimitadas'],
                ['📊', 'Cuentas de trading ilimitadas'],
                ['📅', 'Calendario de rendimiento'],
                ['📄', 'Reportes avanzados PDF'],
                ['🎯', 'Análisis de setups completo'],
                ['📥', 'Exportación a Excel'],
                ['💬', 'Soporte prioritario'],
                ['🔒', 'Todos tus datos actuales se mantienen'],
              ].map(([icon, text]) => (
                <div key={text as string} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 0', borderBottom: '0.5px solid #1a3a24' }}>
                  <span style={{ fontSize: '14px' }}>{icon}</span>
                  <span style={{ fontSize: '13px', color: '#9FE1CB' }}>{text as string}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div style={{ background: 'rgba(29,158,117,0.08)', border: '0.5px solid #1D9E75', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#1D9E75', marginBottom: '12px', textAlign: 'center' }}>
                💳 Pago seguro en línea con Stripe
              </div>
              <button onClick={() => handleCheckout('monthly')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px', background: '#1D9E75', borderRadius: '10px', color: '#fff', fontSize: '14px', fontWeight: '500', cursor: 'pointer', border: 'none', width: '100%', marginBottom: '10px' }}>
                💳 Suscribirse — $5.99/mes
              </button>
              <button onClick={() => handleCheckout('annual')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '13px', background: 'transparent', border: '1px solid #1D9E75', borderRadius: '10px', color: '#1D9E75', fontSize: '14px', cursor: 'pointer', width: '100%' }}>
                💰 Suscribirse — $50/año (ahorra $21.88)
              </button>
            </div>

            <div style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(159,225,203,0.3)', lineHeight: '1.6' }}>
              Activación a la brevedad posible · Tus datos nunca se pierden<br/>
              Cancela cuando quieras enviando un email a atencionalcliente@travitrade.com
            </div>
          </>
        )}

        {/* SI YA ES PRO */}
        {isPro && (
          <div style={{ textAlign: 'center', padding: '32px', background: '#0d1f14', borderRadius: '12px', border: '0.5px solid #1D9E75' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>⭐</div>
            <div style={{ fontSize: '16px', fontWeight: '500', color: '#1D9E75', marginBottom: '8px' }}>Ya tienes Plan Pro</div>
            <div style={{ fontSize: '13px', color: 'rgba(159,225,203,0.5)', marginBottom: '20px', lineHeight: '1.6' }}>
              Tienes acceso completo a todas las funciones de Travi Journals.
            </div>
            <button onClick={() => router.push('/dashboard')}
              style={{ padding: '10px 24px', background: '#1D9E75', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
              Ir al Dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
