import type { Metadata, Viewport } from 'next'
import { Crimson_Pro, DM_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const crimsonPro = Crimson_Pro({
  variable: '--font-display',
  subsets: ['latin'],
  display: 'swap',
})

const dmSans = DM_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'B2B Kits | Benotac',
    template: '%s | Benotac',
  },
  description: 'Accede a tu kit empresarial exclusivo con tu codigo de acceso',
  keywords: ['B2B', 'kit empresarial', 'startup', 'legal', 'corporativo', 'benotac'],
  authors: [{ name: 'Benotac' }],
  creator: 'Benotac',
  metadataBase: new URL('https://b2b-kits.benotac.es'),
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    alternateLocale: 'en_US',
    siteName: 'B2B Kits - Benotac',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${crimsonPro.variable} ${dmSans.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
