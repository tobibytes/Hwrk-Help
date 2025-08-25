import 'dotenv/config'
import { Pool } from 'pg'
import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

async function main() {
  const DATABASE_URL = process.env.DATABASE_URL
  if (!DATABASE_URL) throw new Error('DATABASE_URL not set for migrations')

  const pool = new Pool({ connectionString: DATABASE_URL })
  try {
    // Ensure migrations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id serial PRIMARY KEY,
        filename text UNIQUE NOT NULL,
        applied_at timestamptz NOT NULL DEFAULT now()
      );
    `)

    const dir = resolve(process.cwd(), 'migrations')
    const files = readdirSync(dir)
      .filter((f) => /\.(sql)$/i.test(f))
      .sort()

    for (const f of files) {
      const { rows } = await pool.query('SELECT 1 FROM _migrations WHERE filename = $1', [f])
      if (rows.length > 0) continue
      const sql = readFileSync(resolve(dir, f), 'utf8')
      console.log(`Applying migration: ${f}`)
      await pool.query('BEGIN')
      try {
        await pool.query(sql)
        await pool.query('INSERT INTO _migrations (filename) VALUES ($1)', [f])
        await pool.query('COMMIT')
      } catch (e) {
        await pool.query('ROLLBACK')
        throw e
      }
    }

    console.log('Migrations complete')
  } finally {
    await pool.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
