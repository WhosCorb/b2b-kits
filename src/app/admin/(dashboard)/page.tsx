'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Key, Users, FileText, TrendingUp, Calendar, Clock } from 'lucide-react'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Stats {
  totalCodes: number
  activeCodes: number
  totalUses: number
  todayUses: number
  weekUses: number
  customerTypes: { slug: string; count: number; uses: number }[]
  recentActivity: {
    code: string
    type: string
    accessed_at: string
    country: string | null
  }[]
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      // Fetch access codes with customer types
      const { data: codes } = await supabase
        .from('access_codes')
        .select('*, customer_types(slug)')

      // Fetch usage logs
      const { data: logs } = await supabase
        .from('code_usage_logs')
        .select('*, access_codes(code, customer_types(slug))')
        .order('accessed_at', { ascending: false })
        .limit(100)

      // Calculate stats
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

      const totalCodes = codes?.length || 0
      const activeCodes = codes?.filter((c) => c.is_active).length || 0
      const totalUses = codes?.reduce((sum, c) => sum + (c.use_count || 0), 0) || 0

      const todayUses = logs?.filter(
        (l) => new Date(l.accessed_at) >= today
      ).length || 0

      const weekUses = logs?.filter(
        (l) => new Date(l.accessed_at) >= weekAgo
      ).length || 0

      // Group by customer type
      const typeStats: Record<string, { count: number; uses: number }> = {}
      codes?.forEach((code) => {
        const slug = (code.customer_types as { slug: string } | null)?.slug || 'unknown'
        if (!typeStats[slug]) {
          typeStats[slug] = { count: 0, uses: 0 }
        }
        typeStats[slug].count++
        typeStats[slug].uses += code.use_count || 0
      })

      const customerTypes = Object.entries(typeStats).map(([slug, data]) => ({
        slug,
        ...data,
      }))

      // Recent activity
      const recentActivity = (logs || []).slice(0, 10).map((log) => ({
        code: (log.access_codes as { code: string; customer_types: { slug: string } | null } | null)?.code || 'Unknown',
        type: (log.access_codes as { code: string; customer_types: { slug: string } | null } | null)?.customer_types?.slug || 'unknown',
        accessed_at: log.accessed_at,
        country: log.country,
      }))

      setStats({
        totalCodes,
        activeCodes,
        totalUses,
        todayUses,
        weekUses,
        customerTypes,
        recentActivity,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  function getTypeColor(type: string) {
    switch (type) {
      case 'startup':
        return 'text-indigo-400'
      case 'legal':
        return 'text-emerald-400'
      case 'corporate':
        return 'text-red-400'
      default:
        return 'text-neutral-400'
    }
  }

  function getTypeBgColor(type: string) {
    switch (type) {
      case 'startup':
        return 'bg-indigo-500/10 border-indigo-500/20'
      case 'legal':
        return 'bg-emerald-500/10 border-emerald-500/20'
      case 'corporate':
        return 'bg-red-500/10 border-red-500/20'
      default:
        return 'bg-neutral-500/10 border-neutral-500/20'
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-neutral-800 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-neutral-900 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-neutral-500 mt-1">Overview of B2B Kits activity</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-neutral-500 text-sm">Total Codes</span>
            <Key size={18} className="text-neutral-600" />
          </div>
          <p className="text-3xl font-bold">{stats?.totalCodes}</p>
          <p className="text-neutral-500 text-sm mt-1">
            {stats?.activeCodes} active
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-neutral-500 text-sm">Total Uses</span>
            <Users size={18} className="text-neutral-600" />
          </div>
          <p className="text-3xl font-bold">{stats?.totalUses}</p>
          <p className="text-neutral-500 text-sm mt-1">All time</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-neutral-500 text-sm">Today</span>
            <Calendar size={18} className="text-neutral-600" />
          </div>
          <p className="text-3xl font-bold">{stats?.todayUses}</p>
          <p className="text-neutral-500 text-sm mt-1">Accesses today</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-neutral-500 text-sm">This Week</span>
            <TrendingUp size={18} className="text-neutral-600" />
          </div>
          <p className="text-3xl font-bold">{stats?.weekUses}</p>
          <p className="text-neutral-500 text-sm mt-1">Last 7 days</p>
        </div>
      </div>

      {/* Customer Types breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">By Customer Type</h2>
          <div className="space-y-4">
            {stats?.customerTypes.map((type) => (
              <div
                key={type.slug}
                className={`p-4 rounded-lg border ${getTypeBgColor(type.slug)}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-medium capitalize ${getTypeColor(type.slug)}`}>
                    {type.slug}
                  </span>
                  <span className="text-neutral-400 text-sm">
                    {type.count} codes
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        type.slug === 'startup'
                          ? 'bg-indigo-500'
                          : type.slug === 'legal'
                          ? 'bg-emerald-500'
                          : 'bg-red-500'
                      }`}
                      style={{
                        width: `${Math.min(100, (type.uses / Math.max(1, stats.totalUses)) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-neutral-400">{type.uses} uses</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <Clock size={18} className="text-neutral-600" />
          </div>
          <div className="space-y-3">
            {stats?.recentActivity.length === 0 ? (
              <p className="text-neutral-500 text-sm py-4 text-center">
                No activity yet
              </p>
            ) : (
              stats?.recentActivity.map((activity, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b border-neutral-800 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        activity.type === 'startup'
                          ? 'bg-indigo-500'
                          : activity.type === 'legal'
                          ? 'bg-emerald-500'
                          : 'bg-red-500'
                      }`}
                    />
                    <div>
                      <p className="font-mono text-sm">{activity.code}</p>
                      <p className="text-neutral-500 text-xs capitalize">
                        {activity.type}
                      </p>
                    </div>
                  </div>
                  <span className="text-neutral-500 text-xs">
                    {formatDate(activity.accessed_at)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
