import bcrypt from 'bcryptjs'

// Get credentials from environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables:')
  console.error('  NEXT_PUBLIC_SUPABASE_URL')
  console.error('  SUPABASE_SERVICE_ROLE_KEY')
  console.error('')
  console.error('Run with:')
  console.error('  source <(grep -v "^#" .env.local | xargs -I {} echo "export {}") && node scripts/generate-codes.mjs <type> <count>')
  process.exit(1)
}

// Characters for code generation (avoiding ambiguous: 0/O, 1/I/l)
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const CODE_LENGTH = 6
const SALT_ROUNDS = 10

function generateCode() {
  let code = ''
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  }
  return code
}

async function hashCode(code) {
  return bcrypt.hash(code, SALT_ROUNDS)
}

async function main() {
  const args = process.argv.slice(2)
  const kitType = args[0]
  const count = parseInt(args[1]) || 1

  if (!kitType || !['startup', 'oro', 'zafiro'].includes(kitType)) {
    console.error('Usage: node scripts/generate-codes.mjs <type> [count]')
    console.error('  type: startup | oro | zafiro')
    console.error('  count: number of codes to generate (default: 1)')
    process.exit(1)
  }

  // Get customer type ID
  const typesRes = await fetch(`${SUPABASE_URL}/rest/v1/customer_types?slug=eq.${kitType}&select=id`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    }
  })
  const types = await typesRes.json()

  if (!types || types.length === 0) {
    console.error(`Customer type '${kitType}' not found in database`)
    process.exit(1)
  }

  const typeId = types[0].id
  console.log(`Generating ${count} code(s) for ${kitType}...\n`)

  const generatedCodes = []

  for (let i = 0; i < count; i++) {
    const code = generateCode()
    const codeHash = await hashCode(code)

    // Insert into database (code column left null for security)
    const res = await fetch(`${SUPABASE_URL}/rest/v1/access_codes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        code: null, // Don't store plain code
        code_hash: codeHash,
        customer_type_id: typeId,
        is_active: true,
      })
    })

    if (res.ok) {
      generatedCodes.push(code)
      console.log(`  [${i + 1}] ${code}`)
    } else {
      const err = await res.text()
      console.error(`  [${i + 1}] Failed: ${err}`)
    }
  }

  console.log('\n--- Summary ---')
  console.log(`Generated ${generatedCodes.length} codes for ${kitType}`)
  console.log('\nCOPY THESE CODES NOW - they cannot be recovered:')
  console.log('─'.repeat(40))
  generatedCodes.forEach((code, i) => {
    console.log(`  ${i + 1}. ${code}`)
  })
  console.log('─'.repeat(40))
}

main().catch(console.error)
