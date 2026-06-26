"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, HandCoins, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { CurrencyInput } from "@/app/components/currency-input"

export default function CreateDebtPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [type, setType] = useState<"debt" | "receivable">("debt")
  const [dueDate, setDueDate] = useState("")
  const [description, setDescription] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !amount) { setError("Nama dan jumlah wajib diisi"); return }

    setSubmitting(true); setError("")
    try {
      const res = await fetch("/api/debts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), amount, type, dueDate: dueDate || null, description: description.trim() || null }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error || "Gagal menyimpan"); return }
      router.push("/dashboard/debts")
      router.refresh()
    } catch { setError("Terjadi kesalahan") }
    finally { setSubmitting(false) }
  }

  return (
    <div className="max-w-xl mx-auto space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/debts" className="w-9 h-9 rounded-xl bg-white border border-border/70 flex items-center justify-center hover:bg-gray-50 transition-colors shrink-0">
          <ArrowLeft className="w-4 h-4 text-muted" />
        </Link>
        <div><h1 className="text-base sm:text-lg font-bold text-foreground">Tambah Catatan</h1><p className="text-xs sm:text-sm text-muted">Hutang atau piutang baru</p></div>
      </div>

      <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary-400 to-primary-500" />
        <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-5">
          {error && <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600 font-medium">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Tipe</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setType("debt")} className={`flex-1 h-11 px-4 rounded-xl text-sm font-semibold border transition-all flex items-center justify-center gap-2 ${type === "debt" ? "border-red-300 bg-red-50 text-red-700" : "border-border/70 text-muted hover:border-border"}`}>
                <ArrowUpRight className="w-4 h-4" /> Hutang
              </button>
              <button type="button" onClick={() => setType("receivable")} className={`flex-1 h-11 px-4 rounded-xl text-sm font-semibold border transition-all flex items-center justify-center gap-2 ${type === "receivable" ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-border/70 text-muted hover:border-border"}`}>
                <ArrowDownRight className="w-4 h-4" /> Piutang
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Nama</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Mis: Pinjaman Budi" className="w-full h-11 px-3.5 rounded-xl border border-border/70 bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/15 focus:border-primary-300 transition-all" />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Jumlah</label>
            <CurrencyInput value={amount} onChange={setAmount} placeholder="0" />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Jatuh Tempo <span className="text-muted font-normal">(opsional)</span></label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full h-11 px-3.5 rounded-xl border border-border/70 bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/15 focus:border-primary-300 transition-all" />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Keterangan <span className="text-muted font-normal">(opsional)</span></label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full px-3.5 py-2.5 rounded-xl border border-border/70 bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/15 focus:border-primary-300 transition-all resize-none" />
          </div>

          <button type="submit" disabled={submitting} className="w-full h-11 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold hover:from-primary-600 hover:to-primary-700 shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <HandCoins className="w-4 h-4" />}
            {submitting ? "Menyimpan..." : "Simpan"}
          </button>
        </form>
      </div>
    </div>
  )
}
