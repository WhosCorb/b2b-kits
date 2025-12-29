'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations, TranslationKeys } from './translations'
import type { Locale } from './translations'

export type { Locale }

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: TranslationKeys
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({
  children,
  initialLocale = 'es',
}: {
  children: ReactNode
  initialLocale?: Locale
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  useEffect(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem('locale') as Locale | null
    if (saved && (saved === 'es' || saved === 'en')) {
      setLocaleState(saved)
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('locale', newLocale)
  }

  const t = translations[locale]

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

// Utility to detect locale from Accept-Language header
export function detectLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return 'es'

  const languages = acceptLanguage.split(',').map((lang) => {
    const [code] = lang.trim().split(';')
    return code.split('-')[0].toLowerCase()
  })

  if (languages.includes('en')) {
    // If English appears before Spanish, use English
    const enIndex = languages.indexOf('en')
    const esIndex = languages.indexOf('es')
    if (esIndex === -1 || enIndex < esIndex) {
      return 'en'
    }
  }

  return 'es'
}
