import { NextResponse } from 'next/server'
import pool from '@/lib/db'

const APP_URL = 'https://app.travitrade.com'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    if (!token || !email) {
      return NextResponse.redirect(`${APP_URL}/registro?error=invalid`)
    }

    const result = await pool.query(
      `SELECT * FROM email_verifications
       WHERE email = $1 AND code = $2 AND used = false AND expires_at > NOW()`,
      [email, token]
    )

    if (result.rows.length === 0) {
      return NextResponse.redirect(`${APP_URL}/registro?error=expired`)
    }

    await pool.query('UPDATE email_verifications SET used = true WHERE email = $1', [email])

    const encodedEmail = encodeURIComponent(email)
    return NextResponse.redirect(`${APP_URL}/registro?verified=true&email=${encodedEmail}`)
  } catch (error: any) {
    return NextResponse.redirect(`${APP_URL}/registro?error=server`)
  }
}
