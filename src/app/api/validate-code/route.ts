import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Simple in-memory rate limiting (use Redis in production for multi-instance)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_ATTEMPTS = 5

function getRateLimitKey(ip: string): string {
  return `rate_limit:${ip}`
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const key = getRateLimitKey(ip)
  const now = Date.now()
  const record = rateLimitMap.get(key)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 }
  }

  if (record.count >= MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0 }
  }

  record.count++
  return { allowed: true, remaining: MAX_ATTEMPTS - record.count }
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}, RATE_LIMIT_WINDOW)

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown'

    // Check rate limit
    const { allowed, remaining } = checkRateLimit(ip)
    if (!allowed) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Too many attempts. Please wait a minute before trying again.',
          errorCode: 'RATE_LIMITED',
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000) + 60),
          },
        }
      )
    }

    // Parse request body
    const body = await request.json()
    const { code, customerType } = body

    // Validate input
    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'Code is required', errorCode: 'INVALID_INPUT' },
        { status: 400 }
      )
    }

    // Normalize code (uppercase, trim)
    const normalizedCode = code.toUpperCase().trim()

    // Validate code format (6 alphanumeric characters)
    if (!/^[A-Z0-9]{6}$/.test(normalizedCode)) {
      return NextResponse.json(
        { valid: false, error: 'Invalid code format', errorCode: 'INVALID_FORMAT' },
        {
          status: 400,
          headers: { 'X-RateLimit-Remaining': String(remaining) },
        }
      )
    }

    // Connect to Supabase
    const supabase = await createClient()

    // Query for valid code
    const { data: accessCode, error: queryError } = await supabase
      .from('access_codes')
      .select(`
        id,
        code,
        pdf_url,
        customer_type_id,
        expires_at,
        max_uses,
        use_count,
        is_active,
        customer_types (
          slug,
          name_es,
          name_en
        )
      `)
      .eq('code', normalizedCode)
      .eq('is_active', true)
      .single()

    if (queryError || !accessCode) {
      return NextResponse.json(
        { valid: false, error: 'Invalid code', errorCode: 'CODE_NOT_FOUND' },
        {
          status: 401,
          headers: { 'X-RateLimit-Remaining': String(remaining) },
        }
      )
    }

    // Check if code matches the customer type (if provided)
    // customer_types comes as an object from the single() query join
    const codeCustomerType = accessCode.customer_types as unknown as { slug: string; name_es: string; name_en: string } | null
    if (customerType && codeCustomerType?.slug !== customerType) {
      return NextResponse.json(
        { valid: false, error: 'Code not valid for this kit type', errorCode: 'TYPE_MISMATCH' },
        {
          status: 401,
          headers: { 'X-RateLimit-Remaining': String(remaining) },
        }
      )
    }

    // Check expiration
    if (accessCode.expires_at && new Date(accessCode.expires_at) < new Date()) {
      return NextResponse.json(
        { valid: false, error: 'Code has expired', errorCode: 'CODE_EXPIRED' },
        {
          status: 401,
          headers: { 'X-RateLimit-Remaining': String(remaining) },
        }
      )
    }

    // Check max uses
    if (accessCode.max_uses !== null && accessCode.use_count >= accessCode.max_uses) {
      return NextResponse.json(
        { valid: false, error: 'Code has reached maximum uses', errorCode: 'MAX_USES_REACHED' },
        {
          status: 401,
          headers: { 'X-RateLimit-Remaining': String(remaining) },
        }
      )
    }

    // Code is valid - increment use count
    await supabase
      .from('access_codes')
      .update({ use_count: accessCode.use_count + 1 })
      .eq('id', accessCode.id)

    // Log the usage
    const userAgent = request.headers.get('user-agent') || null
    const acceptLanguage = request.headers.get('accept-language')
    const language = acceptLanguage?.split(',')[0]?.split('-')[0] || null

    await supabase.from('code_usage_logs').insert({
      code_id: accessCode.id,
      ip_address: ip !== 'unknown' ? ip : null,
      user_agent: userAgent,
      language,
      country: null, // Could be populated via geo-IP service
    })

    // Generate signed URL for PDF access (valid for 1 hour)
    let pdfUrl = accessCode.pdf_url

    // If pdf_url is a storage path (not a full URL), generate a signed URL
    if (pdfUrl && !pdfUrl.startsWith('http')) {
      const adminClient = createAdminClient()
      const { data: signedUrlData, error: signedUrlError } = await adminClient
        .storage
        .from('kit-pdfs')
        .createSignedUrl(pdfUrl, 3600) // 1 hour expiration

      if (signedUrlError) {
        console.error('Error generating signed URL:', signedUrlError)
        return NextResponse.json(
          { valid: false, error: 'Could not access PDF', errorCode: 'PDF_ACCESS_ERROR' },
          { status: 500 }
        )
      }

      pdfUrl = signedUrlData.signedUrl
    }

    // Return success with signed PDF URL
    return NextResponse.json(
      {
        valid: true,
        pdfUrl,
        customerType: codeCustomerType?.slug,
      },
      {
        status: 200,
        headers: { 'X-RateLimit-Remaining': String(remaining) },
      }
    )
  } catch (error) {
    console.error('Error validating code:', error)
    return NextResponse.json(
      { valid: false, error: 'Internal server error', errorCode: 'SERVER_ERROR' },
      { status: 500 }
    )
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}
