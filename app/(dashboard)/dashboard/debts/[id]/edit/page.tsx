"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, HandCoins, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { CurrencyInput } from "@/app/components/currency-input"

const statusOptions = [
  { value: "active", label: "Aktif" },
  { value: "partial", label: "Sebagian Dibayar" },
  { value: "paid", label: "Lunas" },
]

export default function EditDebtPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [paidAmount, setPaidAmount] = useState("")
  const [type, setType] = useState<"debt" | "receivable">("debt")
  const [status, setStatus] = useState("active")
  const [dueDate, setDueDate] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    fetch(`/api/debts/${id}`).then(r => r.json()).then(d => {
      setName(d.name || "")
      setAmount(d.amount || "")
      setPaidAmount(d.paidAmount || "0")
      setType(d.type)
      setStatus(d.status)
      setDueDate(d.dueDate ? d.dueDate.slice(0, 10) : "")
      setDescription(d.description || "")
    }).finally(() => setLoading(false))
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !amount) { setError("Nama dan jumlah wajib diisi"); return }
    setSubmitting(true); setError("")
    try {
      const res = await fetch(`/api/debts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), amount, paidAmount, type, status, dueDate: dueDate || null, description: description.trim() || null }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error || "Gagal menyimpan"); return }
      router.push(`/dashboard/debts/${id}`)
      router.refresh()
    } catch { setError("Terjadi kesalahan") }
    finally { setSubmitting(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-48 sm:h-64 bg-white rounded-2xl border border-border/50 shadow-sm max-w-xl mx-auto"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /></div>

  return (
    <div className="max-w-xl mx-auto space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/debts/${id}`} className="w-9 h-9 rounded-xl bg-white border border-border/70 flex items-center justify-center hover:bg-gray-50 transition-colors shrink-0">
          <ArrowLeft className="w-4 h-4 text-muted" />
        </Link>
        <div><h1 className="text-base sm:text-lg font-bold text-foreground">Edit Catatan</h1></div>
      </div>

      <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-amber-400 to-amber-500" />
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
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full h-11 px-3.5 rounded-xl border border-border/70 bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/15 focus:border-primary-300 transition-all" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Jumlah</label>
              <CurrencyInput value={amount} onChange={setAmount} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Terbayar</label>
              <CurrencyInput value={paidAmount} onChange={setPaidAmount} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="w-full h-11 px-3.5 rounded-xl border border-border/70 bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/15 focus:border-primary-300 transition-all appearance-none">
              {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Jatuh Tempo <span className="text-muted font-normal">(opsional)</span></label>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full h-11 px-3.5 rounded-xl border border-border/70 bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/15 focus:border-primary-300 transition-all" />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Keterangan <span className="text-muted font-normal">(opsional)</span></label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full px-3.5 py-2.5 rounded-xl border border-border/70 bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/15 focus:border-primary-300 transition-all resize-none" />
          </div>

          <button type="submit" disabled={submitting} className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-semibold hover:from-amber-600 hover:to-amber-700 shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <HandCoins className="w-4 h-4" />}
            {submitting ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>
      </div>
    </div>
  )
}
