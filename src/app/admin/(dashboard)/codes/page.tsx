'use client'

import { useEffect, useState, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import {
  Plus,
  Search,
  Download,
  Copy,
  Check,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Loader2,
  X,
} from 'lucide-react'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface AccessCode {
  id: string
  code: string
  pdf_url: string
  customer_type_id: string
  is_active: boolean
  use_count: number
  max_uses: number | null
  expires_at: string | null
  created_at: string
  customer_types: { slug: string; name_es: string } | null
}

interface CustomerType {
  id: string
  slug: string
  name_es: string
}

export default function AdminCodesPage() {
  const [codes, setCodes] = useState<AccessCode[]>([])
  const [customerTypes, setCustomerTypes] = useState<CustomerType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Create form state
  const [newCode, setNewCode] = useState({
    code: '',
    customer_type_id: '',
    pdf_url: '',
    max_uses: '',
    expires_at: '',
  })
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const fetchCodes = useCallback(async () => {
    const { data } = await supabase
      .from('access_codes')
      .select('*, customer_types(slug, name_es)')
      .order('created_at', { ascending: false })

    if (data) {
      setCodes(data as AccessCode[])
    }
  }, [])

  useEffect(() => {
    async function fetchData() {
      // Fetch customer types
      const { data: types } = await supabase
        .from('customer_types')
        .select('id, slug, name_es')
        .order('slug')

      if (types) {
        setCustomerTypes(types)
      }

      // Fetch codes
      await fetchCodes()
      setIsLoading(false)
    }

    fetchData()
  }, [fetchCodes])

  function generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)]
    }
    setNewCode({ ...newCode, code })
  }

  async function handleCreateCode(e: React.FormEvent) {
    e.preventDefault()
    setIsCreating(true)
    setCreateError(null)

    try {
      const { error } = await supabase.from('access_codes').insert({
        code: newCode.code.toUpperCase(),
        customer_type_id: newCode.customer_type_id,
        pdf_url: newCode.pdf_url,
        max_uses: newCode.max_uses ? parseInt(newCode.max_uses) : null,
        expires_at: newCode.expires_at || null,
        is_active: true,
        use_count: 0,
      })

      if (error) {
        if (error.code === '23505') {
          setCreateError('This code already exists')
        } else {
          setCreateError(error.message)
        }
        setIsCreating(false)
        return
      }

      // Reset form and close modal
      setNewCode({
        code: '',
        customer_type_id: '',
        pdf_url: '',
        max_uses: '',
        expires_at: '',
      })
      setShowCreateModal(false)
      await fetchCodes()
    } catch {
      setCreateError('Failed to create code')
    } finally {
      setIsCreating(false)
    }
  }

  async function toggleActive(id: string, currentState: boolean) {
    await supabase
      .from('access_codes')
      .update({ is_active: !currentState })
      .eq('id', id)

    await fetchCodes()
  }

  async function deleteCode(id: string) {
    if (!confirm('Are you sure you want to delete this code?')) return

    await supabase.from('access_codes').delete().eq('id', id)
    await fetchCodes()
  }

  async function copyCode(code: string, id: string) {
    await navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function exportCSV() {
    const headers = ['Code', 'Type', 'Uses', 'Max Uses', 'Active', 'Expires', 'Created']
    const rows = filteredCodes.map((c) => [
      c.code,
      c.customer_types?.slug || '',
      c.use_count.toString(),
      c.max_uses?.toString() || 'Unlimited',
      c.is_active ? 'Yes' : 'No',
      c.expires_at ? new Date(c.expires_at).toLocaleDateString() : 'Never',
      new Date(c.created_at).toLocaleDateString(),
    ])

    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `access-codes-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const filteredCodes = codes.filter((code) => {
    const matchesSearch = code.code.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || code.customer_types?.slug === filterType
    return matchesSearch && matchesType
  })

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

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-neutral-800 rounded" />
        <div className="h-12 bg-neutral-900 rounded-xl" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-neutral-900 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Access Codes</h1>
          <p className="text-neutral-500 mt-1">
            Manage codes for PDF access
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
        >
          <Plus size={18} />
          <span>New Code</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Search codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Types</option>
          {customerTypes.map((type) => (
            <option key={type.id} value={type.slug}>
              {type.name_es}
            </option>
          ))}
        </select>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
        >
          <Download size={18} />
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>

      {/* Codes table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">
                  Code
                </th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">
                  Type
                </th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">
                  Uses
                </th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">
                  Expires
                </th>
                <th className="text-right text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {filteredCodes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                    No codes found
                  </td>
                </tr>
              ) : (
                filteredCodes.map((code) => (
                  <tr key={code.id} className="hover:bg-neutral-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium">{code.code}</span>
                        <button
                          onClick={() => copyCode(code.code, code.id)}
                          className="p-1 text-neutral-500 hover:text-neutral-300 transition-colors"
                        >
                          {copiedId === code.id ? (
                            <Check size={14} className="text-emerald-400" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded border capitalize ${getTypeColor(
                          code.customer_types?.slug
                        )}`}
                      >
                        {code.customer_types?.slug || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {code.use_count}
                      {code.max_uses && (
                        <span className="text-neutral-500">/{code.max_uses}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(code.id, code.is_active)}
                        className={`flex items-center gap-1 text-sm ${
                          code.is_active ? 'text-emerald-400' : 'text-neutral-500'
                        }`}
                      >
                        {code.is_active ? (
                          <>
                            <ToggleRight size={18} />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft size={18} />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-500">
                      {code.expires_at
                        ? new Date(code.expires_at).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => deleteCode(code.id)}
                        className="p-2 text-neutral-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Create Access Code</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCode} className="space-y-4">
              {createError && (
                <div className="p-3 bg-red-950/50 border border-red-900 rounded-lg text-red-400 text-sm">
                  {createError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCode.code}
                    onChange={(e) =>
                      setNewCode({ ...newCode, code: e.target.value.toUpperCase() })
                    }
                    maxLength={6}
                    placeholder="ABC123"
                    required
                    className="flex-1 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 font-mono placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={generateCode}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors text-sm"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Customer Type
                </label>
                <select
                  value={newCode.customer_type_id}
                  onChange={(e) =>
                    setNewCode({ ...newCode, customer_type_id: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select type...</option>
                  {customerTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name_es}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  PDF URL
                </label>
                <input
                  type="url"
                  value={newCode.pdf_url}
                  onChange={(e) => setNewCode({ ...newCode, pdf_url: e.target.value })}
                  placeholder="https://example.com/document.pdf"
                  required
                  className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Max Uses (optional)
                  </label>
                  <input
                    type="number"
                    value={newCode.max_uses}
                    onChange={(e) =>
                      setNewCode({ ...newCode, max_uses: e.target.value })
                    }
                    min="1"
                    placeholder="Unlimited"
                    className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Expires (optional)
                  </label>
                  <input
                    type="date"
                    value={newCode.expires_at}
                    onChange={(e) =>
                      setNewCode({ ...newCode, expires_at: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-neutral-400 hover:text-neutral-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white rounded-lg transition-colors"
                >
                  {isCreating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Code'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
