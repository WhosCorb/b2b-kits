'use client'

import { Globe } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n()

  return (
    <div className="flex items-center gap-2">
      <Globe size={16} className="text-neutral-500" />
      <button
        onClick={() => setLocale('es')}
        className={`text-sm transition-colors ${
          locale === 'es'
            ? 'text-neutral-100 font-medium'
            : 'text-neutral-500 hover:text-neutral-300'
        }`}
        aria-label={t.common.spanish}
      >
        ES
      </button>
      <span className="text-neutral-600">/</span>
      <button
        onClick={() => setLocale('en')}
        className={`text-sm transition-colors ${
          locale === 'en'
            ? 'text-neutral-100 font-medium'
            : 'text-neutral-500 hover:text-neutral-300'
        }`}
        aria-label={t.common.english}
      >
        EN
      </button>
    </div>
  )
}
