import 'dotenv/config'
import { Pool } from 'pg'
import argon2 from 'argon2'

// This script wipes auth data and seeds fresh rows.
// It reads database connection from DATABASE_URL and optional seed users
// via SEED_USERS (JSON array) or SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD
//
// Example SEED_USERS:
// [
//   { "email": "admin@example.com", "password": "changeme", "google_sub": null }
// ]

interface SeedUser {
  email: string
  password?: string
  google_sub?: string | null
}

async function main() {
  const DATABASE_URL = process.env.DATABASE_URL
  if (!DATABASE_URL) throw new Error('DATABASE_URL not set')

  const pool = new Pool({ connectionString: DATABASE_URL })
  try {
    console.log('Connecting to database...')
    await pool.query('select 1')

    console.log('Ensuring schema exists...')
    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS pgcrypto;
      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email text UNIQUE NOT NULL,
        password_hash text NOT NULL,
        google_sub text UNIQUE,
        created_at timestamptz NOT NULL DEFAULT now()
      );
      -- Ensure columns exist on pre-existing tables
      ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash text;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS google_sub text UNIQUE;
      CREATE TABLE IF NOT EXISTS sessions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at timestamptz NOT NULL DEFAULT now()
      );
    `)

    console.log('Clearing sessions and users...')
    await pool.query('DELETE FROM sessions')
    await pool.query('DELETE FROM users')

    // Load seed inputs
    let seedUsers: SeedUser[] = []
    const fromJson = process.env.SEED_USERS
    if (fromJson) {
      try {
        seedUsers = JSON.parse(fromJson) as SeedUser[]
      } catch (e) {
        console.warn('Invalid SEED_USERS JSON, ignoring.')
      }
    }

    const adminEmail = process.env.SEED_ADMIN_EMAIL
    const adminPassword = process.env.SEED_ADMIN_PASSWORD
    if (adminEmail) {
      seedUsers.push({ email: adminEmail, password: adminPassword || 'changeme' })
    }

    // Default seed if none provided
    if (seedUsers.length === 0) {
      seedUsers.push({ email: 'admin@example.com', password: 'changeme' })
    }

    console.log(`Seeding ${seedUsers.length} user(s)...`)
    for (const u of seedUsers) {
      const pwd = u.password ?? Math.random().toString(36).slice(2)
      const hash = await argon2.hash(pwd)
      await pool.query(
        'INSERT INTO users (email, password_hash, google_sub) VALUES ($1, $2, $3)',
        [u.email, hash, u.google_sub ?? null]
      )
    }

    console.log('Done.')
  } finally {
    await new Promise((res) => setTimeout(res, 50))
    await pool.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

