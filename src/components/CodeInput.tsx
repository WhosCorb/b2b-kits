'use client'

import { cn } from '@/lib/utils'
import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { Check, X, Loader2 } from 'lucide-react'

interface CodeInputProps {
  length?: number
  onComplete?: (code: string) => void
  onValidate?: (code: string) => Promise<boolean>
  lang?: 'es' | 'en'
  className?: string
  disabled?: boolean
}

const translations = {
  es: {
    placeholder: 'Introduce tu codigo',
    validating: 'Validando...',
    success: 'Codigo valido',
    error: 'Codigo invalido',
    tryAgain: 'Intentar de nuevo',
  },
  en: {
    placeholder: 'Enter your code',
    validating: 'Validating...',
    success: 'Valid code',
    error: 'Invalid code',
    tryAgain: 'Try again',
  },
}

type Status = 'idle' | 'validating' | 'success' | 'error'

export function CodeInput({
  length = 6,
  onComplete,
  onValidate,
  lang = 'es',
  className,
  disabled = false,
}: CodeInputProps) {
  const t = translations[lang]
  const [code, setCode] = useState<string[]>(Array(length).fill(''))
  const [status, setStatus] = useState<Status>('idle')
  const [focusIndex, setFocusIndex] = useState<number | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (index: number, value: string) => {
    if (disabled || status === 'validating' || status === 'success') return

    // Only accept alphanumeric
    const char = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(-1)

    const newCode = [...code]
    newCode[index] = char
    setCode(newCode)
    setStatus('idle')

    // Move to next input
    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    // Check if complete
    if (newCode.every((c) => c) && newCode.join('').length === length) {
      handleValidation(newCode.join(''))
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled || status === 'validating' || status === 'success') return

    if (e.key === 'Backspace') {
      e.preventDefault()
      const newCode = [...code]

      if (code[index]) {
        newCode[index] = ''
        setCode(newCode)
      } else if (index > 0) {
        newCode[index - 1] = ''
        setCode(newCode)
        inputRefs.current[index - 1]?.focus()
      }
      setStatus('idle')
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    if (disabled || status === 'validating' || status === 'success') return

    e.preventDefault()
    const pasted = e.clipboardData
      .getData('text')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .slice(0, length)

    const newCode = [...code]
    for (let i = 0; i < pasted.length; i++) {
      newCode[i] = pasted[i]
    }
    setCode(newCode)

    // Focus last filled or next empty
    const nextIndex = Math.min(pasted.length, length - 1)
    inputRefs.current[nextIndex]?.focus()

    if (pasted.length === length) {
      handleValidation(pasted)
    }
  }

  const handleValidation = async (fullCode: string) => {
    setStatus('validating')
    onComplete?.(fullCode)

    if (onValidate) {
      try {
        const isValid = await onValidate(fullCode)
        setStatus(isValid ? 'success' : 'error')
      } catch {
        setStatus('error')
      }
    }
  }

  const handleReset = () => {
    setCode(Array(length).fill(''))
    setStatus('idle')
    inputRefs.current[0]?.focus()
  }

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {/* Input boxes */}
      <div className="flex items-center gap-2 sm:gap-3">
        {code.map((char, index) => (
          <div key={index} className="relative">
            <input
              ref={(el) => {
                inputRefs.current[index] = el
              }}
              type="text"
              inputMode="text"
              maxLength={1}
              value={char}
              disabled={disabled || status === 'validating' || status === 'success'}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              onFocus={() => setFocusIndex(index)}
              onBlur={() => setFocusIndex(null)}
              className={cn(
                'code-input h-12 w-10 sm:h-14 sm:w-12 rounded-lg border-2 text-center text-lg sm:text-xl font-semibold',
                'bg-[var(--card)] text-[var(--foreground)]',
                'transition-all duration-200',
                'focus:outline-none',
                status === 'idle' && [
                  'border-[var(--border)]',
                  focusIndex === index && 'border-[var(--accent)] shadow-[0_0_0_3px_var(--accent-light)]',
                ],
                status === 'validating' && 'border-[var(--muted)] opacity-50',
                status === 'success' && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950',
                status === 'error' && 'border-red-500 bg-red-50 dark:bg-red-950 animate-shake'
              )}
              aria-label={`${t.placeholder} - digit ${index + 1}`}
            />
            {/* Cursor animation when focused and empty */}
            {focusIndex === index && !char && status === 'idle' && (
              <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="w-0.5 h-6 bg-[var(--accent)] animate-pulse" />
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Status indicator */}
      <div
        className={cn(
          'flex items-center gap-2 h-6 text-sm font-medium transition-all duration-300',
          status === 'idle' && 'text-[var(--muted)]',
          status === 'validating' && 'text-[var(--muted)]',
          status === 'success' && 'text-emerald-600 dark:text-emerald-400',
          status === 'error' && 'text-red-600 dark:text-red-400'
        )}
      >
        {status === 'idle' && (
          <span className="animate-fade-in">{t.placeholder}</span>
        )}
        {status === 'validating' && (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{t.validating}</span>
          </>
        )}
        {status === 'success' && (
          <>
            <Check className="h-4 w-4" />
            <span>{t.success}</span>
          </>
        )}
        {status === 'error' && (
          <>
            <X className="h-4 w-4" />
            <span>{t.error}</span>
            <button
              onClick={handleReset}
              className="ml-2 underline underline-offset-2 hover:text-[var(--foreground)] transition-colors"
            >
              {t.tryAgain}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
