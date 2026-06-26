"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Loader2, HandCoins, ArrowUpRight, ArrowDownRight, Pencil, Trash2, Eye, Calendar, AlertCircle, Banknote } from "lucide-react"

interface DebtData {
  id: number
  name: string
  amount: string
  paidAmount: string
  type: "debt" | "receivable"
  status: "active" | "partial" | "paid"
  dueDate: string | null
  description: string | null
  createdAt: string
}

function fmt(n: string | number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(n))
}

function fmtDate(d: string | null) {
  if (!d) return "-"
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: "Aktif", color: "text-red-600", bg: "bg-red-50" },
  partial: { label: "Sebagian", color: "text-amber-600", bg: "bg-amber-50" },
  paid: { label: "Lunas", color: "text-emerald-600", bg: "bg-emerald-50" },
}

export default function DebtsPage() {
  const router = useRouter()
  const [data, setData] = useState<DebtData[]>([])
  const [summary, setSummary] = useState({ totalDebt: 0, totalReceivable: 0 })
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [filterType, setFilterType] = useState<"all" | "debt" | "receivable">("all")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "partial" | "paid">("all")

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterType !== "all") params.set("type", filterType)
      if (filterStatus !== "all") params.set("status", filterStatus)
      const res = await fetch(`/api/debts?${params}`); const json = await res.json()
      setData(Array.isArray(json.data) ? json.data : [])
      setSummary(json.summary || { totalDebt: 0, totalReceivable: 0 })
    } catch { setData([]) }
    finally { setLoading(false) }
  }, [filterType, filterStatus])

  useEffect(() => { fetchData() }, [fetchData])

  function handleDelete(id: number) {
    if (!confirm("Yakin ingin menghapus ini?")) return
    setDeleting(id)
    fetch(`/api/debts/${id}`, { method: "DELETE" }).then(r => r.json()).then(() => { fetchData(); router.refresh() }).finally(() => setDeleting(null))
  }

  const debts = data.filter(d => d.type === "debt")
  const receivables = data.filter(d => d.type === "receivable")

  const typeTabs = [
    { key: "all" as const, label: "Semua" },
    { key: "debt" as const, label: "Hutang" },
    { key: "receivable" as const, label: "Piutang" },
  ]
  const statusTabs = [
    { key: "all" as const, label: "Semua" },
    { key: "active" as const, label: "Aktif" },
    { key: "partial" as const, label: "Sebagian" },
    { key: "paid" as const, label: "Lunas" },
  ]

  if (loading) return (
    <div className="flex items-center justify-center h-48 sm:h-64 bg-white rounded-2xl border border-border/50 shadow-sm">
      <div className="flex flex-col items-center gap-2"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /><p className="text-xs text-muted">Memuat data...</p></div>
    </div>
  )

  return (
    <div className="space-y-4 sm:space-y-5 max-w-full pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-foreground">Hutang & Piutang</h1>
          <p className="text-sm text-muted">{data.length} catatan</p>
        </div>
        <Link href="/dashboard/debts/create" className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold hover:from-emerald-600 hover:to-emerald-700 shadow-sm hover:shadow-md transition-all w-full sm:w-auto active:scale-[0.98]">
          <Plus className="w-4 h-4" /> Tambah
        </Link>
      </div>

      {data.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border border-border/50 p-4 sm:p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-muted font-medium">Total Hutang</p>
                <p className="text-lg font-bold text-red-500">{fmt(summary.totalDebt)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-border/50 p-4 sm:p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <ArrowDownRight className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted font-medium">Total Piutang</p>
                <p className="text-lg font-bold text-emerald-600">{fmt(summary.totalReceivable)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex gap-0.5 bg-gray-100 rounded-xl p-0.5 overflow-x-auto self-start w-full sm:w-auto">
          {typeTabs.map((t) => (
            <button key={t.key} onClick={() => setFilterType(t.key)} className={`flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${filterType === t.key ? "bg-white text-foreground shadow-sm" : "text-muted hover:text-foreground"}`}>{t.label}</button>
          ))}
        </div>
        <div className="flex gap-0.5 bg-gray-100 rounded-xl p-0.5 overflow-x-auto self-start w-full sm:w-auto">
          {statusTabs.map((t) => (
            <button key={t.key} onClick={() => setFilterStatus(t.key)} className={`flex-1 sm:flex-none px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${filterStatus === t.key ? "bg-white text-foreground shadow-sm" : "text-muted hover:text-foreground"}`}>{t.label}</button>
          ))}
        </div>
      </div>

      {data.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border/50 p-8 sm:p-12 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <HandCoins className="w-6 h-6 text-primary-500" />
          </div>
          <p className="text-sm font-semibold text-foreground">Belum ada catatan</p>
          <p className="text-xs text-muted mt-1">Catat hutang atau piutang untuk melacak tagihan</p>
          <Link href="/dashboard/debts/create" className="inline-flex items-center gap-2 mt-4 h-9 px-4 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-all"><Plus className="w-4 h-4" />Buat catatan baru</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((d, i) => {
            const isDebt = d.type === "debt"
            const remaining = Number(d.amount) - Number(d.paidAmount)
            const progress = Number(d.amount) > 0 ? Math.round((Number(d.paidAmount) / Number(d.amount)) * 100) : 0
            const sc = statusConfig[d.status] || statusConfig.active

            return (
              <div key={d.id} className="bg-white rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden" style={{ animation: `fade-in-up 0.3s ease-out ${i * 0.03}s both` }}>
                <div className={`h-1 ${isDebt ? "bg-gradient-to-r from-red-400 to-red-500" : "bg-gradient-to-r from-emerald-400 to-emerald-500"}`} />
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isDebt ? "bg-red-50" : "bg-emerald-50"}`}>
                        {isDebt ? <ArrowUpRight className="w-5 h-5 text-red-500" /> : <ArrowDownRight className="w-5 h-5 text-emerald-600" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{d.name}</p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${sc.bg} ${sc.color}`}>{sc.label}</span>
                          {d.dueDate && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-muted">
                              <Calendar className="w-3 h-3" />
                              {fmtDate(d.dueDate)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="hidden md:flex items-center gap-1 shrink-0">
                      <Link href={`/dashboard/debts/${d.id}`} className="w-7 h-7 rounded-lg bg-blue-50/80 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"><Eye className="w-3.5 h-3.5" /></Link>
                      <Link href={`/dashboard/debts/${d.id}/edit`} className="w-7 h-7 rounded-lg bg-amber-50/80 text-amber-600 flex items-center justify-center hover:bg-amber-100 transition-colors"><Pencil className="w-3.5 h-3.5" /></Link>
                      <button onClick={() => handleDelete(d.id)} disabled={deleting === d.id} className="w-7 h-7 rounded-lg bg-red-50/80 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors disabled:opacity-50">{deleting === d.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}</button>
                    </div>
                  </div>

                  <div className="flex items-end justify-between gap-4 mt-3">
                    <div>
                      <p className={`text-lg font-bold ${isDebt ? "text-red-500" : "text-emerald-600"}`}>{fmt(d.amount)}</p>
                      {Number(d.paidAmount) > 0 && (
                        <p className="text-xs text-muted mt-0.5">Terbayar {fmt(d.paidAmount)} · Sisa <span className="font-semibold text-foreground">{fmt(remaining)}</span></p>
                      )}
                    </div>
                  </div>

                  {d.status !== "paid" && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-muted mb-1">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${isDebt ? "bg-gradient-to-r from-red-400 to-red-500" : "bg-gradient-to-r from-emerald-400 to-emerald-500"}`} style={{ width: `${Math.min(progress, 100)}%` }} />
                      </div>
                    </div>
                  )}

                  <div className="flex md:hidden items-center justify-end gap-1 mt-3 pt-3 border-t border-border/20">
                    <Link href={`/dashboard/debts/${d.id}`} className="w-7 h-7 rounded-lg bg-blue-50/80 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"><Eye className="w-3.5 h-3.5" /></Link>
                    <Link href={`/dashboard/debts/${d.id}/edit`} className="w-7 h-7 rounded-lg bg-amber-50/80 text-amber-600 flex items-center justify-center hover:bg-amber-100 transition-colors"><Pencil className="w-3.5 h-3.5" /></Link>
                    <button onClick={() => handleDelete(d.id)} disabled={deleting === d.id} className="w-7 h-7 rounded-lg bg-red-50/80 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors disabled:opacity-50">{deleting === d.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
