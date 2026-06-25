"use client"

import { useState } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"

interface ChartData {
  month: string
  income: number
  expense: number
}

const defaultData: ChartData[] = []

function formatRupiah(v: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v)
}

export default function ChartWidget({ data = defaultData }: { data?: ChartData[] }) {
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all")
  const [hovered, setHovered] = useState<{ month: string; income: number; expense: number } | null>(null)
  const maxVal = data.length > 0 ? Math.max(...data.flatMap((d) => [d.income, d.expense])) : 0

  const totalIncome = data.reduce((s, d) => s + d.income, 0)
  const totalExpense = data.reduce((s, d) => s + d.expense, 0)

  return (
    <div className="rounded-2xl border border-border/60 bg-white p-5 sm:p-6 shadow-sm animate-[fade-in-up_0.5s_ease-out]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-foreground">Overview Keuangan</h3>
          <p className="text-sm text-muted">6 bulan terakhir</p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {(["all", "income", "expense"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 ${
                filter === k ? "bg-white text-foreground shadow-sm" : "text-muted hover:text-foreground"
              }`}
            >
              {k === "all" ? "Semua" : k === "income" ? "Pemasukan" : "Pengeluaran"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-6 mb-6 pb-5 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[11px] text-muted">Total Pemasukan</p>
            <p className="text-sm font-bold text-foreground">{formatRupiah(totalIncome)}</p>
          </div>
        </div>
        <div className="w-px h-7 bg-border" />
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
            <TrendingDown className="w-3.5 h-3.5 text-red-500" />
          </div>
          <div>
            <p className="text-[11px] text-muted">Total Pengeluaran</p>
            <p className="text-sm font-bold text-foreground">{formatRupiah(totalExpense)}</p>
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-56 sm:h-64 text-sm text-muted">
          Belum ada data transaksi
        </div>
      ) : (
        <div className="relative h-56 sm:h-64">
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="border-t border-gray-100" />
            ))}
          </div>

          <div className="relative h-full flex items-end gap-2 sm:gap-3 pb-6">
            {data.map((d, i) => {
              const ih = maxVal > 0 ? (d.income / maxVal) * 100 : 0
              const eh = maxVal > 0 ? (d.expense / maxVal) * 100 : 0
            return (
              <div
                key={d.month}
                className="flex-1 flex flex-col items-center gap-1 h-full justify-end group"
                onMouseEnter={() => setHovered(d)}
                onMouseLeave={() => setHovered(null)}
              >
                <div className="w-full flex gap-0.5 sm:gap-1 h-[85%] items-end">
                  {(filter === "all" || filter === "income") && (
                    <div
                      className="flex-1 bg-emerald-500 rounded-t-sm min-h-[2px] origin-bottom transition-all duration-200 group-hover:bg-emerald-400 group-hover:shadow-lg"
                      style={{
                        height: `${ih}%`,
                        animation: `bar-grow 0.5s ease-out ${i * 0.08}s forwards`,
                        transformOrigin: "bottom",
                      }}
                    />
                  )}
                  {(filter === "all" || filter === "expense") && (
                    <div
                      className="flex-1 bg-primary-500 rounded-t-sm min-h-[2px] origin-bottom transition-all duration-200 group-hover:bg-primary-400 group-hover:shadow-lg"
                      style={{
                        height: `${eh}%`,
                        animation: `bar-grow 0.5s ease-out ${i * 0.08}s forwards`,
                        transformOrigin: "bottom",
                      }}
                    />
                  )}
                </div>
                <span className="text-xs text-muted">{d.month}</span>

                {hovered?.month === d.month && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-2.5 py-1.5 whitespace-nowrap z-10 shadow-lg animate-[fade-in-up_0.15s_ease-out]">
                    <p>↑ {formatRupiah(d.income)}</p>
                    <p>↓ {formatRupiah(d.expense)}</p>
                  </div>
                )}
              </div>
            )
          })}
          </div>
        </div>
      )}
    </div>
  )
}
