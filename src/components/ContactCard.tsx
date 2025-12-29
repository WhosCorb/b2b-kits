'use client'

import { cn } from '@/lib/utils'
import { Mail, Phone, MapPin } from 'lucide-react'

interface ContactCardProps {
  name?: string
  phone?: string
  email?: string
  address?: string
  lang?: 'es' | 'en'
  className?: string
}

const translations = {
  es: {
    title: 'Contacto',
    phone: 'Telefono',
    email: 'Email',
    address: 'Direccion',
  },
  en: {
    title: 'Contact',
    phone: 'Phone',
    email: 'Email',
    address: 'Address',
  },
}

export function ContactCard({
  name,
  phone = '+34 900 123 456',
  email = 'info@benotac.es',
  address,
  lang = 'es',
  className,
}: ContactCardProps) {
  const t = translations[lang]

  const contactItems = [
    {
      icon: Phone,
      label: t.phone,
      value: phone,
      href: `tel:${phone.replace(/\s/g, '')}`,
    },
    {
      icon: Mail,
      label: t.email,
      value: email,
      href: `mailto:${email}`,
    },
    ...(address
      ? [
          {
            icon: MapPin,
            label: t.address,
            value: address,
            href: `https://maps.google.com/?q=${encodeURIComponent(address)}`,
          },
        ]
      : []),
  ]

  return (
    <div
      className={cn(
        'rounded-xl border bg-[var(--card)] p-6',
        'shadow-[var(--shadow-md)]',
        'transition-shadow duration-300 hover:shadow-[var(--shadow-lg)]',
        className
      )}
    >
      <div className="mb-4">
        <h3 className="font-[var(--font-display)] text-lg font-semibold tracking-tight text-[var(--foreground)]">
          {name || t.title}
        </h3>
        {name && (
          <p className="text-xs text-[var(--muted)] mt-0.5">{t.title}</p>
        )}
      </div>

      <div className="space-y-3">
        {contactItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={cn(
              'group flex items-center gap-3 rounded-lg p-2 -mx-2',
              'transition-colors duration-200',
              'hover:bg-[var(--accent-light)]'
            )}
          >
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg',
                'bg-[var(--accent-light)] text-[var(--accent)]',
                'transition-all duration-200',
                'group-hover:bg-[var(--accent)] group-hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
                {item.label}
              </span>
              <span className="text-sm font-medium text-[var(--foreground)]">
                {item.value}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
