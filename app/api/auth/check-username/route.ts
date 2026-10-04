import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { username } = await request.json()

    if (!username || username.length < 3) {
      return NextResponse.json({ available: false, message: 'Mínimo 3 caracteres' })
    }

    // Solo letras, números y guión bajo
    const validRegex = /^[a-zA-Z0-9_]+$/
    if (!validRegex.test(username)) {
      return NextResponse.json({ available: false, message: 'Solo letras, números y guión bajo (_)' })
    }

    const result = await pool.query(
      'SELECT id FROM users WHERE LOWER(username) = LOWER($1)',
      [username]
    )

    if (result.rows.length > 0) {
      // Generar sugerencias
      const suggestions = [
        `${username}${Math.floor(Math.random() * 99) + 1}`,
        `${username}_${Math.floor(Math.random() * 999) + 1}`,
        `${username}trading`,
        `trader_${username}`,
        `${username}_fx`,
      ]

      // Verificar cuáles sugerencias están disponibles
      const available_suggestions = []
      for (const s of suggestions) {
        const check = await pool.query(
          'SELECT id FROM users WHERE LOWER(username) = LOWER($1)',
          [s]
        )
        if (check.rows.length === 0) available_suggestions.push(s)
        if (available_suggestions.length >= 3) break
      }

      return NextResponse.json({
        available: false,
        message: 'Este nombre de usuario no está disponible',
        suggestions: available_suggestions
      })
    }

    return NextResponse.json({ available: true, message: '¡Nombre de usuario disponible!' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
