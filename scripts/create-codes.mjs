// Get credentials from environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables:')
  console.error('  NEXT_PUBLIC_SUPABASE_URL')
  console.error('  SUPABASE_SERVICE_ROLE_KEY')
  console.error('')
  console.error('Run with:')
  console.error('  NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/create-codes.mjs')
  console.error('')
  console.error('Or create a .env.local file and run:')
  console.error('  source <(grep -v "^#" .env.local | xargs -I {} echo "export {}") && node scripts/create-codes.mjs')
  process.exit(1)
}

async function main() {
  // Get customer types
  const typesRes = await fetch(`${SUPABASE_URL}/rest/v1/customer_types?select=id,slug`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    }
  })
  const types = await typesRes.json()
  console.log('Customer types:', types.map(t => t.slug).join(', '))

  // Create test codes for each type
  const testCodes = [
    { code: 'START1', type: 'startup', pdf: 'https://example.com/startup-kit.pdf' },
    { code: 'START2', type: 'startup', pdf: 'https://example.com/startup-kit.pdf' },
    { code: 'LEGAL1', type: 'legal', pdf: 'https://example.com/legal-kit.pdf' },
    { code: 'LEGAL2', type: 'legal', pdf: 'https://example.com/legal-kit.pdf' },
    { code: 'CORP01', type: 'corporate', pdf: 'https://example.com/corporate-kit.pdf' },
    { code: 'CORP02', type: 'corporate', pdf: 'https://example.com/corporate-kit.pdf' },
  ]

  console.log('\nCreating access codes...')

  for (const tc of testCodes) {
    const typeId = types.find(t => t.slug === tc.type)?.id
    if (!typeId) {
      console.log(`  Skipping ${tc.code} - type ${tc.type} not found`)
      continue
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/access_codes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        code: tc.code,
        customer_type_id: typeId,
        pdf_url: tc.pdf,
        is_active: true,
      })
    })

    if (res.ok) {
      console.log(`  Created: ${tc.code} (${tc.type})`)
    } else {
      const err = await res.text()
      if (err.includes('duplicate')) {
        console.log(`  Exists: ${tc.code} (${tc.type})`)
      } else {
        console.log(`  Failed: ${tc.code} - ${err}`)
      }
    }
  }

  // List all codes
  console.log('\n--- All Access Codes ---')
  const codesRes = await fetch(`${SUPABASE_URL}/rest/v1/access_codes?select=code,is_active,use_count,customer_types(slug)&order=code`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    }
  })
  const codes = await codesRes.json()

  codes.forEach(c => {
    console.log(`  ${c.code} | ${c.customer_types?.slug.padEnd(10)} | uses: ${c.use_count} | active: ${c.is_active}`)
  })
}

main().catch(console.error)
