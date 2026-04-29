import pool from '../lib/db'
import bcrypt from 'bcryptjs'

async function createUser() {
  const passwordHash = await bcrypt.hash('20751177', 10)
  await pool.query(`
    INSERT INTO users (nombre, email, password_hash, plan)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (email) DO NOTHING
  `, ['Ronalbis', 'altuveronalbis@gmail.com', passwordHash, 'free'])
  console.log('Usuario creado exitosamente')
  process.exit(0)
}

createUser()
