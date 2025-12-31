'use client'

import Image from 'next/image'
import { ContactCard } from '@/components/ContactCard'
import { SocialLinks } from '@/components/SocialLinks'
import { KitSelector } from '@/components/KitSelector'
import { Button } from '@/components/ui/Button'
import { ArrowRight } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'

const translations = {
  es: {
    tagline: 'Accede a tu kit exclusivo',
    cta: 'Visita nuestra web',
  },
  en: {
    tagline: 'Access your exclusive kit',
    cta: 'Visit our website',
  },
}

export function MainContent() {
  const { locale } = useI18n()
  const t = translations[locale]

  return (
    <main className="mx-auto max-w-lg px-4 py-8 sm:py-12">
      {/* Hero Section */}
      <header className="mb-10 text-center animate-fade-up">
        {/* Logo - light/dark variants */}
        <div className="mx-auto mb-8 flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="Benotac"
            width={280}
            height={80}
            className="h-20 w-auto dark:hidden sm:h-24"
            priority
          />
          <Image
            src="/logo-white.png"
            alt="Benotac"
            width={280}
            height={80}
            className="h-20 w-auto hidden dark:block sm:h-24"
            priority
          />
        </div>

        {/* Tagline */}
        <h1 className="mb-3 font-[var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          {t.tagline}
        </h1>
      </header>

      {/* Kit Selector */}
      <section className="mb-6 animate-fade-up delay-100">
        <KitSelector lang={locale} />
      </section>

      {/* Contact Card - Collapsed by default */}
      <section className="mb-6 animate-fade-up delay-200">
        <ContactCard
          lang={locale}
          name="Jesus Perez"
          phone="+34 682 637 118"
          email="jesus@benotac.es"
          defaultExpanded={false}
        />
      </section>

      {/* Social Links */}
      <section className="mb-6 animate-fade-up delay-300">
        <SocialLinks
          lang={locale}
          linkedinUrl="https://linkedin.com/company/benotacpremiumreseller"
          instagramUrl="https://instagram.com/benotac.apple"
        />
      </section>

      {/* CTA Button */}
      <section className="animate-fade-up delay-400">
        <a
          href="https://empresas.benotac.es/customer/account/create/"
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Button variant="secondary" size="lg" className="w-full group">
            {t.cta}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </a>
      </section>
    </main>
  )
}
