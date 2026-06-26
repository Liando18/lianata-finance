"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, RefreshCw, ToggleLeft, ToggleRight } from "lucide-react"
import { CurrencyInput } from "@/app/components/currency-input"

interface Wallet { id: number; name: string }
interface Category { id: number; name: string; type: string }

const freqOptions = [
  { value: "daily", label: "Harian" },
  { value: "weekly", label: "Mingguan" },
  { value: "monthly", label: "Bulanan" },
  { value: "yearly", label: "Tahunan" },
]

export default function EditRecurringPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [wallets, setWallets] = useState<Wallet[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [walletId, setWalletId] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [amount, setAmount] = useState("")
  const [type, setType] = useState<"income" | "expense">("expense")
  const [description, setDescription] = useState("")
  const [frequency, setFrequency] = useState("monthly")
  const [nextDate, setNextDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [active, setActive] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/wallets").then(r => r.json()).then(d => setWallets(Array.isArray(d) ? d : [])),
      fetch("/api/categories").then(r => r.json()).then(d => setCategories(Array.isArray(d) ? d : [])),
      fetch(`/api/recurring/${id}`).then(r => r.json()).then(d => {
        setWalletId(String(d.walletId))
        setCategoryId(d.categoryId ? String(d.categoryId) : "")
        setAmount(d.amount)
        setType(d.type)
        setDescription(d.description || "")
        setFrequency(d.frequency)
        setNextDate(d.nextDate ? d.nextDate.slice(0, 10) : "")
        setEndDate(d.endDate ? d.endDate.slice(0, 10) : "")
        setActive(d.active)
      }),
    ]).finally(() => setLoading(false))
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!walletId || !amount || !frequency || !nextDate) { setError("Dompet, jumlah, frekuensi, dan tanggal berikutnya wajib diisi"); return }
    setSubmitting(true); setError("")
    try {
      const res = await fetch(`/api/recurring/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletId, categoryId: categoryId || null, amount, type, description: description.trim() || null, frequency, nextDate, endDate: endDate || null, active }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error || "Gagal menyimpan"); return }
      router.push(`/dashboard/recurring/${id}`)
      router.refresh()
    } catch { setError("Terjadi kesalahan") }
    finally { setSubmitting(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-48 sm:h-64 bg-white rounded-2xl border border-border/50 shadow-sm max-w-xl mx-auto"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /></div>

  return (
    <div className="max-w-xl mx-auto space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/recurring/${id}`} className="w-9 h-9 rounded-xl bg-white border border-border/70 flex items-center justify-center hover:bg-gray-50 transition-colors shrink-0">
          <ArrowLeft className="w-4 h-4 text-muted" />
        </Link>
        <div><h1 className="text-base sm:text-lg font-bold text-foreground">Edit Transaksi Berulang</h1></div>
      </div>

      <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-amber-400 to-amber-500" />
        <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-5">
          {error && <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600 font-medium">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Tipe</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setType("expense")} className={`flex-1 h-11 px-4 rounded-xl text-sm font-semibold border transition-all ${type === "expense" ? "border-red-300 bg-red-50 text-red-700" : "border-border/70 text-muted hover:border-border"}`}>Pengeluaran</button>
              <button type="button" onClick={() => setType("income")} className={`flex-1 h-11 px-4 rounded-xl text-sm font-semibold border transition-all ${type === "income" ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-border/70 text-muted hover:border-border"}`}>Pemasukan</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Dompet</label>
              <select value={walletId} onChange={e => setWalletId(e.target.value)} required className="w-full h-11 px-3.5 rounded-xl border border-border/70 bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/15 focus:border-primary-300 transition-all appearance-none">
                <option value="">Pilih dompet</option>
                {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Kategori <span className="text-muted font-normal">(opsional)</span></label>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full h-11 px-3.5 rounded-xl border border-border/70 bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/15 focus:border-primary-300 transition-all appearance-none">
                <option value="">Tanpa kategori</option>
                {categories.filter(c => c.type === type).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Jumlah</label>
            <CurrencyInput value={amount} onChange={setAmount} />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Deskripsi <span className="text-muted font-normal">(opsional)</span></label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full h-11 px-3.5 rounded-xl border border-border/70 bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/15 focus:border-primary-300 transition-all" />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Frekuensi</label>
            <div className="flex gap-2 flex-wrap">
              {freqOptions.map(f => (
                <button key={f.value} type="button" onClick={() => setFrequency(f.value)} className={`flex-1 min-w-[80px] h-11 px-3 rounded-xl text-sm font-medium border transition-all ${frequency === f.value ? "border-primary-300 bg-primary-50 text-primary-700" : "border-border/70 text-muted hover:border-border"}`}>{f.label}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Tanggal Berikutnya</label>
              <input type="date" value={nextDate} onChange={e => setNextDate(e.target.value)} className="w-full h-11 px-3.5 rounded-xl border border-border/70 bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/15 focus:border-primary-300 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Tanggal Selesai <span className="text-muted font-normal">(opsional)</span></label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full h-11 px-3.5 rounded-xl border border-border/70 bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/15 focus:border-primary-300 transition-all" />
            </div>
          </div>

          <button type="button" onClick={() => setActive(!active)} className={`w-full h-11 rounded-xl text-sm font-semibold border transition-all flex items-center justify-center gap-2 ${active ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-border/70 text-muted"}`}>
            {active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            {active ? "Aktif" : "Nonaktif"}
          </button>

          <button type="submit" disabled={submitting} className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-semibold hover:from-amber-600 hover:to-amber-700 shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {submitting ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>
      </div>
    </div>
  )
}
