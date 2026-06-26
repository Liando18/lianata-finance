"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Pencil, Trash2, Loader2, ArrowUpRight, ArrowDownRight, Wallet, FolderTree, CalendarDays, FileText } from "lucide-react"

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
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
}

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [tx, setTx] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetch(`/api/transactions/${id}`)
      .then((r) => r.json())
      .then((d) => setTx(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  function handleDelete() {
    if (!confirm("Yakin ingin menghapus transaksi ini?")) return
    setDeleting(true)
    fetch(`/api/transactions/${id}`, { method: "DELETE" })
      .then((r) => r.json())
      .then(() => {
        router.push("/dashboard/transactions")
        router.refresh()
      })
      .catch(() => setDeleting(false))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 sm:h-64 bg-white rounded-2xl border border-border/50 shadow-sm max-w-2xl mx-auto">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
          <p className="text-xs text-muted">Memuat detail...</p>
        </div>
      </div>
    )
  }

  if (!tx) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 sm:py-16 bg-white rounded-2xl border border-border/50 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
          <FileText className="w-6 h-6 text-muted" />
        </div>
        <p className="text-sm font-medium text-foreground">Transaksi tidak ditemukan</p>
        <Link href="/dashboard/transactions" className="text-sm text-primary-600 hover:text-primary-700 mt-2 inline-block font-medium">
          Kembali ke daftar transaksi
        </Link>
      </div>
    )
  }

  const isIncome = tx.type === "income"

  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/transactions"
            className="w-9 h-9 rounded-xl bg-white border border-border/70 flex items-center justify-center hover:bg-gray-50 transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-muted" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-foreground truncate">Detail Transaksi</h1>
            <p className="text-xs sm:text-sm text-muted">#{tx.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/transactions/${tx.id}/edit`}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-semibold hover:from-amber-600 hover:to-amber-700 shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex-1 sm:flex-none"
          >
            <Pencil className="w-4 h-4" />
            <span className="hidden sm:inline">Edit</span>
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold hover:from-red-600 hover:to-red-700 shadow-sm hover:shadow-md transition-all disabled:opacity-50 active:scale-[0.98] flex-1 sm:flex-none"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            <span className="hidden sm:inline">Hapus</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className={`h-1.5 ${isIncome ? "bg-gradient-to-r from-emerald-400 to-emerald-500" : "bg-gradient-to-r from-red-400 to-red-500"}`} />

        <div className="p-5 sm:p-8">
          <div className="text-center pb-6 sm:pb-8 border-b border-border/40">
            <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold mb-4 ${
              isIncome ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            }`}>
              {isIncome ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
              {isIncome ? "Pemasukan" : "Pengeluaran"}
            </div>
            <p className={`text-3xl sm:text-4xl font-black tracking-tight ${isIncome ? "text-emerald-600" : "text-red-500"}`}>
              {isIncome ? "+" : "-"}{fmt(tx.amount)}
            </p>
            {tx.description && (
              <p className="text-base sm:text-lg text-foreground mt-3 font-medium">{tx.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 pt-6 sm:pt-8">
            <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-gray-50/50 border border-border/30">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted font-medium">Dompet</p>
                <p className="text-sm font-semibold text-foreground truncate">{tx.walletName || "-"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-gray-50/50 border border-border/30">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                <FolderTree className="w-5 h-5 text-purple-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted font-medium">Kategori</p>
                <p className="text-sm font-semibold text-foreground truncate">
                  {tx.categoryName ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: tx.categoryColor || "#c12a58" }} />
                      {tx.categoryName}
                    </span>
                  ) : "-"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-gray-50/50 border border-border/30">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <CalendarDays className="w-5 h-5 text-amber-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted font-medium">Tanggal</p>
                <p className="text-sm font-semibold text-foreground truncate">{formatDate(tx.date)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-gray-50/50 border border-border/30">
              <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted font-medium">ID Transaksi</p>
                <p className="text-sm font-semibold text-foreground truncate">#{tx.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
