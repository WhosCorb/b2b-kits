import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { Metadata } from 'next'
import { ContactCard } from '@/components/ContactCard'
import { SocialLinks } from '@/components/SocialLinks'
import { PDFSection } from '@/components/PDFSection'
import { LandingWrapper } from '@/components/LandingWrapper'
import { Button } from '@/components/ui/Button'
import { ArrowRight } from 'lucide-react'
import type { Locale } from '@/lib/i18n/context'

// Customer type configurations
const customerTypes = {
  startup: {
    slug: 'startup',
    name: { es: 'Kit Startup', en: 'Startup Kit' },
    tagline: {
      es: 'Todo lo que necesitas para lanzar tu startup con exito',
      en: 'Everything you need to launch your startup successfully',
    },
    description: {
      es: 'Recursos exclusivos, plantillas y guias para emprendedores que quieren construir el futuro.',
      en: 'Exclusive resources, templates, and guides for entrepreneurs building the future.',
    },
  },
  legal: {
    slug: 'legal',
    name: { es: 'Kit Legal', en: 'Legal Kit' },
    tagline: {
      es: 'Soluciones juridicas para profesionales del derecho',
      en: 'Legal solutions for law professionals',
    },
    description: {
      es: 'Documentacion especializada y recursos para despachos y profesionales legales.',
      en: 'Specialized documentation and resources for law firms and legal professionals.',
    },
  },
  corporate: {
    slug: 'corporate',
    name: { es: 'Kit Corporativo', en: 'Corporate Kit' },
    tagline: {
      es: 'Soluciones empresariales para grandes organizaciones',
      en: 'Enterprise solutions for large organizations',
    },
    description: {
      es: 'Recursos y documentacion empresarial para corporaciones y grandes empresas.',
      en: 'Enterprise resources and documentation for corporations and large businesses.',
    },
  },
} as const

type CustomerTypeKey = keyof typeof customerTypes

interface PageProps {
  params: Promise<{ type: string }>
}

// Generate static params for all customer types
export function generateStaticParams() {
  return Object.keys(customerTypes).map((type) => ({ type }))
}

// Dynamic metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params

  if (!(type in customerTypes)) {
    return { title: 'Not Found' }
  }

  const config = customerTypes[type as CustomerTypeKey]

  return {
    title: `${config.name.es} | Benotac`,
    description: config.description.es,
    openGraph: {
      title: `${config.name.es} | Benotac`,
      description: config.description.es,
      type: 'website',
    },
  }
}

// Detect language from Accept-Language header
function detectLanguage(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return 'es'
  const primary = acceptLanguage.split(',')[0].split('-')[0].toLowerCase()
  return primary === 'en' ? 'en' : 'es'
}

export default async function CustomerTypePage({ params }: PageProps) {
  const { type } = await params

  // Validate customer type
  if (!(type in customerTypes)) {
    notFound()
  }

  const config = customerTypes[type as CustomerTypeKey]

  // Detect language
  const headersList = await headers()
  const acceptLanguage = headersList.get('accept-language')
  const lang = detectLanguage(acceptLanguage)

  const name = config.name[lang]
  const tagline = config.tagline[lang]
  const description = config.description[lang]

  const ctaText = lang === 'es' ? 'Visitar empresas.benotac.es' : 'Visit empresas.benotac.es'

  return (
    <LandingWrapper initialLocale={lang} type={type}>
      <main className="mx-auto max-w-lg px-4 py-8 sm:py-12">
        {/* Hero Section */}
        <header className="mb-10 text-center animate-fade-up">
          {/* Logo placeholder */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent)] text-white shadow-[var(--shadow-lg)]">
            <span className="font-[var(--font-display)] text-2xl font-bold">B</span>
          </div>

          {/* Type badge */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--accent-light)] px-4 py-1.5">
            <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
              {name}
            </span>
          </div>

          {/* Tagline */}
          <h1 className="mb-3 font-[var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
            {tagline}
          </h1>

          {/* Description */}
          <p className="mx-auto max-w-sm text-sm text-[var(--muted)] leading-relaxed">
            {description}
          </p>
        </header>

        {/* Contact Card */}
        <section className="mb-6 animate-fade-up delay-100">
          <ContactCard
            lang={lang}
            name="Jesus Perez"
            phone="+34 682 637 118"
            email="jesus@benotac.es"
          />
        </section>

        {/* Social Links */}
        <section className="mb-6 animate-fade-up delay-200">
          <SocialLinks
            lang={lang}
            linkedinUrl="https://linkedin.com/company/benotacpremiumreseller"
            instagramUrl="https://instagram.com/benotac.apple"
          />
        </section>

        {/* CTA Button */}
        <section className="mb-8 animate-fade-up delay-300">
          <a
            href="https://empresas.benotac.es"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button variant="secondary" size="lg" className="w-full group">
              {ctaText}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </a>
        </section>

        {/* PDF Section */}
        <section className="animate-fade-up delay-400">
          <PDFSection customerType={type} lang={lang} />
        </section>
      </main>
    </LandingWrapper>
  )
}
