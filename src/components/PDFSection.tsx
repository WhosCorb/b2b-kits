'use client'

import { cn } from '@/lib/utils'
import { useState, useCallback } from 'react'
import { Lock, FileText, Download, ExternalLink } from 'lucide-react'
import { CodeInput } from './CodeInput'
import { Button } from './ui/Button'

interface PDFSectionProps {
  customerType: string
  lang?: 'es' | 'en'
  className?: string
}

const translations = {
  es: {
    title: 'Documentacion del Kit',
    description: 'Introduce el codigo de acceso que aparece en tu tarjeta para desbloquear el contenido exclusivo.',
    unlocked: 'Contenido desbloqueado',
    download: 'Descargar PDF',
    openNew: 'Abrir en nueva pestana',
    viewingAs: 'Visualizando como',
  },
  en: {
    title: 'Kit Documentation',
    description: 'Enter the access code from your card to unlock exclusive content.',
    unlocked: 'Content unlocked',
    download: 'Download PDF',
    openNew: 'Open in new tab',
    viewingAs: 'Viewing as',
  },
}

export function PDFSection({
  customerType,
  lang = 'es',
  className,
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

      if (data.valid && data.pdfUrl) {
        setPdfUrl(data.pdfUrl)
        setValidCode(code)
        setTimeout(() => setIsUnlocked(true), 500) // Delay for success animation
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
                {t.viewingAs}: <span className="font-mono">{validCode}</span>
              </p>
            )}
          </div>
        </div>
      </div>

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
          /* Unlocked State */
          <div className="animate-unlock">
            {/* PDF Preview */}
            <div className="relative mb-6 overflow-hidden rounded-lg border bg-neutral-100 dark:bg-neutral-900">
              <div className="aspect-[3/4] w-full sm:aspect-video">
                {pdfUrl ? (
                  <iframe
                    src={`${pdfUrl}#toolbar=0&navpanes=0`}
                    className="h-full w-full"
                    title="PDF Preview"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <FileText className="h-16 w-16 text-[var(--muted)]" />
                  </div>
                )}
              </div>

              {/* Success badge */}
              <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-xs font-medium text-white shadow-lg">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                {t.unlocked}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => pdfUrl && window.open(pdfUrl, '_blank')}
              >
                <Download className="h-4 w-4" />
                {t.download}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => pdfUrl && window.open(pdfUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
                {t.openNew}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
