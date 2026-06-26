"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Loader2, FolderTree, ArrowUpRight, ArrowDownRight, Pencil, Trash2, Eye, Tag } from "lucide-react"

interface CategoryData {
  id: number
  name: string
  type: "income" | "expense"
  color: string | null
  icon: string | null
}

export default function CategoriesPage() {
  const router = useRouter()
  const [data, setData] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/categories"); const json = await res.json()
      setData(Array.isArray(json) ? json : [])
    } catch { setData([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  function handleDelete(id: number) {
    if (!confirm("Yakin ingin menghapus kategori ini?")) return
    setDeleting(id)
    fetch(`/api/categories/${id}`, { method: "DELETE" }).then(r => r.json()).then(() => { fetchData(); router.refresh() }).finally(() => setDeleting(null))
  }

  const expenseCats = data.filter(c => c.type === "expense")
  const incomeCats = data.filter(c => c.type === "income")

  if (loading) return (
    <div className="flex items-center justify-center h-48 sm:h-64 bg-white rounded-2xl border border-border/50 shadow-sm">
      <div className="flex flex-col items-center gap-2"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /><p className="text-xs text-muted">Memuat kategori...</p></div>
    </div>
  )

  return (
    <div className="space-y-4 sm:space-y-5 max-w-full pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-foreground">Kategori</h1>
          <p className="text-sm text-muted">{data.length} kategori</p>
        </div>
        <Link href="/dashboard/categories/create" className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold hover:from-emerald-600 hover:to-emerald-700 shadow-sm hover:shadow-md transition-all w-full sm:w-auto active:scale-[0.98]">
          <Plus className="w-4 h-4" /> Tambah Kategori
        </Link>
      </div>

      {data.length > 0 && (
        <div className="flex items-center gap-3 sm:gap-4 px-1">
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            Pengeluaran <span className="font-semibold text-red-500">{expenseCats.length}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Pemasukan <span className="font-semibold text-emerald-600">{incomeCats.length}</span>
          </div>
        </div>
      )}

      {data.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border/50 p-8 sm:p-12 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <FolderTree className="w-6 h-6 text-primary-500" />
          </div>
          <p className="text-sm font-semibold text-foreground">Belum ada kategori</p>
          <p className="text-xs text-muted mt-1">Buat kategori untuk mengelompokkan transaksi</p>
          <Link href="/dashboard/categories/create" className="inline-flex items-center gap-2 mt-4 h-9 px-4 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-all"><Plus className="w-4 h-4" />Buat Kategori</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {expenseCats.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center">
                  <ArrowUpRight className="w-3.5 h-3.5 text-red-500" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">Pengeluaran</h3>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-600">{expenseCats.length}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {expenseCats.map((c, i) => (
                  <CategoryCard key={c.id} cat={c} i={i} onDelete={handleDelete} deleting={deleting} />
                ))}
              </div>
            </section>
          )}

          {incomeCats.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">Pemasukan</h3>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">{incomeCats.length}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {incomeCats.map((c, i) => (
                  <CategoryCard key={c.id} cat={c} i={i} onDelete={handleDelete} deleting={deleting} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

function CategoryCard({ cat, i, onDelete, deleting }: { cat: CategoryData; i: number; onDelete: (id: number) => void; deleting: number | null }) {
  const color = cat.color || "#c12a58"
  const isIncome = cat.type === "income"
  const TypeIcon = isIncome ? ArrowDownRight : ArrowUpRight
  const gradientFrom = isIncome ? "from-emerald-400" : "from-red-400"
  const gradientTo = isIncome ? "to-emerald-500" : "to-red-500"

  return (
    <div
      className="bg-white rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
      style={{ animation: `fade-in-up 0.3s ease-out ${i * 0.04}s both` }}
    >
      <div className={`h-1 bg-gradient-to-r ${gradientFrom} ${gradientTo}`} />
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: color + "15" }}
            >
              <TypeIcon className="w-5 h-5" style={{ color }} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground truncate">{cat.name}</p>
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 border border-white shadow-sm"
                  style={{ backgroundColor: color }}
                />
              </div>
              <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-medium text-muted">
                <Tag className="w-3 h-3" />
                {isIncome ? "Pemasukan" : "Pengeluaran"}
              </span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-1 shrink-0">
            <Link href={`/dashboard/categories/${cat.id}`} className="w-7 h-7 rounded-lg bg-blue-50/80 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"><Eye className="w-3.5 h-3.5" /></Link>
            <Link href={`/dashboard/categories/${cat.id}/edit`} className="w-7 h-7 rounded-lg bg-amber-50/80 text-amber-600 flex items-center justify-center hover:bg-amber-100 transition-colors"><Pencil className="w-3.5 h-3.5" /></Link>
            <button onClick={() => onDelete(cat.id)} disabled={deleting === cat.id} className="w-7 h-7 rounded-lg bg-red-50/80 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors disabled:opacity-50">{deleting === cat.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}</button>
          </div>
        </div>
        <div className="flex md:hidden items-center justify-end gap-1 mt-3 pt-3 border-t border-border/20">
          <Link href={`/dashboard/categories/${cat.id}`} className="w-7 h-7 rounded-lg bg-blue-50/80 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"><Eye className="w-3.5 h-3.5" /></Link>
          <Link href={`/dashboard/categories/${cat.id}/edit`} className="w-7 h-7 rounded-lg bg-amber-50/80 text-amber-600 flex items-center justify-center hover:bg-amber-100 transition-colors"><Pencil className="w-3.5 h-3.5" /></Link>
          <button onClick={() => onDelete(cat.id)} disabled={deleting === cat.id} className="w-7 h-7 rounded-lg bg-red-50/80 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors disabled:opacity-50">{deleting === cat.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}</button>
        </div>
      </div>
    </div>
  )
}
