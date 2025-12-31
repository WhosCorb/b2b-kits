'use client'

import { ReactNode, useState, createContext, useContext } from 'react'
import { I18nProvider, Locale } from '@/lib/i18n/context'
import { LanguageSwitcher } from './LanguageSwitcher'

type KitType = 'startup' | 'oro' | 'zafiro' | null

interface KitContextValue {
  selectedKit: KitType
  setSelectedKit: (kit: KitType) => void
}

const KitContext = createContext<KitContextValue>({
  selectedKit: null,
  setSelectedKit: () => {},
})

export const useKit = () => useContext(KitContext)

interface LandingWrapperProps {
  children: ReactNode
  initialLocale: Locale
}

export function LandingWrapper({ children, initialLocale }: LandingWrapperProps) {
  const [selectedKit, setSelectedKit] = useState<KitType>(null)

  return (
    <I18nProvider initialLocale={initialLocale}>
      <KitContext.Provider value={{ selectedKit, setSelectedKit }}>
        <div
          data-kit={selectedKit || undefined}
          className="grain min-h-screen flex flex-col transition-colors duration-300"
        >
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
                  className="font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  Benotac
                </a>
              </p>
            </div>
          </footer>
        </div>
      </KitContext.Provider>
    </I18nProvider>
  )
}
