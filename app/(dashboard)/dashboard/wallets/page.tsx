"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Loader2, Wallet, Landmark, CreditCard, Pencil, Trash2, Eye } from "lucide-react"

interface WalletData {
  id: number
  name: string
  type: string
  balance: string
  color: string | null
}

function fmt(n: string) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(n))
}

const typeConfig: Record<string, { label: string; icon: typeof Wallet; color: string; bg: string }> = {
  cash: { label: "Tunai", icon: Wallet, color: "text-emerald-600", bg: "bg-emerald-50" },
  bank: { label: "Bank", icon: Landmark, color: "text-blue-600", bg: "bg-blue-50" },
  ewallet: { label: "E-Wallet", icon: CreditCard, color: "text-purple-600", bg: "bg-purple-50" },
}

export default function WalletsPage() {
  const router = useRouter()
  const [data, setData] = useState<WalletData[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/wallets"); const json = await res.json()
      setData(Array.isArray(json) ? json : [])
    } catch { setData([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  function handleDelete(id: number) {
    if (!confirm("Yakin ingin menghapus dompet ini?")) return
    setDeleting(id)
    fetch(`/api/wallets/${id}`, { method: "DELETE" }).then(r => r.json()).then(() => { fetchData(); router.refresh() }).finally(() => setDeleting(null))
  }

  const totalBalance = data.reduce((s, w) => s + Number(w.balance), 0)

  if (loading) return (
    <div className="flex items-center justify-center h-48 sm:h-64 bg-white rounded-2xl border border-border/50 shadow-sm">
      <div className="flex flex-col items-center gap-2"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /><p className="text-xs text-muted">Memuat dompet...</p></div>
    </div>
  )

  return (
    <div className="space-y-4 sm:space-y-5 max-w-full pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-foreground">Dompet</h1>
          <p className="text-sm text-muted">{data.length} dompet &middot; Total <span className="font-semibold text-foreground">{fmt(String(totalBalance))}</span></p>
        </div>
        <Link href="/dashboard/wallets/create" className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold hover:from-emerald-600 hover:to-emerald-700 shadow-sm hover:shadow-md transition-all w-full sm:w-auto active:scale-[0.98]">
          <Plus className="w-4 h-4" /> Tambah Dompet
        </Link>
      </div>

      {data.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border/50 p-8 sm:p-12 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Wallet className="w-6 h-6 text-primary-500" />
          </div>
          <p className="text-sm font-semibold text-foreground">Belum ada dompet</p>
          <p className="text-xs text-muted mt-1">Buat dompet untuk mulai melacak keuanganmu</p>
          <Link href="/dashboard/wallets/create" className="inline-flex items-center gap-2 mt-4 h-9 px-4 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-all"><Plus className="w-4 h-4" />Buat Dompet</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {data.map((w, i) => {
            const cfg = typeConfig[w.type] || typeConfig.cash
            const Icon = cfg.icon
            const accentColor = w.color || "#c12a58"
            return (
              <div key={w.id} className="bg-white rounded-2xl border border-border/50 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden" style={{ animation: `fade-in-up 0.3s ease-out ${i * 0.05}s both` }}>
                <div className="h-1" style={{ backgroundColor: accentColor }} />
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: accentColor + "15" }}>
                        <Icon className="w-5 h-5" style={{ color: accentColor }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{w.name}</p>
                        <span className={`inline-block mt-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Link href={`/dashboard/wallets/${w.id}`} className="w-7 h-7 rounded-lg bg-blue-50/80 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"><Eye className="w-3.5 h-3.5" /></Link>
                      <Link href={`/dashboard/wallets/${w.id}/edit`} className="w-7 h-7 rounded-lg bg-amber-50/80 text-amber-600 flex items-center justify-center hover:bg-amber-100 transition-colors"><Pencil className="w-3.5 h-3.5" /></Link>
                      <button onClick={() => handleDelete(w.id)} disabled={deleting === w.id} className="w-7 h-7 rounded-lg bg-red-50/80 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors disabled:opacity-50">{deleting === w.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}</button>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-foreground mt-4">{fmt(w.balance)}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
