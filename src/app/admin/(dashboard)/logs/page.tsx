'use client'

import { useEffect, useState, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Download, ChevronLeft, ChevronRight, Globe, Smartphone, Clock } from 'lucide-react'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface UsageLog {
  id: string
  accessed_at: string
  ip_address: string | null
  user_agent: string | null
  country: string | null
  language: string | null
  access_codes: {
    code: string
    customer_types: { slug: string } | null
  } | null
}

interface CustomerType {
  id: string
  slug: string
  name_es: string
}

const PAGE_SIZE = 20

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<UsageLog[]>([])
  const [customerTypes, setCustomerTypes] = useState<CustomerType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(0)

  // Filters
  const [filterType, setFilterType] = useState<string>('all')
  const [filterDate, setFilterDate] = useState<string>('')

  const fetchLogs = useCallback(async () => {
    setIsLoading(true)

    let query = supabase
      .from('code_usage_logs')
      .select('*, access_codes(code, customer_types(slug))', { count: 'exact' })
      .order('accessed_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (filterDate) {
      const startDate = new Date(filterDate)
      const endDate = new Date(filterDate)
      endDate.setDate(endDate.getDate() + 1)
      query = query
        .gte('accessed_at', startDate.toISOString())
        .lt('accessed_at', endDate.toISOString())
    }

    const { data, count } = await query

    if (data) {
      // Filter by type client-side since it's a nested relation
      const filtered = filterType === 'all'
        ? data
        : data.filter((log) => log.access_codes?.customer_types?.slug === filterType)

      setLogs(filtered as UsageLog[])
      setTotalCount(count || 0)
    }

    setIsLoading(false)
  }, [page, filterDate, filterType])

  useEffect(() => {
    async function fetchTypes() {
      const { data } = await supabase
        .from('customer_types')
        .select('id, slug, name_es')
        .order('slug')

      if (data) {
        setCustomerTypes(data)
      }
    }

    fetchTypes()
  }, [])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date)
  }

  function parseUserAgent(ua: string | null): string {
    if (!ua) return 'Unknown'
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS'
    if (ua.includes('Android')) return 'Android'
    if (ua.includes('Windows')) return 'Windows'
    if (ua.includes('Mac')) return 'macOS'
    if (ua.includes('Linux')) return 'Linux'
    return 'Other'
  }

  function getTypeColor(type: string | undefined) {
    switch (type) {
      case 'startup':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
      case 'legal':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'corporate':
        return 'bg-red-500/10 text-red-400 border-red-500/20'
      default:
        return 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20'
    }
  }

  function exportCSV() {
    const headers = ['Date', 'Code', 'Type', 'IP', 'Device', 'Language', 'Country']
    const rows = logs.map((log) => [
      formatDate(log.accessed_at),
      log.access_codes?.code || 'Unknown',
      log.access_codes?.customer_types?.slug || 'Unknown',
      log.ip_address || '',
      parseUserAgent(log.user_agent),
      log.language || '',
      log.country || '',
    ])

    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `usage-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Usage Logs</h1>
          <p className="text-neutral-500 mt-1">
            Track code access activity
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
        >
          <Download size={18} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <select
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value)
            setPage(0)
          }}
          className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Types</option>
          {customerTypes.map((type) => (
            <option key={type.id} value={type.slug}>
              {type.name_es}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => {
            setFilterDate(e.target.value)
            setPage(0)
          }}
          className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {filterDate && (
          <button
            onClick={() => {
              setFilterDate('')
              setPage(0)
            }}
            className="px-4 py-2 text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            Clear date
          </button>
        )}
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex items-center gap-3">
          <Clock size={20} className="text-neutral-500" />
          <div>
            <p className="text-2xl font-bold">{totalCount}</p>
            <p className="text-xs text-neutral-500">Total accesses</p>
          </div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex items-center gap-3">
          <Globe size={20} className="text-neutral-500" />
          <div>
            <p className="text-2xl font-bold">
              {new Set(logs.map((l) => l.language).filter(Boolean)).size}
            </p>
            <p className="text-xs text-neutral-500">Languages</p>
          </div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex items-center gap-3">
          <Smartphone size={20} className="text-neutral-500" />
          <div>
            <p className="text-2xl font-bold">
              {logs.filter((l) => {
                const ua = l.user_agent || ''
                return ua.includes('iPhone') || ua.includes('Android') || ua.includes('iPad')
              }).length}
            </p>
            <p className="text-xs text-neutral-500">Mobile accesses</p>
          </div>
        </div>
      </div>

      {/* Logs table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">
                  Date
                </th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">
                  Code
                </th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">
                  Type
                </th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">
                  Device
                </th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">
                  Language
                </th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">
                  IP
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
                    <div className="animate-pulse text-neutral-500">Loading...</div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                    No logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-800/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-neutral-300">
                      {formatDate(log.accessed_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm">
                        {log.access_codes?.code || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded border capitalize ${getTypeColor(
                          log.access_codes?.customer_types?.slug
                        )}`}
                      >
                        {log.access_codes?.customer_types?.slug || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-400">
                      {parseUserAgent(log.user_agent)}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-400 uppercase">
                      {log.language || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-500 font-mono">
                      {log.ip_address || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-800">
            <p className="text-sm text-neutral-500">
              Page {page + 1} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="p-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="p-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
