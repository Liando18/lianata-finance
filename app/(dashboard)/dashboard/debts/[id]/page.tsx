"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Pencil, Trash2, Loader2, HandCoins, Calendar, ArrowUpRight, ArrowDownRight, AlertCircle } from "lucide-react"

function fmt(n: string | number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(n))
}

function fmtDate(d: string | null) {
  if (!d) return "-"
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: "Aktif", color: "text-red-600", bg: "bg-red-50" },
  partial: { label: "Sebagian", color: "text-amber-600", bg: "bg-amber-50" },
  paid: { label: "Lunas", color: "text-emerald-600", bg: "bg-emerald-50" },
}

export default function DebtDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [debt, setDebt] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetch(`/api/debts/${id}`).then(r => r.json()).then(d => setDebt(d)).catch(() => {}).finally(() => setLoading(false))
  }, [id])

  function handleDelete() {
    if (!confirm("Yakin ingin menghapus ini?")) return
    setDeleting(true)
    fetch(`/api/debts/${id}`, { method: "DELETE" }).then(r => r.json()).then(() => { router.push("/dashboard/debts"); router.refresh() }).catch(() => setDeleting(false))
  }

  if (loading) return (
    <div className="flex items-center justify-center h-48 sm:h-64 bg-white rounded-2xl border border-border/50 shadow-sm max-w-2xl mx-auto">
      <div className="flex flex-col items-center gap-2"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /><p className="text-xs text-muted">Memuat detail...</p></div>
    </div>
  )

  if (!debt) return (
    <div className="max-w-2xl mx-auto text-center py-12 sm:py-16 bg-white rounded-2xl border border-border/50 shadow-sm">
      <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4"><HandCoins className="w-6 h-6 text-muted" /></div>
      <p className="text-sm font-medium text-foreground">Catatan tidak ditemukan</p>
      <Link href="/dashboard/debts" className="text-sm text-primary-600 hover:text-primary-700 mt-2 inline-block font-medium">Kembali</Link>
    </div>
  )

  const isDebt = debt.type === "debt"
  const sc = statusConfig[debt.status] || statusConfig.active
  const remaining = Number(debt.amount) - Number(debt.paidAmount)
  const progress = Number(debt.amount) > 0 ? Math.round((Number(debt.paidAmount) / Number(debt.amount)) * 100) : 0

  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/debts" className="w-9 h-9 rounded-xl bg-white border border-border/70 flex items-center justify-center hover:bg-gray-50 transition-colors shrink-0">
            <ArrowLeft className="w-4 h-4 text-muted" />
          </Link>
          <div className="min-w-0"><h1 className="text-base sm:text-lg font-bold text-foreground truncate">{debt.name}</h1><p className="text-xs sm:text-sm text-muted">#{debt.id}</p></div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/debts/${debt.id}/edit`} className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-semibold hover:from-amber-600 hover:to-amber-700 shadow-sm transition-all active:scale-[0.98] flex-1 sm:flex-none"><Pencil className="w-4 h-4" /><span className="hidden sm:inline">Edit</span></Link>
          <button onClick={handleDelete} disabled={deleting} className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold hover:from-red-600 hover:to-red-700 shadow-sm transition-all disabled:opacity-50 active:scale-[0.98] flex-1 sm:flex-none">
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}<span className="hidden sm:inline">Hapus</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className={`h-1 ${isDebt ? "bg-gradient-to-r from-red-400 to-red-500" : "bg-gradient-to-r from-emerald-400 to-emerald-500"}`} />
        <div className="p-5 sm:p-8">
          <div className="flex items-center gap-4 pb-6 sm:pb-8 border-b border-border/40">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isDebt ? "bg-red-50" : "bg-emerald-50"}`}>
              {isDebt ? <ArrowUpRight className="w-7 h-7 text-red-500" /> : <ArrowDownRight className="w-7 h-7 text-emerald-600" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className={`text-2xl sm:text-3xl font-black ${isDebt ? "text-red-500" : "text-emerald-600"}`}>{fmt(debt.amount)}</p>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-lg ${sc.bg} ${sc.color}`}>{sc.label}</span>
              </div>
              <p className="text-sm text-muted mt-1">{isDebt ? "Hutang" : "Piutang"} · {fmtDate(debt.dueDate)}</p>
            </div>
          </div>

          {debt.status !== "paid" && (
            <div className="pt-6 sm:pt-8">
              <div className="flex items-center justify-between text-xs text-muted mb-2">
                <span>Progress Pembayaran</span>
                <span>{fmt(debt.paidAmount)} dari {fmt(debt.amount)} ({progress}%)</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className={`h-full rounded-full transition-all ${isDebt ? "bg-gradient-to-r from-red-400 to-red-500" : "bg-gradient-to-r from-emerald-400 to-emerald-500"}`} style={{ width: `${Math.min(progress, 100)}%` }} />
              </div>
              <p className="text-xs text-muted mt-2">
                Sisa <span className="font-semibold text-foreground">{fmt(remaining)}</span>
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 pt-6 sm:pt-8">
            <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-gray-50/50 border border-border/30">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0"><HandCoins className="w-5 h-5 text-primary-600" /></div>
              <div className="min-w-0"><p className="text-xs text-muted font-medium">Nama</p><p className="text-sm font-semibold text-foreground truncate">{debt.name}</p></div>
            </div>
            <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-gray-50/50 border border-border/30">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDebt ? "bg-red-100" : "bg-emerald-100"}`}>
                {isDebt ? <ArrowUpRight className="w-5 h-5 text-red-600" /> : <ArrowDownRight className="w-5 h-5 text-emerald-600" />}
              </div>
              <div className="min-w-0"><p className="text-xs text-muted font-medium">Tipe</p><p className="text-sm font-semibold text-foreground truncate">{isDebt ? "Hutang" : "Piutang"}</p></div>
            </div>
            <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-gray-50/50 border border-border/30">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0"><Calendar className="w-5 h-5 text-amber-600" /></div>
              <div className="min-w-0"><p className="text-xs text-muted font-medium">Jatuh Tempo</p><p className="text-sm font-semibold text-foreground truncate">{fmtDate(debt.dueDate)}</p></div>
            </div>
            <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-gray-50/50 border border-border/30">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${sc.bg}`}>
                <AlertCircle className={`w-5 h-5 ${sc.color}`} />
              </div>
              <div className="min-w-0"><p className="text-xs text-muted font-medium">Status</p><p className={`text-sm font-semibold truncate ${sc.color}`}>{sc.label}</p></div>
            </div>
          </div>

          {debt.description && (
            <div className="mt-5 p-4 rounded-xl bg-gray-50/50 border border-border/30">
              <p className="text-xs text-muted font-medium mb-1">Keterangan</p>
              <p className="text-sm text-foreground">{debt.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
