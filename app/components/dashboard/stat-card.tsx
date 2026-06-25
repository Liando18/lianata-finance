import { memo } from "react"
import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react"

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string
  trend: string
  trendUp?: boolean
  iconBg?: string
}

function StatCardBase({ icon: Icon, label, value, trend, trendUp = true, iconBg = "bg-primary-50" }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-border/60 bg-white p-4 sm:p-5 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 min-w-0">
          <p className="text-xs sm:text-sm text-muted font-medium truncate">{label}</p>
          <p className="text-xl sm:text-2xl font-bold text-foreground tracking-tight truncate">{value}</p>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${trendUp ? "text-emerald-700" : "text-red-600"}`}>
              {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trend}
            </span>
            <span className="text-xs text-muted">vs bulan lalu</span>
          </div>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon className="w-5 h-5 text-primary-600" />
        </div>
      </div>
    </div>
  )
}

const StatCard = memo(StatCardBase)
export default StatCard
