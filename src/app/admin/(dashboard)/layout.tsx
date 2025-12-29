'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import { LayoutDashboard, Key, FileText, LogOut, Menu, X } from 'lucide-react'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      router.push('/admin/login')
      return
    }

    // Check if user is admin
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!adminUser) {
      await supabase.auth.signOut()
      router.push('/admin/login?error=unauthorized')
      return
    }

    setUserEmail(session.user.email ?? null)
    setIsAuthenticated(true)
    setIsLoading(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="animate-pulse text-neutral-400">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/codes', icon: Key, label: 'Access Codes' },
    { href: '/admin/logs', icon: FileText, label: 'Usage Logs' },
  ]

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-neutral-900 border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
        <span className="font-semibold">B2B Kits Admin</span>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-neutral-900 border-r border-neutral-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-neutral-800">
            <h1 className="text-lg font-bold tracking-tight">B2B Kits</h1>
            <p className="text-xs text-neutral-500 mt-1">Admin Dashboard</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/50 transition-colors"
              >
                <item.icon size={18} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-neutral-800">
            <div className="px-4 py-2 mb-2">
              <p className="text-xs text-neutral-500">Signed in as</p>
              <p className="text-sm text-neutral-300 truncate">{userEmail}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="lg:pl-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
