'use client'

import { cn } from '@/lib/utils'
import { useState, useEffect, useCallback } from 'react'
import { ChevronDown, Rocket, Award, Gem } from 'lucide-react'
import { PDFSection } from './PDFSection'
import { useKit } from './LandingWrapper'
import type { LucideIcon } from 'lucide-react'

type KitType = 'startup' | 'oro' | 'zafiro'

interface KitConfig {
  id: KitType
  name: { es: string; en: string }
  tagline: { es: string; en: string }
  icon: LucideIcon
  accentClass: string
  bgClass: string
  borderClass: string
}

const kits: KitConfig[] = [
  {
    id: 'startup',
    name: { es: 'Kit Startup', en: 'Startup Kit' },
    tagline: { es: 'Para emprendedores', en: 'For entrepreneurs' },
    icon: Rocket,
    accentClass: 'text-teal-600 dark:text-teal-300',
    bgClass: 'bg-teal-50 dark:bg-teal-950/50',
    borderClass: 'border-teal-200 dark:border-teal-700',
  },
  {
    id: 'oro',
    name: { es: 'Kit Oro', en: 'Gold Kit' },
    tagline: { es: 'Para profesionales', en: 'For professionals' },
    icon: Award,
    accentClass: 'text-amber-600 dark:text-amber-300',
    bgClass: 'bg-amber-50 dark:bg-amber-950/50',
    borderClass: 'border-amber-200 dark:border-amber-700',
  },
  {
    id: 'zafiro',
    name: { es: 'Kit Zafiro', en: 'Sapphire Kit' },
    tagline: { es: 'Para empresas', en: 'For enterprises' },
    icon: Gem,
    accentClass: 'text-sky-600 dark:text-sky-300',
    bgClass: 'bg-sky-50 dark:bg-sky-950/50',
    borderClass: 'border-sky-200 dark:border-sky-700',
  },
]

interface KitSelectorProps {
  lang?: 'es' | 'en'
  className?: string
}

const translations = {
  es: {
    selectKit: 'Selecciona tu kit',
  },
  en: {
    selectKit: 'Select your kit',
  },
}

export function KitSelector({ lang = 'es', className }: KitSelectorProps) {
  const [expandedKit, setExpandedKit] = useState<KitType | null>(null)
  const { setSelectedKit } = useKit()
  const t = translations[lang]

  // Update global accent when kit is expanded/collapsed
  useEffect(() => {
    setSelectedKit(expandedKit)
  }, [expandedKit, setSelectedKit])

  // Preload PDF when kit is expanded
  const preloadPdf = useCallback(async (kitId: KitType) => {
    try {
      const response = await fetch(`/api/preload-pdf?type=${kitId}`)
      const data = await response.json()

      if (data.url) {
        // Create prefetch link to start downloading the PDF in background
        const existingLink = document.querySelector(`link[data-pdf-preload="${kitId}"]`)
        if (!existingLink) {
          const preloadLink = document.createElement('link')
          preloadLink.rel = 'prefetch'
          preloadLink.href = data.url
          preloadLink.as = 'document'
          preloadLink.setAttribute('data-pdf-preload', kitId)
          document.head.appendChild(preloadLink)
        }
      }
    } catch (error) {
      // Silently fail - preloading is an optimization, not critical
      console.debug('PDF preload failed:', error)
    }
  }, [])

  const handleKitClick = (kitId: KitType) => {
    const isExpanding = expandedKit !== kitId
    setExpandedKit(isExpanding ? kitId : null)

    // Preload PDF when expanding (not collapsing)
    if (isExpanding) {
      preloadPdf(kitId)
    }
  }

  return (
    <div className={cn('space-y-3', className)}>
      <h2 className="text-xs font-medium uppercase tracking-widest text-[var(--muted)] text-center mb-4">
        {t.selectKit}
      </h2>

      {kits.map((kit) => {
        const isExpanded = expandedKit === kit.id
        const Icon = kit.icon

        return (
          <div
            key={kit.id}
            className={cn(
              'rounded-xl border overflow-hidden transition-all duration-300',
              'bg-[var(--card)] shadow-[var(--shadow-md)]',
              isExpanded && 'shadow-[var(--shadow-lg)]',
              isExpanded ? kit.borderClass : 'border-[var(--border)]'
            )}
          >
            {/* Kit Header Button */}
            <button
              onClick={() => handleKitClick(kit.id)}
              className={cn(
                'w-full flex items-center justify-between p-4',
                'transition-colors duration-200',
                isExpanded ? kit.bgClass : 'hover:bg-[var(--accent-light)]'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-xl',
                    'transition-all duration-300',
                    isExpanded
                      ? `${kit.bgClass} ${kit.accentClass}`
                      : 'bg-[var(--accent-light)] text-[var(--muted)]'
                  )}
                >
                  <Icon className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <div className="text-left">
                  <h3 className={cn(
                    'font-[var(--font-display)] text-base font-semibold tracking-tight',
                    'transition-colors duration-300',
                    isExpanded ? kit.accentClass : 'text-[var(--foreground)]'
                  )}>
                    {kit.name[lang]}
                  </h3>
                  <p className="text-xs text-[var(--muted)]">
                    {kit.tagline[lang]}
                  </p>
                </div>
              </div>
              <ChevronDown
                className={cn(
                  'h-5 w-5 transition-transform duration-300',
                  isExpanded ? `rotate-180 ${kit.accentClass}` : 'text-[var(--muted)]'
                )}
              />
            </button>

            {/* Expandable PDF Section */}
            <div
              className={cn(
                'grid transition-all duration-300 ease-in-out',
                isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              )}
            >
              <div className="overflow-hidden">
                <div className="p-4 pt-0">
                  <PDFSection
                    customerType={kit.id}
                    lang={lang}
                    className="border-0 shadow-none"
                    hideHeader
                  />
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
