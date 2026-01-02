'use client'

import { cn } from '@/lib/utils'
import { Mail, Phone, MapPin, ChevronDown, Calendar } from 'lucide-react'
import { useState } from 'react'

interface ContactCardProps {
  name?: string
  phone?: string
  email?: string
  address?: string
  lang?: 'es' | 'en'
  className?: string
  defaultExpanded?: boolean
}

const translations = {
  es: {
    title: 'Contacto',
    phone: 'Telefono',
    email: 'Email',
    address: 'Direccion',
    bookMeeting: 'Agenda una reunion',
  },
  en: {
    title: 'Contact',
    phone: 'Phone',
    email: 'Email',
    address: 'Address',
    bookMeeting: 'Book a meeting',
  },
}

const BOOKING_URL = 'https://outlook.office.com/bookwithme/user/2447189370a243eb845c01a574747438@benotac.es/meetingtype/pkByWyjcYkGgk7Oh9JFu1A2?anonymous&ismsaljsauthenabled&ep=mCardFromTile'

export function ContactCard({
  name,
  phone = '+34 900 123 456',
  email = 'info@benotac.es',
  address,
  lang = 'es',
  className,
  defaultExpanded = false,
}: ContactCardProps) {
  const t = translations[lang]
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

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
        'rounded-xl border bg-[var(--card)] overflow-hidden',
        'shadow-[var(--shadow-md)]',
        'transition-shadow duration-300 hover:shadow-[var(--shadow-lg)]',
        className
      )}
    >
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center justify-between p-4',
          'transition-colors duration-200',
          'hover:bg-[var(--accent-light)]'
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg',
              'bg-[var(--accent-light)] text-[var(--muted)]'
            )}
          >
            <Phone className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <div className="text-left">
            <h3 className="font-[var(--font-display)] text-base font-semibold tracking-tight text-[var(--foreground)]">
              {t.title}
            </h3>
            {name && (
              <p className="text-xs text-[var(--muted)]">{name}</p>
            )}
          </div>
        </div>
        <ChevronDown
          className={cn(
            'h-5 w-5 text-[var(--muted)] transition-transform duration-300',
            isExpanded && 'rotate-180'
          )}
        />
      </button>

      {/* Expandable Content */}
      <div
        className={cn(
          'grid transition-all duration-300 ease-in-out',
          isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 space-y-2">
            {contactItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-lg p-2',
                  'transition-colors duration-200',
                  'hover:bg-[var(--accent-light)]'
                )}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg',
                    'bg-[var(--accent-light)] text-[var(--muted)]',
                    'transition-all duration-200',
                    'group-hover:bg-[var(--foreground)] group-hover:text-[var(--background)]'
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

            {/* Book a meeting button */}
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'mt-2 flex items-center justify-center gap-2 rounded-lg p-3',
                'bg-[var(--foreground)] text-[var(--background)]',
                'font-medium text-sm',
                'transition-all duration-200',
                'hover:opacity-90 active:scale-[0.98]'
              )}
            >
              <Calendar className="h-4 w-4" strokeWidth={2} />
              {t.bookMeeting}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
