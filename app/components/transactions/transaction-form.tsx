"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, Loader2, Wallet, FolderTree, Tag, CalendarDays, FileText,
  ArrowUpRight, ArrowDownRight, Plus, AlertCircle, CheckCircle2,
} from "lucide-react"
import { CurrencyInput } from "@/app/components/currency-input"
import Link from "next/link"

interface Category {
  id: number
  name: string
  type: "income" | "expense"
  icon: string | null
  color: string | null
}

interface WalletData {
  id: number
  name: string
  type: string
  balance: string
}

interface FormData {
  id?: number
  type: "income" | "expense"
  walletId: string
  categoryId: string
  amount: string
  date: string
  description: string
}

interface TransactionFormProps {
  initialData?: FormData
  mode: "create" | "edit"
}

async function safeFetch(url: string): Promise<unknown[]> {
  try {
    const res = await fetch(url)
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

function EmptyState({ icon: Icon, title, description, actionLabel, actionHref }: {
  icon: typeof FolderTree; title: string; description: string; actionLabel: string; actionHref: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-10 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center mb-4 shadow-sm">
        <Icon className="w-6 h-6 text-primary-500" />
      </div>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="text-xs text-muted mt-1 max-w-xs">{description}</p>
      <Link
        href={actionHref}
        className="inline-flex items-center gap-1.5 mt-4 h-9 px-4 rounded-xl bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 shadow-sm hover:shadow-md transition-all active:scale-[0.97]"
      >
        <Plus className="w-3.5 h-3.5" />
        {actionLabel}
      </Link>
    </div>
  )
}

export default function TransactionForm({ initialData, mode }: TransactionFormProps) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [wallets, setWallets] = useState<WalletData[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState<FormData>({
    type: initialData?.type || "expense",
    walletId: initialData?.walletId || "",
    categoryId: initialData?.categoryId || "",
    amount: initialData?.amount || "",
    date: initialData?.date || new Date().toISOString().split("T")[0],
    description: initialData?.description || "",
  })

  useEffect(() => {
    Promise.all([
      safeFetch("/api/categories"),
      safeFetch("/api/wallets"),
    ])
      .then(([cats, wals]) => {
        const catList = cats as Category[]
        const walList = wals as WalletData[]
        setCategories(catList)
        setWallets(walList)
        if (!initialData) {
          if (walList.length > 0) setForm((f) => ({ ...f, walletId: String(walList[0].id) }))
          if (catList.length > 0) {
            const firstMatch = catList.find((c) => c.type === "expense")
            if (firstMatch) setForm((f) => ({ ...f, categoryId: String(firstMatch.id) }))
          }
        }
      })
      .finally(() => setLoading(false))
  }, [initialData])

  const filteredCategories = categories.filter((c) => c.type === form.type)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (wallets.length === 0) {
      setError("Kamu belum punya dompet. Buat dompet dulu ya!")
      return
    }
    if (filteredCategories.length === 0) {
      setError("Kategori untuk tipe ini belum ada. Buat kategori dulu ya!")
      return
    }

    setSubmitting(true)
    try {
      const url = mode === "create" ? "/api/transactions" : `/api/transactions/${initialData?.id}`
      const method = mode === "create" ? "POST" : "PUT"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Gagal menyimpan transaksi" }))
        throw new Error(err.error || "Gagal menyimpan transaksi")
      }

      router.push("/dashboard/transactions")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 sm:h-64 bg-white rounded-2xl border border-border/50 shadow-sm max-w-xl mx-auto">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <Loader2 className="w-7 h-7 animate-spin text-primary-500" />
            <div className="absolute inset-0 animate-ping opacity-20">
              <Loader2 className="w-7 h-7 text-primary-500" />
            </div>
          </div>
          <p className="text-sm text-muted">Menyiapkan form...</p>
        </div>
      </div>
    )
  }

  const isEdit = mode === "edit"
  const noWallets = wallets.length === 0
  const noCategories = categories.length === 0
  const noMatchCategory = !noCategories && filteredCategories.length === 0

  return (
    <div className="max-w-xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/transactions"
          className="w-9 h-9 rounded-xl bg-white border border-border/70 flex items-center justify-center hover:bg-gray-50 transition-colors shrink-0 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-muted" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-foreground truncate">
            {isEdit ? "Edit Transaksi" : "Tambah Transaksi Baru"}
          </h1>
          <p className="text-xs sm:text-sm text-muted">
            {isEdit ? "Ubah data transaksi yang sudah ada" : "Catat pemasukan atau pengeluaran"}
          </p>
        </div>
      </div>

      {/* Onboarding alerts */}
      {noWallets && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <Wallet className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-800">Belum ada dompet</p>
              <p className="text-xs text-amber-700 mt-0.5">Kamu perlu buat dompet dulu sebelum bisa mencatat transaksi.</p>
              <Link
                href="/dashboard/wallets"
                className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-amber-800 bg-amber-100 px-3 py-1.5 rounded-lg hover:bg-amber-200 transition-all"
              >
                <Plus className="w-3 h-3" />
                Buat Dompet
              </Link>
            </div>
          </div>
        </div>
      )}

      {noCategories && (
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
              <FolderTree className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-800">Belum ada kategori</p>
              <p className="text-xs text-blue-700 mt-0.5">Buat kategori dulu biar transaksimu lebih teratur.</p>
              <Link
                href="/dashboard/categories"
                className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-blue-800 bg-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-all"
              >
                <Plus className="w-3 h-3" />
                Buat Kategori
              </Link>
            </div>
          </div>
        </div>
      )}

      {noMatchCategory && !noCategories && (
        <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
              <FolderTree className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-indigo-800">Kategori {form.type === "expense" ? "pengeluaran" : "pemasukan"} belum ada</p>
              <p className="text-xs text-indigo-700 mt-0.5">Buat kategori {form.type === "expense" ? "pengeluaran" : "pemasukan"} dulu ya.</p>
              <Link
                href="/dashboard/categories"
                className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-indigo-800 bg-indigo-100 px-3 py-1.5 rounded-lg hover:bg-indigo-200 transition-all"
              >
                <Plus className="w-3 h-3" />
                Buat Kategori
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className={`h-1.5 ${form.type === "expense" ? "bg-gradient-to-r from-red-400 to-red-500" : "bg-gradient-to-r from-emerald-400 to-emerald-500"}`} />

        {noWallets ? (
          <EmptyState icon={Wallet} title="Dompet belum tersedia" description="Buat dompet terlebih dahulu agar bisa mencatat transaksi" actionLabel="Buat Dompet" actionHref="/dashboard/wallets" />
        ) : noCategories ? (
          <EmptyState icon={FolderTree} title="Kategori belum tersedia" description="Buat kategori terlebih dahulu agar transaksimu lebih teratur" actionLabel="Buat Kategori" actionHref="/dashboard/categories" />
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6">
            {/* Type Toggle */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">Tipe Transaksi</label>
              <div className="grid grid-cols-2 gap-2">
                {(["expense", "income"] as const).map((t) => {
                  const active = form.type === t
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, type: t, categoryId: "" })}
                      className={`relative py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] ${
                        active
                          ? t === "expense"
                            ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md shadow-red-200"
                            : "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-200"
                          : "bg-gray-100 text-muted hover:bg-gray-200"
                      }`}
                    >
                      {t === "expense" ? (
                        <ArrowUpRight className={`w-4 h-4 ${active ? "text-white" : "text-red-400"}`} />
                      ) : (
                        <ArrowDownRight className={`w-4 h-4 ${active ? "text-white" : "text-emerald-400"}`} />
                      )}
                      {t === "expense" ? "Pengeluaran" : "Pemasukan"}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Category + Wallet */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="categoryId" className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
                  <FolderTree className="w-4 h-4 text-muted" />
                  Kategori
                </label>
                <div className="relative">
                  <select
                    id="categoryId"
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    className={`w-full h-11 rounded-xl border bg-white px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/15 focus:border-primary-300 transition-all appearance-none ${
                      filteredCategories.length === 0 ? "border-amber-300 bg-amber-50/30" : "border-border/70"
                    }`}
                    disabled={filteredCategories.length === 0}
                  >
                    {filteredCategories.length === 0 ? (
                      <option value="">Tidak ada kategori</option>
                    ) : (
                      <>
                        <option value="">Pilih kategori</option>
                        {filteredCategories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </>
                    )}
                  </select>
                  {filteredCategories.length === 0 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                    </div>
                  )}
                </div>
                {filteredCategories.length === 0 && (
                  <Link href="/dashboard/categories" className="inline-flex items-center gap-1 mt-1.5 text-xs text-amber-600 hover:text-amber-700 font-medium">
                    <Plus className="w-3 h-3" />
                    Buat kategori {form.type === "expense" ? "pengeluaran" : "pemasukan"}
                  </Link>
                )}
              </div>
              <div>
                <label htmlFor="walletId" className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
                  <Wallet className="w-4 h-4 text-muted" />
                  Dompet
                </label>
                <select
                  id="walletId"
                  value={form.walletId}
                  onChange={(e) => setForm({ ...form, walletId: e.target.value })}
                  className="w-full h-11 rounded-xl border border-border/70 bg-white px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/15 focus:border-primary-300 transition-all appearance-none"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Amount + Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="amount" className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
                  <Tag className="w-4 h-4 text-muted" />
                  Jumlah (Rp)
                </label>
                <CurrencyInput value={form.amount} onChange={v => setForm({ ...form, amount: v })} placeholder="0" />
              </div>
              <div>
                <label htmlFor="date" className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
                  <CalendarDays className="w-4 h-4 text-muted" />
                  Tanggal
                </label>
                <input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full h-11 rounded-xl border border-border/70 bg-white px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/15 focus:border-primary-300 transition-all"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
                <FileText className="w-4 h-4 text-muted" />
                Deskripsi
              </label>
              <textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Contoh: Belanja bulanan di supermarket"
                rows={3}
                className="w-full rounded-xl border border-border/70 bg-white px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/15 focus:border-primary-300 transition-all resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-4 border-t border-border/40">
              <Link
                href="/dashboard/transactions"
                className="h-11 px-5 rounded-xl text-sm font-medium text-muted hover:text-foreground border border-border/70 hover:bg-gray-50 transition-all flex items-center justify-center w-full sm:w-auto"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className={`h-11 px-6 rounded-xl text-sm font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.97] ${
                  isEdit
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                    : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                } disabled:opacity-50 w-full sm:w-auto`}
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {!submitting && <CheckCircle2 className="w-4 h-4" />}
                {isEdit ? "Simpan Perubahan" : "Simpan Transaksi"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
