'use client'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function UpgradeContent() {
  const searchParams = useSearchParams()
  const defaultPlan = searchParams.get('plan') || 'monthly'
  const [selectedPlan, setSelectedPlan] = useState(defaultPlan)

  return (
    <div style={{ minHeight: '100vh', background: '#0a1a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: '520px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '22px', fontWeight: '500', color: '#fff', marginBottom: '6px' }}>
            Actualiza a <span style={{ color: '#1D9E75' }}>Travi Journals Pro</span>
          </div>
          <div style={{ fontSize: '14px', color: 'rgba(159,225,203,0.5)' }}>
            Tus datos están seguros — recuperas acceso inmediato a todo tu historial
          </div>
        </div>

        {/* Selector de plan */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          <div onClick={() => setSelectedPlan('monthly')}
            style={{ background: selectedPlan === 'monthly' ? '#0f2e1a' : '#0d1f14', border: `1px solid ${selectedPlan === 'monthly' ? '#1D9E75' : '#1a3a24'}`, borderRadius: '12px', padding: '20px', cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ fontSize: '13px', color: 'rgba(159,225,203,0.6)', marginBottom: '6px' }}>Mensual</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#fff' }}>$5.99</div>
            <div style={{ fontSize: '12px', color: 'rgba(159,225,203,0.5)' }}>por mes</div>
          </div>
          <div onClick={() => setSelectedPlan('annual')}
            style={{ background: selectedPlan === 'annual' ? '#0f2e1a' : '#0d1f14', border: `1px solid ${selectedPlan === 'annual' ? '#1D9E75' : '#1a3a24'}`, borderRadius: '12px', padding: '20px', cursor: 'pointer', textAlign: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-10px', right: '12px', background: '#1D9E75', color: '#fff', fontSize: '10px', padding: '2px 8px', borderRadius: '20px', fontWeight: '500' }}>AHORRA $21.88</div>
            <div style={{ fontSize: '13px', color: 'rgba(159,225,203,0.6)', marginBottom: '6px' }}>Anual</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#fff' }}>$4.16</div>
            <div style={{ fontSize: '12px', color: 'rgba(159,225,203,0.5)' }}>por mes · $50/año</div>
          </div>
        </div>

        {/* Beneficios */}
        <div style={{ background: '#0d1f14', border: '0.5px solid #1a3a24', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
          <div style={{ fontSize: '12px', color: 'rgba(159,225,203,0.4)', letterSpacing: '1px', marginBottom: '14px' }}>INCLUYE CON PRO</div>
          {[
            '✓ Operaciones ilimitadas',
            '✓ Cuentas de trading ilimitadas',
            '✓ Calendario de rendimiento',
            '✓ Reportes avanzados PDF',
            '✓ Análisis de setups completo',
            '✓ Exportación a Excel',
            '✓ Soporte prioritario',
            '✓ Todos tus datos actuales se mantienen',
            '✓ Cancela cuando quieras',
          ].map(b => (
            <div key={b} style={{ fontSize: '13px', color: '#9FE1CB', padding: '5px 0', borderBottom: '0.5px solid #1a3a24' }}>{b}</div>
          ))}
        </div>

        {/* CTA — Próximamente Stripe */}
        <div style={{ background: 'rgba(29,158,117,0.1)', border: '0.5px solid #1D9E75', borderRadius: '12px', padding: '20px', textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', color: '#1D9E75', fontWeight: '500', marginBottom: '8px' }}>
            Pagos en línea próximamente 🚀
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(159,225,203,0.6)', marginBottom: '14px', lineHeight: '1.6' }}>
            Mientras tanto, contáctanos para activar tu plan Pro manualmente.
          </div>
          <a href="https://wa.me/584120000000?text=Hola%2C%20quiero%20activar%20el%20plan%20Pro%20de%20Travi%20Journals"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'block', padding: '12px', background: '#1D9E75', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: '500', textDecoration: 'none', marginBottom: '10px' }}>
            📱 Contactar por WhatsApp
          </a>
          <a href="mailto:soporte@travitrade.com?subject=Activar Plan Pro Travi Journals"
            style={{ display: 'block', padding: '12px', background: 'transparent', border: '0.5px solid #1a3a24', borderRadius: '8px', color: '#9FE1CB', fontSize: '13px', textDecoration: 'none' }}>
            ✉ Enviar email a soporte@travitrade.com
          </a>
        </div>

        <div style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(159,225,203,0.3)' }}>
          Tus datos nunca se pierden · Activación inmediata al confirmar el pago
        </div>
      </div>
    </div>
  )
}

export default function UpgradePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0a1a0f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cargando...</div>}>
      <UpgradeContent />
    </Suspense>
  )
}
