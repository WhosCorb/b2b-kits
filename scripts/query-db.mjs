import { createClient } from '@supabase/supabase-js'

// You'll need to get the anon key from Supabase dashboard
const SUPABASE_URL = 'https://qpjhztqdeynruvtxtwvq.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SUPABASE_SERVICE_KEY) {
  console.log('Please provide SUPABASE_SERVICE_ROLE_KEY environment variable')
  console.log('Get it from: Supabase Dashboard > Settings > API > service_role key')
  console.log('')
  console.log('Run with: SUPABASE_SERVICE_ROLE_KEY=your-key node scripts/query-db.mjs')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function main() {
  try {
    console.log('Querying Supabase...\n')

    // Check customer_types
    const { data: types, error: typesError } = await supabase
      .from('customer_types')
      .select('*')
      .order('created_at')

    if (typesError) {
      console.log('Customer types table:', typesError.message)
      if (typesError.code === '42P01') {
        console.log('  -> Table does not exist. Run the migration first.')
      }
    } else {
      console.log('Customer types:')
      if (types.length === 0) {
        console.log('  (no types found)')
      } else {
        types.forEach(row => {
          console.log(`  - ${row.slug}: ${row.name_es} (${row.primary_color})`)
        })
      }
    }
    console.log('')

    // Check access_codes
    const { data: codes, error: codesError } = await supabase
      .from('access_codes')
      .select('*, customer_types(slug, name_es)')
      .order('created_at', { ascending: false })

    if (codesError) {
      console.log('Access codes table:', codesError.message)
      if (codesError.code === '42P01') {
        console.log('  -> Table does not exist. Run the migration first.')
      }
    } else {
      console.log('Access codes:')
      if (codes.length === 0) {
        console.log('  (no codes found)')
      } else {
        codes.forEach(row => {
          const typeSlug = row.customer_types?.slug || 'unknown'
          console.log(`  - Code: ${row.code} | Type: ${typeSlug} | Uses: ${row.use_count}/${row.max_uses || 'unlimited'} | Active: ${row.is_active}`)
        })
      }
    }
    console.log('')

    // Check usage logs
    const { data: logs, error: logsError } = await supabase
      .from('code_usage_logs')
      .select('*')
      .order('accessed_at', { ascending: false })
      .limit(10)

    if (logsError) {
      console.log('Usage logs table:', logsError.message)
    } else {
      console.log(`Recent usage logs: ${logs.length} entries`)
    }

  } catch (error) {
    console.error('Error:', error.message)
  }
}

main()
