"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Pencil, Trash2, Loader2, Target, Calendar } from "lucide-react"

function fmt(n: string) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(n))
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]

export default function BudgetDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [budget, setBudget] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetch(`/api/budgets/${id}`).then(r => r.json()).then(d => setBudget(d)).catch(() => {}).finally(() => setLoading(false))
  }, [id])

  function handleDelete() {
    if (!confirm("Yakin ingin menghapus budget ini?")) return
    setDeleting(true)
    fetch(`/api/budgets/${id}`, { method: "DELETE" }).then(r => r.json()).then(() => { router.push("/dashboard/budgets"); router.refresh() }).catch(() => setDeleting(false))
  }

  if (loading) return (
    <div className="flex items-center justify-center h-48 sm:h-64 bg-white rounded-2xl border border-border/50 shadow-sm max-w-2xl mx-auto">
      <div className="flex flex-col items-center gap-2"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /><p className="text-xs text-muted">Memuat detail...</p></div>
    </div>
  )

  if (!budget) return (
    <div className="max-w-2xl mx-auto text-center py-12 sm:py-16 bg-white rounded-2xl border border-border/50 shadow-sm">
      <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4"><Target className="w-6 h-6 text-muted" /></div>
      <p className="text-sm font-medium text-foreground">Budget tidak ditemukan</p>
      <Link href="/dashboard/budgets" className="text-sm text-primary-600 hover:text-primary-700 mt-2 inline-block font-medium">Kembali</Link>
    </div>
  )

  const label = budget.period === "yearly" ? `Tahun ${budget.year}` : `${monthNames[(budget.month || 1) - 1]} ${budget.year}`

  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/budgets" className="w-9 h-9 rounded-xl bg-white border border-border/70 flex items-center justify-center hover:bg-gray-50 transition-colors shrink-0">
            <ArrowLeft className="w-4 h-4 text-muted" />
          </Link>
          <div className="min-w-0"><h1 className="text-base sm:text-lg font-bold text-foreground truncate">{budget.categoryName || "Semua Kategori"}</h1><p className="text-xs sm:text-sm text-muted">#{budget.id}</p></div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/budgets/${budget.id}/edit`} className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-semibold hover:from-amber-600 hover:to-amber-700 shadow-sm transition-all active:scale-[0.98] flex-1 sm:flex-none"><Pencil className="w-4 h-4" /><span className="hidden sm:inline">Edit</span></Link>
          <button onClick={handleDelete} disabled={deleting} className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold hover:from-red-600 hover:to-red-700 shadow-sm transition-all disabled:opacity-50 active:scale-[0.98] flex-1 sm:flex-none">
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}<span className="hidden sm:inline">Hapus</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary-400 to-primary-500" />
        <div className="p-5 sm:p-8">
          <div className="flex items-center gap-4 pb-6 sm:pb-8 border-b border-border/40">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center">
              <Target className="w-7 h-7 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-foreground">{fmt(budget.amount)}</p>
              <span className="inline-flex items-center gap-1.5 mt-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700">
                <Calendar className="w-3 h-3" />
                {label}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 pt-6 sm:pt-8">
            <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-gray-50/50 border border-border/30">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0"><Target className="w-5 h-5 text-primary-600" /></div>
              <div className="min-w-0"><p className="text-xs text-muted font-medium">Kategori</p><p className="text-sm font-semibold text-foreground truncate">{budget.categoryName || "Semua Kategori"}</p></div>
            </div>
            <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-gray-50/50 border border-border/30">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0"><Calendar className="w-5 h-5 text-amber-600" /></div>
              <div className="min-w-0"><p className="text-xs text-muted font-medium">Periode</p><p className="text-sm font-semibold text-foreground truncate">{budget.period === "yearly" ? "Tahunan" : "Bulanan"}</p></div>
            </div>
            <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-gray-50/50 border border-border/30">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0"><Target className="w-5 h-5 text-emerald-600" /></div>
              <div className="min-w-0"><p className="text-xs text-muted font-medium">Jumlah</p><p className="text-sm font-semibold text-foreground truncate">{fmt(budget.amount)}</p></div>
            </div>
            <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-gray-50/50 border border-border/30">
              <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center shrink-0"><Calendar className="w-5 h-5 text-gray-600" /></div>
              <div className="min-w-0"><p className="text-xs text-muted font-medium">{budget.period === "yearly" ? "Tahun" : "Bulan"}</p><p className="text-sm font-semibold text-foreground truncate">{label}</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
