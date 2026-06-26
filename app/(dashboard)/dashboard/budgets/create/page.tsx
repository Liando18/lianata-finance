"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, Target } from "lucide-react"
import { CurrencyInput } from "@/app/components/currency-input"

interface Category {
  id: number
  name: string
  type: string
  color: string | null
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]

export default function CreateBudgetPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCats, setLoadingCats] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [categoryId, setCategoryId] = useState("")
  const [amount, setAmount] = useState("")
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly")
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())

  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(d => setCategories(Array.isArray(d) ? d : [])).catch(() => {}).finally(() => setLoadingCats(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!amount) { setError("Jumlah budget wajib diisi"); return }

    setSubmitting(true); setError("")
    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId: categoryId || null, amount, period, month, year }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error || "Gagal menyimpan"); return }
      router.push("/dashboard/budgets")
      router.refresh()
    } catch { setError("Terjadi kesalahan") }
    finally { setSubmitting(false) }
  }

  return (
    <div className="max-w-xl mx-auto space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/budgets" className="w-9 h-9 rounded-xl bg-white border border-border/70 flex items-center justify-center hover:bg-gray-50 transition-colors shrink-0">
          <ArrowLeft className="w-4 h-4 text-muted" />
        </Link>
        <div><h1 className="text-base sm:text-lg font-bold text-foreground">Tambah Budget</h1><p className="text-xs sm:text-sm text-muted">Buat anggaran baru</p></div>
      </div>

      <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary-400 to-primary-500" />
        <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-5">
          {error && <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600 font-medium">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Kategori <span className="text-muted font-normal">(opsional)</span></label>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full h-11 px-3.5 rounded-xl border border-border/70 bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/15 focus:border-primary-300 transition-all appearance-none">
              <option value="">Semua Kategori</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Jumlah Budget</label>
            <CurrencyInput value={amount} onChange={setAmount} placeholder="0" />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Periode</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setPeriod("monthly")} className={`flex-1 h-11 px-4 rounded-xl text-sm font-medium border transition-all ${period === "monthly" ? "border-primary-300 bg-primary-50 text-primary-700" : "border-border/70 text-muted hover:border-border"}`}>Bulanan</button>
              <button type="button" onClick={() => setPeriod("yearly")} className={`flex-1 h-11 px-4 rounded-xl text-sm font-medium border transition-all ${period === "yearly" ? "border-primary-300 bg-primary-50 text-primary-700" : "border-border/70 text-muted hover:border-border"}`}>Tahunan</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {period === "monthly" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Bulan</label>
                <select value={month} onChange={e => setMonth(Number(e.target.value))} className="w-full h-11 px-3.5 rounded-xl border border-border/70 bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/15 focus:border-primary-300 transition-all">
                  {monthNames.map((name, idx) => <option key={idx + 1} value={idx + 1}>{name}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Tahun</label>
              <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} className="w-full h-11 px-3.5 rounded-xl border border-border/70 bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/15 focus:border-primary-300 transition-all" />
            </div>
          </div>

          <button type="submit" disabled={submitting} className="w-full h-11 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold hover:from-primary-600 hover:to-primary-700 shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
            {submitting ? "Menyimpan..." : "Simpan Budget"}
          </button>
        </form>
      </div>
    </div>
  )
}
