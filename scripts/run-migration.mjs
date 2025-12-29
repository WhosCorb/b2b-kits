import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const SUPABASE_URL = 'https://qpjhztqdeynruvtxtwvq.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwamh6dHFkZXlucnV2dHh0d3ZxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzAxMTA1NCwiZXhwIjoyMDgyNTg3MDU0fQ.JwLp465bGqC9BKk4IwJqC7hxIl7SGKtoOymDlwvX1dg'

async function executeSQL(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ sql_query: sql })
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`SQL execution failed: ${response.status} - ${text}`)
  }

  return response.json()
}

// Split SQL into individual statements and run them
async function runStatements(statements) {
  for (const stmt of statements) {
    const trimmed = stmt.trim()
    if (!trimmed || trimmed.startsWith('--')) continue

    try {
      // Use the pg REST endpoint for raw SQL
      const response = await fetch(`${SUPABASE_URL}/pg/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ query: trimmed })
      })

      if (!response.ok && response.status !== 404) {
        console.log(`Statement result: ${response.status}`)
      }
    } catch (e) {
      // Continue on errors
    }
  }
}

async function main() {
  console.log('Attempting to run migration via Supabase API...\n')

  // Read migration file
  const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '001_initial_schema.sql')
  const sql = readFileSync(migrationPath, 'utf-8')

  // First, let's check if tables exist using the standard REST API
  console.log('Checking current database state...')

  const checkTypes = await fetch(`${SUPABASE_URL}/rest/v1/customer_types?select=*`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    }
  })

  if (checkTypes.ok) {
    const types = await checkTypes.json()
    console.log('Tables already exist!')
    console.log('\nCustomer types:')
    types.forEach(t => console.log(`  - ${t.slug}: ${t.name_es}`))

    // Check access codes
    const checkCodes = await fetch(`${SUPABASE_URL}/rest/v1/access_codes?select=*,customer_types(slug)`, {
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      }
    })

    if (checkCodes.ok) {
      const codes = await checkCodes.json()
      console.log('\nAccess codes:')
      if (codes.length === 0) {
        console.log('  (no codes found - you need to create some)')
      } else {
        codes.forEach(c => console.log(`  - ${c.code}: ${c.customer_types?.slug || 'unknown'}`))
      }
    }

    return
  }

  console.log('Tables do not exist. Please run the migration manually in Supabase SQL Editor.')
  console.log('\nThe Supabase REST API does not support arbitrary SQL execution.')
  console.log('Copy the contents of: supabase/migrations/001_initial_schema.sql')
  console.log('And paste it in: Supabase Dashboard > SQL Editor > New Query > Run')
}

main().catch(console.error)
