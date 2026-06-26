"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Loader2, Target, Pencil, Trash2, Eye, Calendar, FolderTree } from "lucide-react"

interface BudgetData {
  id: number
  amount: string
  period: "monthly" | "yearly"
  month: number | null
  year: number
  categoryId: number | null
  categoryName: string | null
  categoryColor: string | null
}

function fmt(n: string | number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(n))
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]

function getBudgetLabel(b: BudgetData) {
  if (b.period === "yearly") return `Tahun ${b.year}`
  return `${monthNames[(b.month || 1) - 1]} ${b.year}`
}

export default function BudgetsPage() {
  const router = useRouter()
  const [data, setData] = useState<BudgetData[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/budgets"); const json = await res.json()
      setData(Array.isArray(json) ? json : [])
    } catch { setData([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  function handleDelete(id: number) {
    if (!confirm("Yakin ingin menghapus budget ini?")) return
    setDeleting(id)
    fetch(`/api/budgets/${id}`, { method: "DELETE" }).then(r => r.json()).then(() => { fetchData(); router.refresh() }).finally(() => setDeleting(null))
  }

  const monthlyBudgets = data.filter(b => b.period === "monthly")
  const yearlyBudgets = data.filter(b => b.period === "yearly")

  if (loading) return (
    <div className="flex items-center justify-center h-48 sm:h-64 bg-white rounded-2xl border border-border/50 shadow-sm">
      <div className="flex flex-col items-center gap-2"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /><p className="text-xs text-muted">Memuat budget...</p></div>
    </div>
  )

  return (
    <div className="space-y-4 sm:space-y-5 max-w-full pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-foreground">Budget</h1>
          <p className="text-sm text-muted">{data.length} anggaran</p>
        </div>
        <Link href="/dashboard/budgets/create" className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold hover:from-emerald-600 hover:to-emerald-700 shadow-sm hover:shadow-md transition-all w-full sm:w-auto active:scale-[0.98]">
          <Plus className="w-4 h-4" /> Tambah Budget
        </Link>
      </div>

      {data.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border/50 p-8 sm:p-12 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Target className="w-6 h-6 text-primary-500" />
          </div>
          <p className="text-sm font-semibold text-foreground">Belum ada budget</p>
          <p className="text-xs text-muted mt-1">Buat anggaran untuk mengontrol pengeluaran</p>
          <Link href="/dashboard/budgets/create" className="inline-flex items-center gap-2 mt-4 h-9 px-4 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-all"><Plus className="w-4 h-4" />Buat Budget</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {yearlyBudgets.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">Tahunan</h3>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">{yearlyBudgets.length}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {yearlyBudgets.map((b, i) => (
                  <BudgetCard key={b.id} budget={b} i={i} onDelete={handleDelete} deleting={deleting} />
                ))}
              </div>
            </section>
          )}

          {monthlyBudgets.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">Bulanan</h3>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{monthlyBudgets.length}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {monthlyBudgets.map((b, i) => (
                  <BudgetCard key={b.id} budget={b} i={i} onDelete={handleDelete} deleting={deleting} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

function BudgetCard({ budget, i, onDelete, deleting }: { budget: BudgetData; i: number; onDelete: (id: number) => void; deleting: number | null }) {
  const color = budget.categoryColor || "#c12a58"
  const gradientFrom = budget.period === "yearly" ? "from-amber-400" : "from-blue-400"
  const gradientTo = budget.period === "yearly" ? "to-amber-500" : "to-blue-500"

  return (
    <div className="bg-white rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden" style={{ animation: `fade-in-up 0.3s ease-out ${i * 0.04}s both` }}>
      <div className={`h-1 bg-gradient-to-r ${gradientFrom} ${gradientTo}`} />
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: color + "15" }}>
              <Target className="w-5 h-5" style={{ color }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{budget.categoryName || "Semua Kategori"}</p>
              <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-medium text-muted">
                <Calendar className="w-3 h-3" />
                {getBudgetLabel(budget)}
              </span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-1 shrink-0">
            <Link href={`/dashboard/budgets/${budget.id}`} className="w-7 h-7 rounded-lg bg-blue-50/80 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"><Eye className="w-3.5 h-3.5" /></Link>
            <Link href={`/dashboard/budgets/${budget.id}/edit`} className="w-7 h-7 rounded-lg bg-amber-50/80 text-amber-600 flex items-center justify-center hover:bg-amber-100 transition-colors"><Pencil className="w-3.5 h-3.5" /></Link>
            <button onClick={() => onDelete(budget.id)} disabled={deleting === budget.id} className="w-7 h-7 rounded-lg bg-red-50/80 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors disabled:opacity-50">{deleting === budget.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}</button>
          </div>
        </div>
        <p className="text-xl font-bold text-foreground mt-4">{fmt(budget.amount)}</p>
        <div className="flex md:hidden items-center justify-end gap-1 mt-3 pt-3 border-t border-border/20">
          <Link href={`/dashboard/budgets/${budget.id}`} className="w-7 h-7 rounded-lg bg-blue-50/80 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"><Eye className="w-3.5 h-3.5" /></Link>
          <Link href={`/dashboard/budgets/${budget.id}/edit`} className="w-7 h-7 rounded-lg bg-amber-50/80 text-amber-600 flex items-center justify-center hover:bg-amber-100 transition-colors"><Pencil className="w-3.5 h-3.5" /></Link>
          <button onClick={() => onDelete(budget.id)} disabled={deleting === budget.id} className="w-7 h-7 rounded-lg bg-red-50/80 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors disabled:opacity-50">{deleting === budget.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}</button>
        </div>
      </div>
    </div>
  )
}
