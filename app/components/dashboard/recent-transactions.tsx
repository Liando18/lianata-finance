import { ArrowUpRight, ArrowDownRight, ShoppingBag } from "lucide-react"

interface Transaction {
  id: number
  description: string | null
  amount: string
  type: "income" | "expense"
  date: Date | string
  categoryName: string | null
  categoryIcon: string | null
  categoryColor: string | null
  walletName: string | null
}

function fmt(v: string | number) {
  const n = typeof v === "string" ? Number.parseFloat(v) : v
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n)
}

function formatDate(d: Date | string) {
  const dt = typeof d === "string" ? new Date(d) : d
  return dt.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
}

export default function RecentTransactions({ transactions = [] }: { transactions?: Transaction[] }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-white p-5 sm:p-6 shadow-sm animate-[fade-in-up_0.5s_ease-out_0.2s_both]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-foreground">Transaksi Terbaru</h3>
          <p className="text-sm text-muted">5 transaksi terakhir</p>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-sm text-muted">
          Belum ada transaksi
        </div>
      ) : (
        <div className="space-y-0.5">
          {transactions.map((tx, i) => {
            return (
              <div
                key={tx.id}
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors duration-150"
                style={{ animation: `slide-in-left 0.3s ease-out ${0.3 + i * 0.08}s both` }}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center shrink-0"
                  >
                    <ShoppingBag className="w-5 h-5 text-muted" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{tx.description || "Transaksi"}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted mt-0.5">
                      <span className="truncate">{tx.categoryName || "Umum"}</span>
                      <span className="w-0.5 h-0.5 rounded-full bg-muted" />
                      <span className="shrink-0">{formatDate(tx.date)}</span>
                    </div>
                  </div>
                </div>
                <span className={`text-sm font-bold shrink-0 flex items-center gap-0.5 ${tx.type === "income" ? "text-emerald-600" : "text-red-500"}`}>
                  {tx.type === "income" ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                  {tx.type === "income" ? "+" : "-"}{fmt(tx.amount)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
