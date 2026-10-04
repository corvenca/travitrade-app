import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    if (!token || !email) {
      return NextResponse.redirect(new URL('/registro?error=invalid', request.url))
    }

    const result = await pool.query(
      `SELECT * FROM email_verifications
       WHERE email = $1 AND code = $2 AND used = false AND expires_at > NOW()`,
      [email, token]
    )

    if (result.rows.length === 0) {
      return NextResponse.redirect(new URL('/registro?error=expired', request.url))
    }

    // Marcar como verificado
    await pool.query('UPDATE email_verifications SET used = true WHERE email = $1', [email])

    // Redirigir al registro con el email verificado
    const encodedEmail = encodeURIComponent(email)
    return NextResponse.redirect(
      new URL(`/registro?verified=true&email=${encodedEmail}`, request.url)
    )
  } catch (error: any) {
    return NextResponse.redirect(new URL('/registro?error=server', request.url))
  }
}
