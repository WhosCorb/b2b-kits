import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="grain min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md animate-fade-up">
        {/* Logo */}
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--accent)] text-white shadow-[var(--shadow-lg)]">
          <span className="font-[var(--font-display)] text-3xl font-bold">B</span>
        </div>

        {/* 404 */}
        <h1 className="mb-2 font-[var(--font-display)] text-6xl font-bold text-[var(--foreground)]">
          404
        </h1>

        <h2 className="mb-4 text-xl font-semibold text-[var(--foreground)]">
          Pagina no encontrada
        </h2>

        <p className="mb-8 text-[var(--muted)]">
          La pagina que buscas no existe o ha sido movida.
        </p>

        <Link href="/">
          <Button variant="primary" size="lg">
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Button>
        </Link>
      </div>
    </div>
  )
}
