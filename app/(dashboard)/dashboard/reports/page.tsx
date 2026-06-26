"use client"

import { useEffect, useState, useRef } from "react"
import {
  Loader2, Printer, CalendarDays, ArrowUpRight, ArrowDownRight,
  FileText,
} from "lucide-react"

interface Transaction {
  id: number
  amount: string
  type: "income" | "expense"
  description: string | null
  date: string
  categoryName: string | null
  categoryIcon: string | null
  categoryColor: string | null
}

interface ReportData {
  period: string
  startDate: string
  endDate: string
  summary: { totalIncome: number; totalExpense: number; count: number }
  transactions: Transaction[]
}

const PERIODS = [
  { key: "daily", label: "Harian" },
  { key: "monthly", label: "Bulanan" },
  { key: "yearly", label: "Tahunan" },
]

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
]

function fmt(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n)
}




export default function ReportsPage() {
  const [period, setPeriod] = useState("monthly")
  const [date, setDate] = useState(new Date())
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLoading(true)
    const dateStr = date.toISOString().slice(0, 10)
    fetch(`/api/reports?period=${period}&date=${dateStr}`)
      .then(r => r.json())
      .then(j => setData(j.error ? null : j))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [period, date])

  const income = data?.summary.totalIncome || 0
  const expense = data?.summary.totalExpense || 0
  const balance = income - expense

  function handlePrint() {
    window.print()
  }

  return (
    <div className="space-y-4 sm:space-y-5 max-w-full pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-foreground">Laporan Keuangan</h1>
          <p className="text-sm text-muted">{data?.transactions.length || 0} transaksi dalam periode ini</p>
        </div>
        <button
          onClick={handlePrint}
          className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold hover:from-primary-600 hover:to-primary-700 shadow-sm hover:shadow-md transition-all w-full sm:w-auto active:scale-[0.98]"
        >
          <Printer className="w-4 h-4" /> Cetak
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit no-print">
        {PERIODS.map(p => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period === p.key ? "bg-white text-foreground shadow-sm" : "text-muted hover:text-foreground"}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Period input */}
      <div className="no-print">
        {period === "daily" ? (
          <input type="date" value={date.toISOString().slice(0, 10)} onChange={e => setDate(new Date(e.target.value + "T00:00:00"))} className="h-10 px-3 rounded-xl border border-border/70 bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/15 focus:border-primary-300" />
        ) : period === "monthly" ? (
          <div className="flex items-center gap-2">
            <select value={date.getMonth()} onChange={e => { const d = new Date(date); d.setMonth(Number(e.target.value)); setDate(d) }} className="h-10 px-3 rounded-xl border border-border/70 bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/15 focus:border-primary-300">
              {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
            <select value={date.getFullYear()} onChange={e => { const d = new Date(date); d.setFullYear(Number(e.target.value)); setDate(d) }} className="h-10 px-3 rounded-xl border border-border/70 bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/15 focus:border-primary-300">
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        ) : (
          <select value={date.getFullYear()} onChange={e => { const d = new Date(date); d.setFullYear(Number(e.target.value)); setDate(d) }} className="h-10 px-3 rounded-xl border border-border/70 bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/15 focus:border-primary-300">
            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 bg-white rounded-2xl border border-border/50 shadow-sm">
          <div className="flex flex-col items-center gap-2"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /><p className="text-xs text-muted">Memuat laporan...</p></div>
        </div>
      ) : !data || data.transactions.length === 0 ? (
        <div className="flex items-center justify-center h-48 bg-white rounded-2xl border border-border/50 shadow-sm">
          <div className="flex flex-col items-center gap-3 text-center px-6">
            <FileText className="w-8 h-8 text-gray-300" />
            <p className="text-sm font-medium text-muted">Belum ada transaksi di periode ini</p>
          </div>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="p-4 sm:p-5 bg-white rounded-2xl border border-border/50 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center"><ArrowUpRight className="w-4 h-4 text-emerald-600" /></div>
                <span className="text-xs font-medium text-muted">Pemasukan</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-emerald-600">{fmt(income)}</p>
            </div>
            <div className="p-4 sm:p-5 bg-white rounded-2xl border border-border/50 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center"><ArrowDownRight className="w-4 h-4 text-rose-600" /></div>
                <span className="text-xs font-medium text-muted">Pengeluaran</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-rose-600">{fmt(expense)}</p>
            </div>
            <div className="p-4 sm:p-5 bg-white rounded-2xl border border-border/50 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-primary-100 flex items-center justify-center"><CalendarDays className="w-4 h-4 text-primary-600" /></div>
                <span className="text-xs font-medium text-muted">Saldo</span>
              </div>
              <p className={`text-lg sm:text-xl font-bold ${balance >= 0 ? "text-emerald-600" : "text-rose-600"}`}>{fmt(balance)}</p>
            </div>
          </div>

          {/* Printable area */}
          <div ref={printRef} className="print-area">
            <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
              {/* Print header */}
              <div className="hidden print:block p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Lianata Finance</h1>
                    <p className="text-sm text-gray-500">Laporan Keuangan {PERIODS.find(p => p.key === period)?.label}</p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>Periode: {new Date(data.startDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                </div>
              </div>

              {/* Transaction list */}
              <div className="divide-y divide-border/40">
                <div className="px-4 sm:px-5 py-3 hidden print:grid print:grid-cols-5 text-[11px] font-semibold text-muted uppercase tracking-wider">
                  <span>Tanggal</span><span>Kategori</span><span>Deskripsi</span><span className="text-right">Jumlah</span><span className="text-right">Tipe</span>
                </div>
                {data.transactions.map(tx => {
                  const amt = Number(tx.amount)
                  const d = new Date(tx.date)
                  const timeLabel = period === "daily"
                    ? d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
                    : d.toLocaleDateString("id-ID", { day: "numeric", month: "short" })
                  return (
                    <div key={tx.id} className="px-4 sm:px-5 py-3.5 flex items-center gap-3 hover:bg-gray-50/50 transition-colors">
                      <div className="hidden sm:flex flex-col items-center w-10 shrink-0">
                        <span className="text-[11px] font-semibold text-foreground">{d.getDate()}</span>
                        <span className="text-[9px] text-muted">{MONTHS[d.getMonth()].slice(0, 3)}</span>
                      </div>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${tx.categoryColor || "#e2e8f0"}20` }}>
                        <span className="text-sm">{tx.categoryIcon || "📄"}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{tx.description || tx.categoryName || "Transaksi"}</p>
                        <p className="text-[11px] text-muted">
                          {tx.categoryName || "Tanpa Kategori"} · {timeLabel}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-bold ${tx.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>
                          {tx.type === "income" ? "+" : "-"}{fmt(amt)}
                        </p>
                        <p className={`text-[10px] font-medium ${tx.type === "income" ? "text-emerald-500" : "text-rose-500"}`}>
                          {tx.type === "income" ? "Pemasukan" : "Pengeluaran"}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Print footer */}
              <div className="hidden print:block p-5 border-t border-gray-200 text-xs text-gray-400 flex items-center justify-between">
                <span>Lianata Finance · lianata.app</span>
                <span>Dicetak: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
