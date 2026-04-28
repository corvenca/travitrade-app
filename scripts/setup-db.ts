import { loadEnvConfig } from '@next/env';

// Cargar las variables de entorno desde .env.local
loadEnvConfig(process.cwd());

const setupDB = async () => {
  const pool = (await import('../lib/db')).default;
  try {
    console.log('Iniciando la creación de tablas en PostgreSQL...');

    await pool.query(`
      -- Usuarios del ecosistema Travitrade
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        plan VARCHAR(20) DEFAULT 'free',
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Suscripciones
      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        plan VARCHAR(20) NOT NULL,
        estado VARCHAR(20) DEFAULT 'activo',
        fecha_inicio TIMESTAMP DEFAULT NOW(),
        fecha_fin TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Cuentas de trading
      CREATE TABLE IF NOT EXISTS trading_accounts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        nombre VARCHAR(100) NOT NULL,
        tipo VARCHAR(20) NOT NULL,
        capital_inicial DECIMAL(15,2) DEFAULT 0,
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Operaciones de trading
      CREATE TABLE IF NOT EXISTS trading_operations (
        id SERIAL PRIMARY KEY,
        account_id INTEGER REFERENCES trading_accounts(id),
        user_id INTEGER REFERENCES users(id),
        instrumento VARCHAR(50),
        direccion VARCHAR(10),
        entrada DECIMAL(15,5),
        salida DECIMAL(15,5),
        contratos INTEGER,
        pnl DECIMAL(15,2),
        fecha TIMESTAMP,
        notas TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Setups de trading
      CREATE TABLE IF NOT EXISTS trading_setups (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        nombre VARCHAR(100),
        descripcion TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Capturas de trading
      CREATE TABLE IF NOT EXISTS trading_captures (
        id SERIAL PRIMARY KEY,
        operation_id INTEGER REFERENCES trading_operations(id),
        url TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Comisiones
      CREATE TABLE IF NOT EXISTS trading_commissions (
        id SERIAL PRIMARY KEY,
        account_id INTEGER REFERENCES trading_accounts(id),
        monto DECIMAL(15,2),
        fecha TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('¡Todas las tablas han sido creadas correctamente!');
  } catch (error) {
    console.error('Error al crear las tablas:', error);
  } finally {
    await pool.end();
  }
};

setupDB();
