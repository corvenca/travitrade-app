'use client'
import { useState, useEffect } from 'react'

const LOGOS: Record<string, string> = {
  NQ:'#0057b8', ES:'#0099cc', AAPL:'#555555', MSFT:'#00a4ef',
  NVDA:'#76b900', AMZN:'#ff9900', META:'#1877f2',
  TSLA:'#cc2222', GOOGL:'#4285f4', GC:'#c9a84c', BTC:'#f7931a'
}
const INITIALS: Record<string, string> = {
  NQ:'N', ES:'E', AAPL:'🍎', MSFT:'M', NVDA:'N',
  AMZN:'A', META:'f', TSLA:'T', GOOGL:'G', GC:'G', BTC:'₿'
}

interface Asset { sym: string; price: number; chgAbs: number; chgPct: number }

function TickerItem({ sym, price, chgAbs, chgPct }: Asset) {
  const up = chgPct >= 0
  const fmtPrice = price >= 1000
    ? price.toLocaleString('en-US', { maximumFractionDigits: 0 })
    : price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div style={{
      display: 'inline-flex', flexDirection: 'column',
      padding: '6px 20px', borderRight: '1px solid rgba(255,255,255,0.07)',
      minWidth: '130px', gap: '2px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{
          width: '18px', height: '18px', borderRadius: '50%',
          background: LOGOS[sym] || '#444',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '9px', color: '#fff', fontWeight: '700', flexShrink: 0
        }}>
          {INITIALS[sym] || sym[0]}
        </div>
        <span style={{ color: '#d0d4e8', fontSize: '12px', fontWeight: '700' }}>{sym}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
        <span style={{ color: '#eef0f8', fontSize: '14px', fontWeight: '700' }}>{fmtPrice}</span>
        <sup style={{ color: '#7a7d99', fontSize: '9px' }}>D</sup>
      </div>
      <span style={{ fontSize: '11px', color: up ? '#2ecc8a' : '#f05c5c' }}>
        {up ? '+' : ''}{chgAbs.toFixed(2)} ({up ? '+' : ''}{chgPct.toFixed(2)}%)
      </span>
    </div>
  )
}

export default function MarketTicker() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [paused, setPaused] = useState(false)
  const [lastKnown, setLastKnown] = useState<Asset[]>([])

  const fetchQuotes = async () => {
    try {
      const res = await fetch('/api/market/quotes')
      const data = await res.json()
      if (data.quotes?.length > 0) {
        setAssets(data.quotes)
        setLastKnown(data.quotes)
      } else if (lastKnown.length > 0) {
        setAssets(lastKnown)
      }
    } catch {
      if (lastKnown.length > 0) setAssets(lastKnown)
    }
  }

  useEffect(() => {
    fetchQuotes()
    const interval = setInterval(fetchQuotes, 15000)
    return () => clearInterval(interval)
  }, [])

  if (assets.length === 0) return (
    <div style={{ background: '#1a1a2e', borderBottom: '0.5px solid #1a3a24', padding: '8px 16px', fontSize: '11px', color: '#7a7d99' }}>
      Cargando cotizaciones...
    </div>
  )

  const items = [...assets, ...assets]

  return (
    <div
      style={{ background: '#1a1a2e', overflow: 'hidden', position: 'relative', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '48px', background: 'linear-gradient(to right, #1a1a2e, transparent)', zIndex: 3, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '48px', background: 'linear-gradient(to left, #1a1a2e, transparent)', zIndex: 3, pointerEvents: 'none' }} />
      <div style={{
        display: 'flex', width: 'max-content',
        animation: 'ticker 35s linear infinite',
        animationPlayState: paused ? 'paused' : 'running'
      }}>
        {items.map((a, i) => <TickerItem key={`${a.sym}-${i}`} {...a} />)}
      </div>
      <style>{`@keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
    </div>
  )
}
