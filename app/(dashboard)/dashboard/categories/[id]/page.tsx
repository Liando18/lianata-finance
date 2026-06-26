"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Pencil, Trash2, Loader2, FolderTree, ArrowUpRight, ArrowDownRight } from "lucide-react"

interface CategoryData {
  id: number
  name: string
  type: "income" | "expense"
  color: string | null
}

export default function CategoryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [c, setC] = useState<CategoryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetch(`/api/categories/${id}`).then(r => r.json()).then(d => setC(d)).catch(() => {}).finally(() => setLoading(false))
  }, [id])

  function handleDelete() {
    if (!confirm("Yakin ingin menghapus kategori ini?")) return
    setDeleting(true)
    fetch(`/api/categories/${id}`, { method: "DELETE" }).then(r => r.json()).then(() => { router.push("/dashboard/categories"); router.refresh() }).catch(() => setDeleting(false))
  }

  if (loading) return (
    <div className="flex items-center justify-center h-48 sm:h-64 bg-white rounded-2xl border border-border/50 shadow-sm max-w-2xl mx-auto">
      <div className="flex flex-col items-center gap-2"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /><p className="text-xs text-muted">Memuat detail...</p></div>
    </div>
  )

  if (!c) return (
    <div className="max-w-2xl mx-auto text-center py-12 sm:py-16 bg-white rounded-2xl border border-border/50 shadow-sm">
      <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4"><FolderTree className="w-6 h-6 text-muted" /></div>
      <p className="text-sm font-medium text-foreground">Kategori tidak ditemukan</p>
      <Link href="/dashboard/categories" className="text-sm text-primary-600 hover:text-primary-700 mt-2 inline-block font-medium">Kembali</Link>
    </div>
  )

  const isIncome = c.type === "income"
  const color = c.color || "#c12a58"

  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/categories" className="w-9 h-9 rounded-xl bg-white border border-border/70 flex items-center justify-center hover:bg-gray-50 transition-colors shrink-0">
            <ArrowLeft className="w-4 h-4 text-muted" />
          </Link>
          <div className="min-w-0"><h1 className="text-base sm:text-lg font-bold text-foreground truncate">{c.name}</h1><p className="text-xs sm:text-sm text-muted">#{c.id}</p></div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/categories/${c.id}/edit`} className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-semibold hover:from-amber-600 hover:to-amber-700 shadow-sm transition-all active:scale-[0.98] flex-1 sm:flex-none"><Pencil className="w-4 h-4" /><span className="hidden sm:inline">Edit</span></Link>
          <button onClick={handleDelete} disabled={deleting} className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold hover:from-red-600 hover:to-red-700 shadow-sm transition-all disabled:opacity-50 active:scale-[0.98] flex-1 sm:flex-none">
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}<span className="hidden sm:inline">Hapus</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className={`h-1.5 ${isIncome ? "bg-gradient-to-r from-emerald-400 to-emerald-500" : "bg-gradient-to-r from-red-400 to-red-500"}`} />
        <div className="p-5 sm:p-8">
          <div className="flex items-center gap-4 pb-6 sm:pb-8 border-b border-border/40">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: color + "15" }}>
              {isIncome ? <ArrowDownRight className="w-7 h-7" style={{ color }} /> : <ArrowUpRight className="w-7 h-7" style={{ color }} />}
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-foreground">{c.name}</p>
              <span className={`inline-flex items-center gap-1.5 mt-1.5 text-xs font-medium px-2.5 py-1 rounded-lg ${isIncome ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                {isIncome ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                {isIncome ? "Pemasukan" : "Pengeluaran"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 pt-6 sm:pt-8">
            <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-gray-50/50 border border-border/30">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center shrink-0"><FolderTree className="w-5 h-5 text-primary-600" /></div>
              <div className="min-w-0"><p className="text-xs text-muted font-medium">Nama</p><p className="text-sm font-semibold text-foreground truncate">{c.name}</p></div>
            </div>
            <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-gray-50/50 border border-border/30">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: color + "20" }}><div className="w-5 h-5 rounded" style={{ backgroundColor: color }} /></div>
              <div className="min-w-0"><p className="text-xs text-muted font-medium">Warna</p><p className="text-sm font-semibold text-foreground truncate font-mono">{color}</p></div>
            </div>
            <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-gray-50/50 border border-border/30">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0"><FolderTree className="w-5 h-5 text-amber-600" /></div>
              <div className="min-w-0"><p className="text-xs text-muted font-medium">Tipe</p><p className="text-sm font-semibold text-foreground truncate">{isIncome ? "Pemasukan" : "Pengeluaran"}</p></div>
            </div>
            <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-gray-50/50 border border-border/30">
              <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center shrink-0"><FolderTree className="w-5 h-5 text-gray-600" /></div>
              <div className="min-w-0"><p className="text-xs text-muted font-medium">ID</p><p className="text-sm font-semibold text-foreground truncate">#{c.id}</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
