'use client'

import { cn } from '@/lib/utils'
import { useState, useCallback } from 'react'
import { Lock, FileText, ExternalLink } from 'lucide-react'
import { CodeInput } from './CodeInput'
import { Button } from './ui/Button'

interface PDFSectionProps {
  customerType: string
  lang?: 'es' | 'en'
  className?: string
  hideHeader?: boolean
}

const translations = {
  es: {
    title: 'Documentacion del Kit',
    description: 'Introduce el codigo de acceso que aparece en tu tarjeta para desbloquear el contenido exclusivo.',
    unlocked: 'PDF abierto en nueva pestana',
    reopenPdf: 'Volver a abrir PDF',
    codeUsed: 'Codigo utilizado',
  },
  en: {
    title: 'Kit Documentation',
    description: 'Enter the access code from your card to unlock exclusive content.',
    unlocked: 'PDF opened in new tab',
    reopenPdf: 'Re-open PDF',
    codeUsed: 'Code used',
  },
}

export function PDFSection({
  customerType,
  lang = 'es',
  className,
  hideHeader = false,
}: PDFSectionProps) {
  const t = translations[lang]
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [validCode, setValidCode] = useState<string | null>(null)

  const handleValidate = useCallback(async (code: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/validate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, customerType }),
      })

      const data = await response.json()

      if (data.valid) {
        // Use custom domain URL instead of Supabase signed URL
        const customPdfUrl = `/api/pdf/${customerType}?code=${encodeURIComponent(code)}`
        setPdfUrl(customPdfUrl)
        setValidCode(code)

        // Open PDF in new tab
        window.open(customPdfUrl, '_blank')
        setTimeout(() => setIsUnlocked(true), 300)
        return true
      }

      return false
    } catch {
      return false
    }
  }, [customerType])

  return (
    <div
      className={cn(
        'rounded-xl border bg-[var(--card)] overflow-hidden',
        'shadow-[var(--shadow-lg)]',
        className
      )}
    >
      {/* Header */}
      {!hideHeader && (
        <div className="border-b bg-gradient-to-r from-[var(--accent-light)] to-transparent p-6">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg',
                isUnlocked
                  ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400'
                  : 'bg-[var(--accent)] text-white'
              )}
            >
              {isUnlocked ? (
                <FileText className="h-5 w-5" />
              ) : (
                <Lock className="h-5 w-5" />
              )}
            </div>
            <div>
              <h3 className="font-[var(--font-display)] text-lg font-semibold text-[var(--foreground)]">
                {t.title}
              </h3>
              {isUnlocked && validCode && (
                <p className="text-xs text-[var(--muted)]">
                  {t.codeUsed}: <span className="font-mono">{validCode}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {!isUnlocked ? (
          /* Locked State */
          <div className="flex flex-col items-center py-8">
            <p className="mb-8 max-w-sm text-center text-sm text-[var(--muted)]">
              {t.description}
            </p>
            <CodeInput lang={lang} onValidate={handleValidate} />
          </div>
        ) : (
          /* Unlocked State - Success Message */
          <div className="animate-unlock flex flex-col items-center py-8">
            {/* Success icon */}
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
              <FileText className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>

            {/* Success message */}
            <p className="mb-2 text-lg font-medium text-[var(--foreground)]">
              {t.unlocked}
            </p>

            {/* Code used */}
            {validCode && (
              <p className="mb-6 text-sm text-[var(--muted)]">
                {t.codeUsed}: <span className="font-mono font-medium">{validCode}</span>
              </p>
            )}

            {/* Re-open button */}
            <Button
              variant="outline"
              onClick={() => pdfUrl && window.open(pdfUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
              {t.reopenPdf}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
