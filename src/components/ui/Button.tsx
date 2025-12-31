'use client'

import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { forwardRef, type ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const baseStyles = [
      'inline-flex items-center justify-center gap-2',
      'font-medium transition-all duration-200',
      'focus-ring rounded-lg',
      'disabled:opacity-50 disabled:pointer-events-none',
    ].join(' ')

    const variants = {
      primary: [
        'bg-[var(--accent)] text-white',
        'hover:opacity-90 active:scale-[0.98]',
        'shadow-[var(--shadow-md)]',
      ].join(' '),
      secondary: [
        'bg-[var(--accent-light)] text-[var(--foreground)]',
        'border border-[var(--border)]',
        'hover:bg-[var(--foreground)] hover:text-[var(--background)]',
        'active:scale-[0.98]',
      ].join(' '),
      ghost: [
        'text-[var(--foreground)]',
        'hover:bg-[var(--accent-light)]',
        'active:scale-[0.98]',
      ].join(' '),
      outline: [
        'border border-[var(--border)]',
        'text-[var(--foreground)]',
        'hover:border-[var(--accent)] hover:text-[var(--accent)]',
        'active:scale-[0.98]',
      ].join(' '),
    }

    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
