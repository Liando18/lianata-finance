"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, FolderTree, ArrowUpRight, ArrowDownRight, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"

interface CategoryFormData {
  id?: number
  name: string
  type: string
  color: string
}

interface Props {
  initialData?: CategoryFormData
  mode: "create" | "edit"
}

const CAT_COLORS = ["#c12a58", "#ef4444", "#f97316", "#f59e0b", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#64748b"]

export default function CategoryForm({ initialData, mode }: Props) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState<CategoryFormData>({
    name: initialData?.name || "",
    type: initialData?.type || "expense",
    color: initialData?.color || "#c12a58",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!form.name.trim()) { setError("Nama kategori wajib diisi"); return }
    setSubmitting(true)

    try {
      const url = mode === "create" ? "/api/categories" : `/api/categories/${initialData?.id}`
      const method = mode === "create" ? "POST" : "PUT"
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      if (!res.ok) { const e = await res.json().catch(() => ({ error: "Gagal menyimpan" })); throw new Error(e.error || "Gagal menyimpan") }
      router.push("/dashboard/categories"); router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally { setSubmitting(false) }
  }

  const isIncome = form.type === "income"

  return (
    <div className="max-w-xl mx-auto space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/categories" className="w-9 h-9 rounded-xl bg-white border border-border/70 flex items-center justify-center hover:bg-gray-50 transition-colors shrink-0 active:scale-95">
          <ArrowLeft className="w-4 h-4 text-muted" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-foreground truncate">{mode === "create" ? "Tambah Kategori" : "Edit Kategori"}</h1>
          <p className="text-xs sm:text-sm text-muted">{mode === "create" ? "Buat kategori baru untuk transaksi" : "Ubah data kategori"}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 shadow-sm flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className={`h-1.5 ${isIncome ? "bg-gradient-to-r from-emerald-400 to-emerald-500" : "bg-gradient-to-r from-red-400 to-red-500"}`} />
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6">
          {/* Preview */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 border border-border/40">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: form.color + "20" }}>
              {isIncome ? <ArrowDownRight className="w-5 h-5" style={{ color: form.color }} /> : <ArrowUpRight className="w-5 h-5" style={{ color: form.color }} />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground truncate">{form.name || "Nama Kategori"}</p>
              <p className="text-xs text-muted">{isIncome ? "Pemasukan" : "Pengeluaran"}</p>
            </div>
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: form.color }} />
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
              <FolderTree className="w-4 h-4 text-muted" />
              Nama Kategori
            </label>
            <input id="name" type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Contoh: Makanan" className="w-full h-11 rounded-xl border border-border/70 bg-white px-3 text-sm text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/15 focus:border-primary-300 transition-all" required />
          </div>

          {/* Type */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-2.5">Tipe Kategori</label>
            <div className="grid grid-cols-2 gap-2">
              {(["expense", "income"] as const).map((t) => {
                const active = form.type === t
                return (
                  <button key={t} type="button" onClick={() => setForm({ ...form, type: t })}
                    className={`py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.97] ${
                      active ? t === "expense"
                        ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md shadow-red-200"
                        : "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-200"
                      : "bg-gray-100 text-muted hover:bg-gray-200"
                    }`}
                  >
                    {t === "expense" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {t === "expense" ? "Pengeluaran" : "Pemasukan"}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-2.5">Warna</label>
            <div className="flex flex-wrap gap-2.5">
              {CAT_COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                  className={`w-9 h-9 rounded-xl transition-all duration-200 active:scale-90 ${
                    form.color === c ? "ring-2 ring-offset-2 ring-primary-500 scale-110" : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <label className="w-9 h-9 rounded-xl border-2 border-dashed border-border/70 flex items-center justify-center cursor-pointer hover:border-primary-300 transition-colors">
                <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="w-0 h-0 opacity-0 absolute" />
                <span className="text-xs text-muted">+</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-4 border-t border-border/40">
            <Link href="/dashboard/categories" className="h-11 px-5 rounded-xl text-sm font-medium text-muted hover:text-foreground border border-border/70 hover:bg-gray-50 transition-all flex items-center justify-center w-full sm:w-auto">Batal</Link>
            <button type="submit" disabled={submitting}
              className={`h-11 px-6 rounded-xl text-sm font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.97] ${
                mode === "edit" ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700" : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
              } disabled:opacity-50 w-full sm:w-auto`}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {mode === "create" ? "Simpan Kategori" : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
