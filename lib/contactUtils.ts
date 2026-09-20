import pool from '@/lib/db'

// Generar código único legible
export function generateContactCode(): string {
  const prefix = 'TRV'
  const year = new Date().getFullYear().toString().slice(-2)
  const random = Math.random().toString(36).toUpperCase().slice(2, 7)
  return `${prefix}-${year}-${random}`
}

// Validar formato de email
export function isValidEmailFormat(email: string): boolean {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return regex.test(email)
}

// Verificar si el dominio del email existe (DNS check básico)
export async function verifyEmailDomain(email: string): Promise<boolean> {
  try {
    const domain = email.split('@')[1]
    // Lista de dominios conocidos válidos
    const knownDomains = [
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
      'icloud.com', 'live.com', 'msn.com', 'protonmail.com',
      'aol.com', 'mail.com', 'zoho.com', 'yandex.com',
      'me.com', 'mac.com', 'googlemail.com'
    ]
    if (knownDomains.includes(domain)) return true

    // Para dominios corporativos, verificar que tienen estructura válida
    if (domain && domain.includes('.') && domain.length > 4) return true

    return false
  } catch {
    return false
  }
}

// Detectar comportamiento de bot
export function detectBot(data: {
  nombre: string
  email: string
  whatsapp?: string
  timeToFill: number // segundos que tardó en llenar el formulario
  honeypot?: string // campo trampa
}): { isBot: boolean; score: number; reasons: string[] } {
  let score = 0
  const reasons: string[] = []

  // Honeypot — si llenó un campo oculto es bot
  if (data.honeypot) {
    score += 100
    reasons.push('honeypot_filled')
  }

  // Muy rápido — menos de 3 segundos para llenar
  if (data.timeToFill < 3) {
    score += 40
    reasons.push('too_fast')
  }

  // Nombre sospechoso
  const suspiciousPatterns = /^(test|bot|spam|admin|user|demo|asdf|qwerty|123)/i
  if (suspiciousPatterns.test(data.nombre)) {
    score += 30
    reasons.push('suspicious_name')
  }

  // Email con patrones de spam
  const spamEmailPatterns = /(\+.*@|^(test|spam|bot|fake|temp)\d*@)/i
  if (spamEmailPatterns.test(data.email)) {
    score += 30
    reasons.push('suspicious_email')
  }

  // WhatsApp con números repetidos
  if (data.whatsapp && /(\d)\1{5,}/.test(data.whatsapp)) {
    score += 20
    reasons.push('suspicious_phone')
  }

  return {
    isBot: score >= 50,
    score,
    reasons
  }
}

// Guardar o actualizar contacto
export async function upsertContact(data: {
  nombre: string
  apellido?: string
  email: string
  whatsapp?: string
  pais?: string
  source: string
  isBot: boolean
  botScore: number
  emailVerified: boolean
}) {
  // Verificar si ya existe
  const existing = await pool.query('SELECT id, code FROM contacts WHERE email = $1', [data.email])

  if (existing.rows.length > 0) {
    // Actualizar último contacto
    await pool.query(
      `UPDATE contacts SET
        last_contact = NOW(), updated_at = NOW(),
        nombre = $1, whatsapp = $2, pais = $3
       WHERE email = $4`,
      [data.nombre, data.whatsapp || null, data.pais || null, data.email]
    )
    return { code: existing.rows[0].code, isNew: false }
  }

  // Crear nuevo contacto
  const code = generateContactCode()
  await pool.query(
    `INSERT INTO contacts (code, nombre, apellido, email, whatsapp, pais, source, is_bot, bot_score, email_verified, last_contact)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())`,
    [code, data.nombre, data.apellido || null, data.email, data.whatsapp || null, data.pais || null, data.source, data.isBot, data.botScore, data.emailVerified]
  )
  return { code, isNew: true }
}
