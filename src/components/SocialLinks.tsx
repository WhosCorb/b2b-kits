'use client'

import { cn } from '@/lib/utils'
import { Linkedin, Instagram } from 'lucide-react'

interface SocialLinksProps {
  linkedinUrl?: string
  instagramUrl?: string
  lang?: 'es' | 'en'
  className?: string
}

const translations = {
  es: {
    followUs: 'Siguenos',
    linkedin: 'LinkedIn',
    instagram: 'Instagram',
  },
  en: {
    followUs: 'Follow us',
    linkedin: 'LinkedIn',
    instagram: 'Instagram',
  },
}

export function SocialLinks({
  linkedinUrl = 'https://linkedin.com/company/benotac',
  instagramUrl = 'https://instagram.com/benotac',
  lang = 'es',
  className,
}: SocialLinksProps) {
  const t = translations[lang]

  const socials = [
    {
      name: t.linkedin,
      icon: Linkedin,
      href: linkedinUrl,
      hoverColor: 'hover:bg-[#0077B5] hover:border-[#0077B5]',
    },
    {
      name: t.instagram,
      icon: Instagram,
      href: instagramUrl,
      hoverColor: 'hover:bg-gradient-to-br hover:from-[#833AB4] hover:via-[#FD1D1D] hover:to-[#F77737] hover:border-transparent',
    },
  ]

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <span className="text-xs font-medium uppercase tracking-widest text-[var(--muted)]">
        {t.followUs}
      </span>
      <div className="flex items-center gap-3">
        {socials.map((social) => (
          <a
            key={social.name}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.name}
            className={cn(
              'group relative flex h-12 w-12 items-center justify-center',
              'rounded-full border border-[var(--border)] bg-[var(--card)]',
              'text-[var(--muted)] transition-all duration-300',
              'hover:text-white hover:scale-110',
              'shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-lg)]',
              social.hoverColor
            )}
          >
            <social.icon className="h-5 w-5" strokeWidth={1.5} />

            {/* Tooltip */}
            <span
              className={cn(
                'absolute -bottom-8 left-1/2 -translate-x-1/2',
                'rounded bg-[var(--foreground)] px-2 py-1',
                'text-xs font-medium text-[var(--background)]',
                'opacity-0 transition-opacity duration-200',
                'group-hover:opacity-100',
                'pointer-events-none whitespace-nowrap'
              )}
            >
              {social.name}
            </span>
          </a>
        ))}
      </div>
    </div>
  )
}
