"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { Wallet, TrendingUp, TrendingDown, ArrowRightLeft, Activity, Users, Shield, Loader2, Package, Store, ShoppingCart } from "lucide-react"
import WelcomeBanner from "@/app/components/dashboard/welcome-banner"
import StatCard from "@/app/components/dashboard/stat-card"
import RecentTransactions from "@/app/components/dashboard/recent-transactions"
import { useSession, getEffectiveRole } from "@/app/components/dashboard/session-context"

const ChartWidget = dynamic(() => import("@/app/components/dashboard/chart-widget"), { ssr: true })

const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]

function fmt(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)
}

function fmtNum(n: number) {
  return new Intl.NumberFormat("id-ID").format(n)
}

const tokoQuickLinks = [
  { icon: Package, label: "Produk", href: "/dashboard/products", desc: "Kelola daftar produk", color: "from-indigo-500 to-indigo-600" },
  { icon: Store, label: "Stok Barang", href: "/dashboard/stock", desc: "Pantau stok masuk & keluar", color: "from-emerald-500 to-emerald-600" },
  { icon: ShoppingCart, label: "POS / Penjualan", href: "/dashboard/pos", desc: "Catat penjualan langsung", color: "from-amber-500 to-amber-600" },
]

export default function DashboardPage() {
  const { user } = useSession()
  const effectiveRole = getEffectiveRole(user.role)
  const businessType = user.businessType || "pribadi"
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted" />
      </div>
    )
  }

  const fin = data?.financial as { totalBalance: number; incomeThisMonth: number; expenseThisMonth: number; totalTransactions: number } | undefined
  const adminStats = data?.admin as { activityToday: number; activeUsers: number; totalUsers: number } | undefined

  const baseStats = fin ? [
    { icon: Wallet, label: "Total Saldo", value: fmt(fin.totalBalance), trend: "-", trendUp: true, iconBg: "bg-primary-50" as const },
    { icon: TrendingUp, label: "Pemasukan Bulan Ini", value: fmt(fin.incomeThisMonth), trend: "-", trendUp: true, iconBg: "bg-emerald-50" as const },
    { icon: TrendingDown, label: "Pengeluaran Bulan Ini", value: fmt(fin.expenseThisMonth), trend: "-", trendUp: false, iconBg: "bg-red-50" as const },
    { icon: ArrowRightLeft, label: "Total Transaksi", value: fmtNum(fin.totalTransactions), trend: "-", trendUp: true, iconBg: "bg-blue-50" as const },
  ] : []

  const adminStatCards = adminStats ? [
    { icon: Activity, label: "Aktivitas Hari Ini", value: fmtNum(adminStats.activityToday), trend: "-", trendUp: true, iconBg: "bg-amber-50" as const },
    { icon: Users, label: "Pengguna Aktif", value: fmtNum(adminStats.activeUsers), trend: "-", trendUp: true, iconBg: "bg-purple-50" as const },
    { icon: Users, label: "Total Pengguna", value: fmtNum(adminStats.totalUsers), trend: "-", trendUp: true, iconBg: "bg-blue-50" as const },
  ] : []

  const stats = effectiveRole === "user" ? baseStats
    : effectiveRole === "admin" ? adminStatCards.slice(0, 2)
    : adminStatCards

  let chartData: { month: string; income: number; expense: number }[] = []
  if (data?.chart && Array.isArray(data.chart)) {
    const grouped: Record<string, { income: number; expense: number }> = {}
    for (const row of data.chart as Array<{ month: string; year: string; type: string; total: number }>) {
      const key = `${row.year}-${row.month}`
      if (!grouped[key]) grouped[key] = { income: 0, expense: 0 }
      if (row.type === "income") grouped[key].income += Number(row.total)
      else grouped[key].expense += Number(row.total)
    }
    chartData = Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, val]) => {
        const [, m] = key.split("-")
        return { month: monthNames[Number.parseInt(m) - 1] || `Bulan ${m}`, ...val }
      })
  }

  const recentTx = (data?.recentTransactions || []) as Array<{
    id: number; description: string | null; amount: string; type: "income" | "expense"
    date: string; categoryName: string | null; categoryIcon: string | null
    categoryColor: string | null; walletName: string | null
  }>

  return (
    <div className="space-y-5 sm:space-y-6 max-w-full pb-8">
      <WelcomeBanner />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" style={{ contentVisibility: "auto" }}>
        {stats.map((s, i) => (
          <div key={s.label} style={{ animation: `fade-in-up 0.4s ease-out ${i * 0.1}s both` }}>
            <StatCard {...s} />
          </div>
        ))}
      </div>

      {effectiveRole === "user" && businessType === "toko" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4" style={{ contentVisibility: "auto" }}>
          {tokoQuickLinks.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-2xl border border-border/60 bg-white p-5 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
              style={{ animation: `fade-in-up 0.4s ease-out ${0.4 + i * 0.1}s both` }}
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3 shadow-sm`}>
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-sm font-semibold text-foreground group-hover:text-primary-600 transition-colors">{item.label}</h4>
              <p className="text-xs text-muted mt-0.5">{item.desc}</p>
            </Link>
          ))}
        </div>
      )}

      {(effectiveRole === "user") && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6" style={{ contentVisibility: "auto" }}>
          <div className="lg:col-span-2 min-w-0">
            <ChartWidget data={chartData} />
          </div>
          <div className="min-w-0">
            <RecentTransactions transactions={recentTx} />
          </div>
        </div>
      )}

      {(effectiveRole === "admin" || effectiveRole === "owner") && (
        <div className="rounded-2xl border border-border/60 bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-semibold text-foreground">Panel {effectiveRole === "owner" ? "Owner" : "Admin"}</h3>
          </div>
          <p className="text-xs text-muted">
            {effectiveRole === "owner"
              ? "Akses penuh ke seluruh sistem termasuk kelola pengguna, aktivitas, dan pengaturan sistem."
              : "Akses terbatas untuk memantau aktivitas pengguna dan konten."}
          </p>
        </div>
      )}
    </div>
  )
}
