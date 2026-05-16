import { NextResponse } from 'next/server'

const BASE = 'https://api.massive.com'
const STOCK_SYMBOLS = 'AAPL,MSFT,NVDA,AMZN,META,TSLA,GOOGL'
const FUTURES_SYMBOLS = 'NQU25,ESU25,GCM25'

export async function GET() {
  const KEY = process.env.MASSIVE_API_KEY
  try {
    const [stocksRes, futuresRes, btcRes] = await Promise.all([
      fetch(`${BASE}/v2/snapshot/locale/us/markets/stocks/tickers?tickers=${STOCK_SYMBOLS}&apiKey=${KEY}`),
      fetch(`${BASE}/v2/snapshot/locale/us/markets/futures/tickers?tickers=${FUTURES_SYMBOLS}&apiKey=${KEY}`),
      fetch(`${BASE}/v2/snapshot/locale/global/markets/crypto/tickers/X:BTCUSD?apiKey=${KEY}`)
    ])

    const [stocks, futures, btc] = await Promise.all([
      stocksRes.json(),
      futuresRes.json(),
      btcRes.json()
    ])

    const normalize = (t: any, displaySym?: string) => ({
      sym: displaySym || t.ticker,
      price: t.day?.c ?? t.min?.c ?? t.prevDay?.c ?? 0,
      chgAbs: t.todaysChange ?? 0,
      chgPct: t.todaysChangePerc ?? 0,
    })

    const nq = futures.tickers?.find((t: any) => t.ticker?.startsWith('NQ'))
    const es = futures.tickers?.find((t: any) => t.ticker?.startsWith('ES'))
    const gc = futures.tickers?.find((t: any) => t.ticker?.startsWith('GC'))

    const quotes = [
      nq ? normalize(nq, 'NQ') : null,
      es ? normalize(es, 'ES') : null,
      ...(stocks.tickers || []).map((t: any) => normalize(t)),
      gc ? normalize(gc, 'GC') : null,
      btc.ticker ? normalize(btc.ticker, 'BTC') : null,
    ].filter(Boolean)

    return NextResponse.json({ quotes })
  } catch (error) {
    return NextResponse.json({ quotes: [] }, { status: 500 })
  }
}
