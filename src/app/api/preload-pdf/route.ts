import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Map customer types to their PDF paths
const pdfPaths: Record<string, string> = {
  startup: 'startup/documento-startup.pdf',
  oro: 'oro/documento-oro.pdf',
  zafiro: 'zafiro/documento-zafiro.pdf',
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerType = searchParams.get('type')

    if (!customerType || !pdfPaths[customerType]) {
      return NextResponse.json(
        { error: 'Invalid customer type' },
        { status: 400 }
      )
    }

    const pdfPath = pdfPaths[customerType]
    const adminClient = createAdminClient()

    // Generate signed URL (valid for 1 hour)
    const { data, error } = await adminClient
      .storage
      .from('kit-pdfs')
      .createSignedUrl(pdfPath, 3600)

    if (error || !data?.signedUrl) {
      return NextResponse.json(
        { error: 'Could not generate PDF URL' },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: data.signedUrl })
  } catch (error) {
    console.error('Error preloading PDF:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
