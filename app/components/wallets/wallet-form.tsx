"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Wallet, Tag, Landmark, CreditCard, CheckCircle2, AlertCircle } from "lucide-react"
import { CurrencyInput } from "@/app/components/currency-input"
import Link from "next/link"

const WALLET_TYPES = [
  { value: "cash", label: "Tunai", icon: Wallet },
  { value: "bank", label: "Bank", icon: Landmark },
  { value: "ewallet", label: "E-Wallet", icon: CreditCard },
] as const

interface WalletFormData {
  id?: number
  name: string
  type: string
  balance: string
  color: string
}

interface Props {
  initialData?: WalletFormData
  mode: "create" | "edit"
}

export default function WalletForm({ initialData, mode }: Props) {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState<WalletFormData>({
    name: initialData?.name || "",
    type: initialData?.type || "cash",
    balance: initialData?.balance || "",
    color: initialData?.color || "#c12a58",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!form.name.trim()) { setError("Nama dompet wajib diisi"); return }
    setSubmitting(true)

    try {
      const url = mode === "create" ? "/api/wallets" : `/api/wallets/${initialData?.id}`
      const method = mode === "create" ? "POST" : "PUT"
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      if (!res.ok) { const e = await res.json().catch(() => ({ error: "Gagal menyimpan" })); throw new Error(e.error || "Gagal menyimpan") }
      router.push("/dashboard/wallets"); router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally { setSubmitting(false) }
  }

  return (
    <div className="max-w-xl mx-auto space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/wallets" className="w-9 h-9 rounded-xl bg-white border border-border/70 flex items-center justify-center hover:bg-gray-50 transition-colors shrink-0 active:scale-95">
          <ArrowLeft className="w-4 h-4 text-muted" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-foreground truncate">{mode === "create" ? "Tambah Dompet" : "Edit Dompet"}</h1>
          <p className="text-xs sm:text-sm text-muted">{mode === "create" ? "Buat dompet baru untuk kelola keuangan" : "Ubah data dompet"}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 shadow-sm flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-primary-400 to-primary-500" />
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6">
          {/* Preview */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50 border border-border/40">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: form.color + "20" }}>
              {(() => { const t = WALLET_TYPES.find(w => w.value === form.type); return t ? <t.icon className="w-5 h-5" style={{ color: form.color }} /> : <Wallet className="w-5 h-5" style={{ color: form.color }} /> })()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground truncate">{form.name || "Nama Dompet"}</p>
              <p className="text-xs text-muted">{form.balance ? `Rp ${Number(form.balance).toLocaleString("id-ID")}` : "0"}</p>
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-lg bg-white border border-border/50 text-muted">
              {WALLET_TYPES.find(w => w.value === form.type)?.label || "Tunai"}
            </span>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
              <Wallet className="w-4 h-4 text-muted" />
              Nama Dompet
            </label>
            <input id="name" type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Contoh: Dompet Utama" className="w-full h-11 rounded-xl border border-border/70 bg-white px-3 text-sm text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/15 focus:border-primary-300 transition-all" required />
          </div>

          {/* Type */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-2.5">
              <Tag className="w-4 h-4 text-muted" />
              Tipe Dompet
            </label>
            <div className="grid grid-cols-3 gap-2">
              {WALLET_TYPES.map((t) => {
                const active = form.type === t.value
                return (
                  <button key={t.value} type="button" onClick={() => setForm({ ...form, type: t.value })}
                    className={`py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex flex-col items-center gap-1.5 active:scale-[0.97] ${
                      active ? "bg-primary-500 text-white shadow-md shadow-primary-200" : "bg-gray-100 text-muted hover:bg-gray-200"
                    }`}
                  >
                    <t.icon className={`w-5 h-5 ${active ? "text-white" : "text-muted"}`} />
                    {t.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Balance + Color */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="balance" className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
                <Tag className="w-4 h-4 text-muted" />
                Saldo Awal (Rp)
              </label>
              <CurrencyInput value={form.balance} onChange={v => setForm({ ...form, balance: v })} placeholder="0" />
            </div>
            <div>
              <label htmlFor="color" className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-1.5">
                Warna
              </label>
              <div className="flex items-center gap-3">
                <input id="color" type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="w-11 h-11 rounded-xl border border-border/70 bg-white cursor-pointer p-1" />
                <span className="text-xs text-muted font-mono">{form.color}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-4 border-t border-border/40">
            <Link href="/dashboard/wallets" className="h-11 px-5 rounded-xl text-sm font-medium text-muted hover:text-foreground border border-border/70 hover:bg-gray-50 transition-all flex items-center justify-center w-full sm:w-auto">Batal</Link>
            <button type="submit" disabled={submitting}
              className={`h-11 px-6 rounded-xl text-sm font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.97] ${
                mode === "edit" ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700" : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
              } disabled:opacity-50 w-full sm:w-auto`}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {mode === "create" ? "Simpan Dompet" : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
