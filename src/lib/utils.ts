import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateCode(length: number = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function detectLanguage(acceptLanguage: string | null): 'es' | 'en' {
  if (!acceptLanguage) return 'es'
  const lang = acceptLanguage.split(',')[0].split('-')[0].toLowerCase()
  return lang === 'en' ? 'en' : 'es'
}
