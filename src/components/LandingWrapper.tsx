'use client'

import { ReactNode } from 'react'
import { I18nProvider, Locale } from '@/lib/i18n/context'
import { LanguageSwitcher } from './LanguageSwitcher'

interface LandingWrapperProps {
  children: ReactNode
  initialLocale: Locale
  type: string
}

export function LandingWrapper({ children, initialLocale, type }: LandingWrapperProps) {
  return (
    <I18nProvider initialLocale={initialLocale}>
      <div data-type={type} className="grain min-h-screen flex flex-col">
        <div className="flex-1">
          {children}
        </div>

        {/* Footer with language switcher */}
        <footer className="py-6 text-center border-t border-[var(--border)]">
          <div className="mx-auto max-w-lg px-4">
            <div className="flex items-center justify-center gap-4">
              <LanguageSwitcher />
            </div>
            <p className="mt-4 text-xs text-[var(--muted-foreground)]">
              Powered by{' '}
              <a
                href="https://benotac.es"
                className="font-medium text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
              >
                Benotac
              </a>
            </p>
          </div>
        </footer>
      </div>
    </I18nProvider>
  )
}
