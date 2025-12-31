import { headers } from 'next/headers'
import { Metadata } from 'next'
import { LandingWrapper } from '@/components/LandingWrapper'
import { MainContent } from '@/components/MainContent'
import type { Locale } from '@/lib/i18n/context'

export const metadata: Metadata = {
  title: 'B2B Kits | Benotac',
  description: 'Accede a tu kit exclusivo de Benotac. Recursos y documentacion para startups, profesionales y empresas.',
  openGraph: {
    title: 'B2B Kits | Benotac',
    description: 'Accede a tu kit exclusivo de Benotac',
    type: 'website',
  },
}

// Detect language from Accept-Language header
function detectLanguage(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return 'es'
  const primary = acceptLanguage.split(',')[0].split('-')[0].toLowerCase()
  return primary === 'en' ? 'en' : 'es'
}

export default async function HomePage() {
  // Detect language from browser
  const headersList = await headers()
  const acceptLanguage = headersList.get('accept-language')
  const initialLocale = detectLanguage(acceptLanguage)

  return (
    <LandingWrapper initialLocale={initialLocale}>
      <MainContent />
    </LandingWrapper>
  )
}
