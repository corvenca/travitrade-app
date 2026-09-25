'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan')
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/dashboard')
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#0a1a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
        <img src="https://travitrade.com/assets/images/Logo.png" alt="Travitrade" style={{ height: '48px', marginBottom: '24px' }} />
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
        <h1 style={{ fontSize: '24px', fontWeight: '500', color: '#fff', marginBottom: '8px' }}>
          ¡Bienvenido a Travi Journals Pro!
        </h1>
        <p style={{ fontSize: '14px', color: 'rgba(159,225,203,0.6)', marginBottom: '24px', lineHeight: '1.6' }}>
          Tu suscripción {plan === 'annual' ? 'anual ($50/año)' : 'mensual ($5.99/mes)'} está activa.<br/>
          Ya tienes acceso completo a todas las funciones.
        </p>
        <div style={{ background: '#0d1f14', border: '0.5px solid #1D9E75', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
          {[
            '✓ Operaciones ilimitadas',
            '✓ Cuentas ilimitadas',
            '✓ Reportes avanzados PDF',
            '✓ Análisis de setups completo',
            '✓ Soporte prioritario',
          ].map(b => (
            <div key={b} style={{ fontSize: '13px', color: '#9FE1CB', padding: '5px 0', borderBottom: '0.5px solid #1a3a24', textAlign: 'left' }}>{b}</div>
          ))}
        </div>
        <div style={{ fontSize: '13px', color: 'rgba(159,225,203,0.4)', marginBottom: '16px' }}>
          Redirigiendo al dashboard en {countdown} segundos...
        </div>
        <button onClick={() => router.push('/dashboard')}
          style={{ padding: '12px 28px', background: '#1D9E75', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
          Ir al Dashboard →
        </button>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0a1a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Cargando...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
