"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Search, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownRight, Loader2, Pencil, Trash2, Eye, Filter } from "lucide-react"

interface Transaction {
  id: number
  amount: string
  type: "income" | "expense"
  description: string | null
  date: string
  categoryName: string | null
  categoryIcon: string | null
  categoryColor: string | null
  walletName: string | null
}

function fmt(v: string | number) {
  const n = typeof v === "string" ? Number.parseFloat(v) : v
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
}

function getMonthKey(d: string) {
  const dt = new Date(d)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`
}

function getMonthLabel(d: string) {
  const dt = new Date(d)
  return dt.toLocaleDateString("id-ID", { month: "long", year: "numeric" })
}

export default function TransactionsPage() {
  const router = useRouter()
  const [data, setData] = useState<Transaction[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all")
  const [deleting, setDeleting] = useState<number | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: "20" })
    if (filterType !== "all") params.set("type", filterType)
    if (search.trim()) params.set("q", search.trim())

    try {
      const res = await fetch(`/api/transactions?${params}`)
      const json = await res.json()
      setData(json.data || [])
      setTotal(json.total || 0)
      setTotalPages(json.totalPages || 1)
    } catch {
      setData([])
    } finally {
      setLoading(false)
    }
  }, [page, filterType, search])

  useEffect(() => { fetchData() }, [fetchData])

  function handleDelete(id: number) {
    if (!confirm("Yakin ingin menghapus transaksi ini?")) return
    setDeleting(id)
    fetch(`/api/transactions/${id}`, { method: "DELETE" })
      .then((r) => r.json())
      .then(() => {
        fetchData()
        router.refresh()
      })
      .finally(() => setDeleting(null))
  }

  const grouped: Record<string, Transaction[]> = {}
  for (const tx of data) {
    const key = getMonthKey(tx.date)
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(tx)
  }

  const filterTabs = [
    { key: "all" as const, label: "Semua" },
    { key: "income" as const, label: "Pemasukan" },
    { key: "expense" as const, label: "Pengeluaran" },
  ]

  const summaryIncome = data.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0)
  const summaryExpense = data.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0)

  return (
    <div className="space-y-4 sm:space-y-5 max-w-full pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-foreground">Transaksi</h1>
          <p className="text-sm text-muted">{total} total transaksi</p>
        </div>
        <Link
          href="/dashboard/transactions/create"
          className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold hover:from-emerald-600 hover:to-emerald-700 shadow-sm hover:shadow-md transition-all duration-200 w-full sm:w-auto active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Tambah Transaksi
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Cari transaksi..."
            className="w-full h-10 pl-10 pr-3 rounded-xl border border-border/70 bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/15 focus:border-primary-300 transition-all"
          />
        </div>
        <div className="flex gap-0.5 bg-gray-100 rounded-xl p-0.5 overflow-x-auto self-start w-full sm:w-auto">
          {filterTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => { setFilterType(t.key); setPage(1) }}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                filterType === t.key
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {data.length > 0 && (
        <div className="flex items-center gap-3 sm:gap-4 px-1">
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Pemasukan <span className="font-semibold text-emerald-600">{fmt(summaryIncome)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            Pengeluaran <span className="font-semibold text-red-500">{fmt(summaryExpense)}</span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {Object.entries(grouped).map(([monthKey, txs]) => (
          <div key={monthKey}>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 px-1">{getMonthLabel(txs[0].date)}</h3>
            <div className="space-y-2">
              {txs.map((tx, i) => {
                const isIncome = tx.type === "income"
                const accentColor = isIncome ? "bg-emerald-500" : "bg-red-500"
                const iconBg = isIncome ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"

                return (
                  <div
                    key={tx.id}
                    className="bg-white rounded-xl border border-border/50 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                    style={{ animation: `fade-in-up 0.3s ease-out ${i * 0.03}s both` }}
                  >
                    <div className="flex">
                      <div className={`w-1 shrink-0 ${accentColor}`} />
                      <div className="flex-1 p-3.5 sm:p-4">
                        <div className="flex items-start sm:items-center gap-3">
                          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg} hidden sm:flex`}>
                            {isIncome ? <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5" /> : <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start sm:items-center justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-foreground truncate">{tx.description || "Transaksi"}</p>
                                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                  <span className="text-xs text-muted">{formatDate(tx.date)}</span>
                                  {tx.walletName && (
                                    <>
                                      <span className="w-1 h-1 rounded-full bg-muted/50" />
                                      <span className="text-xs text-muted">{tx.walletName}</span>
                                    </>
                                  )}
                                  {tx.categoryName && (
                                    <>
                                      <span className="w-1 h-1 rounded-full bg-muted/50 hidden sm:inline-block" />
                                      <span className="hidden sm:inline-flex items-center gap-1 text-xs text-muted">
                                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tx.categoryColor || "#c12a58" }} />
                                        {tx.categoryName}
                                      </span>
                                    </>
                                  )}
                                </div>
                                {tx.categoryName && (
                                  <div className="flex sm:hidden items-center gap-1 mt-1">
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tx.categoryColor || "#c12a58" }} />
                                    <span className="text-xs text-muted">{tx.categoryName}</span>
                                  </div>
                                )}
                              </div>
                              <div className="text-right shrink-0">
                                <p className={`text-sm sm:text-base font-bold ${isIncome ? "text-emerald-600" : "text-red-500"}`}>
                                  {isIncome ? "+" : "-"}{fmt(tx.amount)}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="hidden md:flex items-center gap-1 shrink-0 pl-2 border-l border-border/30 min-h-[40px]">
                            <Link
                              href={`/dashboard/transactions/${tx.id}`}
                              className="w-8 h-8 rounded-lg bg-blue-50/80 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                              title="Detail"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              href={`/dashboard/transactions/${tx.id}/edit`}
                              className="w-8 h-8 rounded-lg bg-amber-50/80 text-amber-600 flex items-center justify-center hover:bg-amber-100 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(tx.id)}
                              disabled={deleting === tx.id}
                              className="w-8 h-8 rounded-lg bg-red-50/80 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors disabled:opacity-50"
                              title="Hapus"
                            >
                              {deleting === tx.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex md:hidden items-center justify-end gap-1 mt-2 pt-2 border-t border-border/20">
                          <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${iconBg} sm:hidden mr-auto`}>
                            {isIncome ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          </div>
                          <Link
                            href={`/dashboard/transactions/${tx.id}`}
                            className="w-7 h-7 rounded-lg bg-blue-50/80 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                            title="Detail"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href={`/dashboard/transactions/${tx.id}/edit`}
                            className="w-7 h-7 rounded-lg bg-amber-50/80 text-amber-600 flex items-center justify-center hover:bg-amber-100 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(tx.id)}
                            disabled={deleting === tx.id}
                            className="w-7 h-7 rounded-lg bg-red-50/80 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors disabled:opacity-50"
                            title="Hapus"
                          >
                            {deleting === tx.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center justify-center h-48 sm:h-64 bg-white rounded-2xl border border-border/50 shadow-sm">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
              <p className="text-xs text-muted">Memuat transaksi...</p>
            </div>
          </div>
        )}

        {!loading && data.length === 0 && (
          <div className="bg-white rounded-2xl border border-border/50 p-8 sm:p-12 text-center shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-muted" />
            </div>
            <p className="text-sm font-medium text-foreground">Belum ada transaksi</p>
            <p className="text-xs text-muted mt-1">Mulai catat pemasukan atau pengeluaran pertama kamu</p>
            <Link
              href="/dashboard/transactions/create"
              className="inline-flex items-center gap-2 mt-4 h-9 px-4 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-all"
            >
              <Plus className="w-4 h-4" />
              Buat transaksi pertama
            </Link>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 pt-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="w-9 h-9 rounded-xl border border-border/70 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-muted" />
          </button>
          <div className="flex gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`min-w-[36px] h-9 rounded-xl text-sm font-medium transition-all ${
                  p === page
                    ? "bg-primary-500 text-white shadow-sm"
                    : "border border-border/70 text-muted hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="w-9 h-9 rounded-xl border border-border/70 flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-muted" />
          </button>
        </div>
      )}
    </div>
  )
}
