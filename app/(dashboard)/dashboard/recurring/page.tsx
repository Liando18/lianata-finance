"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Loader2, RefreshCw, Pencil, Trash2, Eye, Calendar, ArrowUpRight, ArrowDownRight, ToggleLeft, ToggleRight } from "lucide-react"

interface RecurringData {
  id: number
  amount: string
  type: "income" | "expense"
  description: string | null
  frequency: string
  nextDate: string
  endDate: string | null
  active: boolean
  walletName: string | null
  categoryName: string | null
  categoryColor: string | null
}

function fmt(n: string) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(n))
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
}

const freqLabels: Record<string, string> = {
  daily: "Harian",
  weekly: "Mingguan",
  monthly: "Bulanan",
  yearly: "Tahunan",
}

export default function RecurringPage() {
  const router = useRouter()
  const [data, setData] = useState<RecurringData[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/recurring"); const json = await res.json()
      setData(Array.isArray(json) ? json : [])
    } catch { setData([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  function handleDelete(id: number) {
    if (!confirm("Yakin ingin menghapus transaksi berulang ini?")) return
    setDeleting(id)
    fetch(`/api/recurring/${id}`, { method: "DELETE" }).then(r => r.json()).then(() => { fetchData(); router.refresh() }).finally(() => setDeleting(null))
  }

  const activeItems = data.filter(r => r.active)
  const inactiveItems = data.filter(r => !r.active)

  if (loading) return (
    <div className="flex items-center justify-center h-48 sm:h-64 bg-white rounded-2xl border border-border/50 shadow-sm">
      <div className="flex flex-col items-center gap-2"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /><p className="text-xs text-muted">Memuat transaksi berulang...</p></div>
    </div>
  )

  return (
    <div className="space-y-4 sm:space-y-5 max-w-full pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-foreground">Transaksi Berulang</h1>
          <p className="text-sm text-muted">{data.length} transaksi berulang</p>
        </div>
        <Link href="/dashboard/recurring/create" className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold hover:from-emerald-600 hover:to-emerald-700 shadow-sm hover:shadow-md transition-all w-full sm:w-auto active:scale-[0.98]">
          <Plus className="w-4 h-4" /> Tambah
        </Link>
      </div>

      {data.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border/50 p-8 sm:p-12 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <RefreshCw className="w-6 h-6 text-primary-500" />
          </div>
          <p className="text-sm font-semibold text-foreground">Belum ada transaksi berulang</p>
          <p className="text-xs text-muted mt-1">Buat transaksi otomatis untuk pengeluaran rutin</p>
          <Link href="/dashboard/recurring/create" className="inline-flex items-center gap-2 mt-4 h-9 px-4 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-all"><Plus className="w-4 h-4" />Buat baru</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {activeItems.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <ToggleRight className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">Aktif</h3>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">{activeItems.length}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeItems.map((r, i) => (
                  <RecurringCard key={r.id} item={r} i={i} onDelete={handleDelete} deleting={deleting} />
                ))}
              </div>
            </section>
          )}

          {inactiveItems.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center">
                  <ToggleLeft className="w-3.5 h-3.5 text-muted" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">Nonaktif</h3>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-muted">{inactiveItems.length}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {inactiveItems.map((r, i) => (
                  <RecurringCard key={r.id} item={r} i={i} onDelete={handleDelete} deleting={deleting} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

function RecurringCard({ item, i, onDelete, deleting }: { item: RecurringData; i: number; onDelete: (id: number) => void; deleting: number | null }) {
  const isIncome = item.type === "income"
  const accentColor = isIncome ? "#10b981" : "#ef4444"
  const gradientFrom = isIncome ? "from-emerald-400" : "from-red-400"
  const gradientTo = isIncome ? "to-emerald-500" : "to-red-500"

  return (
    <div className={`bg-white rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${!item.active ? "opacity-60" : ""}`} style={{ animation: `fade-in-up 0.3s ease-out ${i * 0.04}s both` }}>
      <div className={`h-1 bg-gradient-to-r ${gradientFrom} ${gradientTo}`} />
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${isIncome ? "bg-emerald-50" : "bg-red-50"}`}>
              {isIncome ? <ArrowDownRight className="w-5 h-5 text-emerald-600" /> : <ArrowUpRight className="w-5 h-5 text-red-500" />}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{item.description || "Transaksi Berulang"}</p>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-purple-50 text-purple-700">{freqLabels[item.frequency] || item.frequency}</span>
                {item.walletName && <span className="text-[11px] text-muted">{item.walletName}</span>}
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-1 shrink-0">
            <Link href={`/dashboard/recurring/${item.id}`} className="w-7 h-7 rounded-lg bg-blue-50/80 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"><Eye className="w-3.5 h-3.5" /></Link>
            <Link href={`/dashboard/recurring/${item.id}/edit`} className="w-7 h-7 rounded-lg bg-amber-50/80 text-amber-600 flex items-center justify-center hover:bg-amber-100 transition-colors"><Pencil className="w-3.5 h-3.5" /></Link>
            <button onClick={() => onDelete(item.id)} disabled={deleting === item.id} className="w-7 h-7 rounded-lg bg-red-50/80 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors disabled:opacity-50">{deleting === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}</button>
          </div>
        </div>
        <div className="flex items-end justify-between mt-3">
          <div>
            <p className={`text-lg font-bold ${isIncome ? "text-emerald-600" : "text-red-500"}`}>
              {isIncome ? "+" : "-"}{fmt(item.amount)}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] text-muted">
            <Calendar className="w-3 h-3" />
            {fmtDate(item.nextDate)}
          </span>
        </div>
        <div className="flex md:hidden items-center justify-end gap-1 mt-3 pt-3 border-t border-border/20">
          <Link href={`/dashboard/recurring/${item.id}`} className="w-7 h-7 rounded-lg bg-blue-50/80 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"><Eye className="w-3.5 h-3.5" /></Link>
          <Link href={`/dashboard/recurring/${item.id}/edit`} className="w-7 h-7 rounded-lg bg-amber-50/80 text-amber-600 flex items-center justify-center hover:bg-amber-100 transition-colors"><Pencil className="w-3.5 h-3.5" /></Link>
          <button onClick={() => onDelete(item.id)} disabled={deleting === item.id} className="w-7 h-7 rounded-lg bg-red-50/80 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors disabled:opacity-50">{deleting === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}</button>
        </div>
      </div>
    </div>
  )
}
