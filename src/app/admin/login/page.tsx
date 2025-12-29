'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check for error in URL params
    const errorParam = searchParams.get('error')
    if (errorParam === 'unauthorized') {
      setError('You are not authorized to access the admin panel.')
    }

    // Check if already logged in
    checkExistingSession()
  }, [searchParams])

  async function checkExistingSession() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      // Verify admin status
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (adminUser) {
        router.push('/admin')
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        setIsLoading(false)
        return
      }

      if (!data.session) {
        setError('Failed to create session')
        setIsLoading(false)
        return
      }

      // Check if user is admin
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('id', data.session.user.id)
        .single()

      if (adminError || !adminUser) {
        await supabase.auth.signOut()
        setError('You are not authorized to access the admin panel.')
        setIsLoading(false)
        return
      }

      router.push('/admin')
    } catch {
      setError('An unexpected error occurred')
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-950/50 border border-red-900 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            placeholder="admin@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 pr-12 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>
    </div>
  )
}

function LoginFormFallback() {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-16 bg-neutral-800 rounded" />
        <div className="h-12 bg-neutral-800 rounded-lg" />
        <div className="h-4 w-16 bg-neutral-800 rounded" />
        <div className="h-12 bg-neutral-800 rounded-lg" />
        <div className="h-12 bg-neutral-800 rounded-lg" />
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-neutral-100 tracking-tight">B2B Kits</h1>
          <p className="text-neutral-500 text-sm mt-2">Admin Dashboard</p>
        </div>

        {/* Login form */}
        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>

        {/* Footer */}
        <p className="text-center text-neutral-600 text-xs mt-6">
          Benotac B2B Kits Administration
        </p>
      </div>
    </div>
  )
}
