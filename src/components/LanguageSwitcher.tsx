'use client'

import { Globe } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n()

  return (
    <div className="flex items-center gap-2">
      <Globe size={16} className="text-[var(--muted)]" />
      <button
        onClick={() => setLocale('es')}
        className={`text-sm transition-colors ${
          locale === 'es'
            ? 'text-[var(--foreground)] font-medium'
            : 'text-[var(--muted)] hover:text-[var(--foreground)]'
        }`}
        aria-label={t.common.spanish}
      >
        ES
      </button>
      <span className="text-[var(--muted-foreground)]">/</span>
      <button
        onClick={() => setLocale('en')}
        className={`text-sm transition-colors ${
          locale === 'en'
            ? 'text-[var(--foreground)] font-medium'
            : 'text-[var(--muted)] hover:text-[var(--foreground)]'
        }`}
        aria-label={t.common.english}
      >
        EN
      </button>
    </div>
  )
}
