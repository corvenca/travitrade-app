'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function VerificadoContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push(`/registro?verified=true&email=${encodeURIComponent(email)}`)
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [email, router])

  return (
    <div style={{ minHeight: '100vh', background: '#0a1a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: '420px', width: '100%', textAlign: 'center' }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '22px', fontWeight: '700', color: '#fff' }}>travi<span style={{ color: '#1D9E75' }}>trade</span></div>
        </div>
        <div style={{ background: '#0d1f14', border: '1px solid #1D9E75', borderRadius: '16px', padding: '40px 28px' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>✅</div>
          <h2 style={{ fontSize: '20px', fontWeight: '500', color: '#fff', marginBottom: '8px' }}>
            ¡Correo verificado!
          </h2>
          <p style={{ fontSize: '14px', color: 'rgba(159,225,203,0.6)', marginBottom: '6px', lineHeight: '1.6' }}>
            Tu correo electrónico fue confirmado exitosamente:
          </p>
          <div style={{ fontSize: '14px', fontWeight: '500', color: '#1D9E75', marginBottom: '24px', padding: '10px', background: '#0a1a0f', borderRadius: '8px', border: '0.5px solid #1a3a24' }}>
            {email}
          </div>
          <p style={{ fontSize: '13px', color: 'rgba(159,225,203,0.4)', marginBottom: '20px' }}>
            Continuando al registro en {countdown}...
          </p>
          <button onClick={() => router.push(`/registro?verified=true&email=${encodeURIComponent(email)}`)}
            style={{ width: '100%', padding: '12px', background: '#1D9E75', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>
            Continuar al registro →
          </button>
        </div>
      </div>
    </div>
  )
}

export default function VerificadoPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0a1a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1D9E75' }}>
        Cargando...
      </div>
    }>
      <VerificadoContent />
    </Suspense>
  )
}
