"use client"

/* eslint-disable @next/next/no-img-element */

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ArrowRightLeft,
  FolderTree,
  Wallet,
  Target,
  HandCoins,
  RefreshCw,
  BarChart3,
  Settings,
  X,
  Plus,
  LogOut,
  Activity,
  Users,
  Shield,
  UserCog,
  Package,
  ShoppingCart,
  Store,
  Building2,
  FileText,
  Receipt,
  Briefcase,
  Banknote,
  BookOpen,
  CheckCheck,
} from "lucide-react"
import LogoutButton from "./logout-button"
import { cn } from "@/lib/utils"
import { getEffectiveRole, type SessionUser } from "./session-context"

type UserRole = "user" | "admin" | "owner"

interface MenuItem {
  icon: typeof LayoutDashboard
  label: string
  href: string
  roles: UserRole[]
  businessTypes?: string[]
}

const allMenuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", roles: ["user", "admin", "owner"] },
  { icon: ArrowRightLeft, label: "Transaksi", href: "/dashboard/transactions", roles: ["user"] },
  { icon: FolderTree, label: "Kategori", href: "/dashboard/categories", roles: ["user"] },
  { icon: Wallet, label: "Dompet", href: "/dashboard/wallets", roles: ["user"] },
  { icon: Target, label: "Budget", href: "/dashboard/budgets", roles: ["user"] },
  { icon: HandCoins, label: "Hutang & Piutang", href: "/dashboard/debts", roles: ["user"] },
  { icon: RefreshCw, label: "Berulang", href: "/dashboard/recurring", roles: ["user"] },
  { icon: BarChart3, label: "Analisis", href: "/dashboard/analysis", roles: ["user"] },
  { icon: FileText, label: "Laporan", href: "/dashboard/reports", roles: ["user"] },
  { icon: Package, label: "Produk", href: "/dashboard/products", roles: ["user"], businessTypes: ["toko", "perusahaan"] },
  { icon: Store, label: "Stok Barang", href: "/dashboard/stock", roles: ["user"], businessTypes: ["toko", "perusahaan"] },
  { icon: ShoppingCart, label: "POS / Penjualan", href: "/dashboard/pos", roles: ["user"], businessTypes: ["toko", "perusahaan"] },
  { icon: Building2, label: "Usaha", href: "/dashboard/businesses", roles: ["user"], businessTypes: ["umkm", "perusahaan"] },
  { icon: Users, label: "Klien", href: "/dashboard/clients", roles: ["user"], businessTypes: ["umkm", "perusahaan"] },
  { icon: FileText, label: "Invoice", href: "/dashboard/invoices", roles: ["user"], businessTypes: ["umkm", "perusahaan"] },
  { icon: Receipt, label: "Pengeluaran Usaha", href: "/dashboard/business-expenses", roles: ["user"], businessTypes: ["umkm", "perusahaan"] },
  { icon: Briefcase, label: "Karyawan", href: "/dashboard/employees", roles: ["user"], businessTypes: ["perusahaan"] },
  { icon: Banknote, label: "Penggajian", href: "/dashboard/payroll", roles: ["user"], businessTypes: ["perusahaan"] },
  { icon: BookOpen, label: "Pembukuan", href: "/dashboard/accounting", roles: ["user"], businessTypes: ["perusahaan"] },
  { icon: CheckCheck, label: "Persetujuan", href: "/dashboard/approvals", roles: ["user"], businessTypes: ["perusahaan"] },
  { icon: Settings, label: "Pengaturan", href: "/dashboard/settings", roles: ["user", "admin", "owner"] },
  { icon: Activity, label: "Aktivitas", href: "/dashboard/activity", roles: ["admin", "owner"] },
  { icon: Users, label: "Kelola User", href: "/dashboard/users", roles: ["admin", "owner"] },
  { icon: UserCog, label: "Kelola Admin", href: "/dashboard/admins", roles: ["owner"] },
  { icon: Shield, label: "Sistem", href: "/dashboard/system", roles: ["owner"] },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
  user: SessionUser
}

export default function Sidebar({ open, onClose, user }: SidebarProps) {
  const pathname = usePathname()
  const initial = user.name?.charAt(0)?.toUpperCase() || "A"
  const effectiveRole = getEffectiveRole(user.role)
  const businessType = user.businessType || "pribadi"

  const sectionLabels: Record<string, string> = {
    pribadi: "Keuangan Pribadi",
    toko: "Manajemen Toko",
    umkm: "Keuangan UMKM",
    perusahaan: "Keuangan Perusahaan",
    lainnya: "Keuangan",
  }

  const menuItems = allMenuItems.filter((m) => {
    if (!m.roles.includes(effectiveRole)) return false
    if (effectiveRole !== "user") return true
    if (m.businessTypes && !m.businessTypes.includes(businessType)) return false
    return true
  })

  const roleLabel: Record<UserRole, string> = { user: "User", admin: "Admin", owner: "Owner" }
  const roleColors: Record<UserRole, string> = { user: "text-primary-600", admin: "text-amber-600", owner: "text-purple-600" }
  const businessLabels: Record<string, string> = { pribadi: "Pribadi", toko: "Toko", umkm: "UMKM", perusahaan: "Perusahaan" }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-border flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto shadow-2xl lg:shadow-none",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-border shrink-0 bg-gradient-to-r from-primary-50/50 to-transparent">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <img
              src="/logo-lianata-finance.png"
              alt="Lianata Finance"
              width={32}
              height={32}
              className="object-contain"
            />
            <span className="font-semibold text-foreground">Lianata</span>
            <span className="text-[10px] font-medium text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded">v1.0</span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-muted" />
          </button>
        </div>

        {/* Quick Action */}
        {effectiveRole === "user" && (
          <div className="px-3 pt-4 pb-3">
            <button className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium hover:from-primary-600 hover:to-primary-700 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]">
              <Plus className="w-4 h-4" />
              Transaksi Baru
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          <div className="px-3 pt-1 pb-2 text-[11px] font-medium text-muted uppercase tracking-wider">
            {effectiveRole === "user" ? sectionLabels[businessType] || "Menu" : "Menu"}
          </div>
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-gradient-to-r from-primary-50 to-white text-primary-700 border-l-[3px] border-primary-500 pl-[11px] shadow-sm"
                    : "text-muted hover:text-foreground hover:bg-gray-50",
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200",
                    isActive
                      ? "bg-primary-100 text-primary-600 shadow-sm"
                      : "bg-transparent text-muted group-hover:bg-gray-100 group-hover:text-foreground",
                  )}
                >
                  <item.icon className="w-5 h-5" />
                </div>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-border shrink-0 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-r from-gray-50 to-white">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-medium shadow-sm shrink-0">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
              <p className={`text-[11px] font-medium ${roleColors[effectiveRole]}`}>{effectiveRole === "user" ? businessLabels[businessType] || "Pribadi" : roleLabel[effectiveRole]}</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          </div>
          <LogoutButton />
        </div>
      </aside>
    </>
  )
}
