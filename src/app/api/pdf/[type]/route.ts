import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Map customer types to their PDF paths (horizontal and vertical versions)
const pdfPaths: Record<string, { hor: string; ver: string }> = {
  startup: {
    hor: 'startup/camp_q1_26_v1.1_startup_hor.pdf',
    ver: 'startup/camp_q1_26_v1.1_startup_ver.pdf',
  },
  oro: {
    hor: 'oro/camp_q1_26_v1.1_oro_hor.pdf',
    ver: 'oro/camp_q1_26_v1.1_oro_ver.pdf',
  },
  zafiro: {
    hor: 'zafiro/camp_q1_26_v1.1_zafiro_hor.pdf',
    ver: 'zafiro/camp_q1_26_v1.1_zafiro_ver.pdf',
  },
}

interface RouteParams {
  params: Promise<{ type: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { type } = await params
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const orientation = searchParams.get('orientation') || 'hor' // Default to horizontal

    // Validate type
    if (!pdfPaths[type]) {
      return NextResponse.json({ error: 'Invalid kit type' }, { status: 400 })
    }

    // Validate orientation
    if (orientation !== 'hor' && orientation !== 'ver') {
      return NextResponse.json({ error: 'Invalid orientation' }, { status: 400 })
    }

    // Validate code is provided
    if (!code) {
      return NextResponse.json({ error: 'Access code required' }, { status: 401 })
    }

    // Verify the code is valid
    const supabase = await createClient()
    const { data: accessCode, error: codeError } = await supabase
      .from('access_codes')
      .select(`
        id,
        is_active,
        expires_at,
        max_uses,
        use_count,
        customer_type:customer_types!inner(slug)
      `)
      .eq('code', code.toUpperCase())
      .single()

    if (codeError || !accessCode) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 401 })
    }

    // Check if code is active
    if (!accessCode.is_active) {
      return NextResponse.json({ error: 'Code is inactive' }, { status: 401 })
    }

    // Check expiration
    if (accessCode.expires_at && new Date(accessCode.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Code has expired' }, { status: 401 })
    }

    // Check max uses
    if (accessCode.max_uses && accessCode.use_count >= accessCode.max_uses) {
      return NextResponse.json({ error: 'Code usage limit reached' }, { status: 401 })
    }

    // Verify code matches the requested kit type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const codeType = (accessCode.customer_type as any)?.slug
    if (codeType !== type) {
      return NextResponse.json({ error: 'Code not valid for this kit' }, { status: 401 })
    }

    // Fetch PDF from Supabase Storage
    const adminClient = createAdminClient()
    const pdfPath = pdfPaths[type][orientation]

    const { data: pdfData, error: pdfError } = await adminClient
      .storage
      .from('kit-pdfs')
      .download(pdfPath)

    if (pdfError || !pdfData) {
      console.error('Error downloading PDF:', pdfError)
      return NextResponse.json({ error: 'Could not load PDF' }, { status: 500 })
    }

    // Return PDF with proper headers
    const arrayBuffer = await pdfData.arrayBuffer()

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="documento-${type}.pdf"`,
        'Cache-Control': 'private, max-age=3600', // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error('Error serving PDF:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
