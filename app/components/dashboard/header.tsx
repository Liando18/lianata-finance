"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Bell, Menu, Search, ChevronDown, Settings } from "lucide-react"
import LogoutButton from "./logout-button"
import { getEffectiveRole, type SessionUser } from "./session-context"

interface HeaderProps {
  onMenuClick: () => void
  user: SessionUser
}

interface NotificationItem {
  id: number
  title: string
  desc: string
  time: string
  read: boolean
}

const roleLabel: Record<string, string> = { user: "User", admin: "Admin", owner: "Owner" }
const roleColors: Record<string, string> = { user: "", admin: "text-amber-600", owner: "text-purple-600" }
const businessLabels: Record<string, string> = { pribadi: "Pribadi", toko: "Toko", umkm: "UMKM", perusahaan: "Perusahaan" }

export default function Header({ onMenuClick, user }: HeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [notifLoading, setNotifLoading] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const initial = user.name?.charAt(0)?.toUpperCase() || "A"
  const effectiveRole = getEffectiveRole(user.role)

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  useEffect(() => {
    if (notifOpen && notifications.length === 0 && !notifLoading) {
      setNotifLoading(true)
      fetch("/api/notifications?limit=10")
        .then(r => r.json())
        .then(j => {
          if (Array.isArray(j)) setNotifications(j)
          else if (j.data) setNotifications(j.data)
        })
        .catch(() => {})
        .finally(() => setNotifLoading(false))
    }
  }, [notifOpen, notifications.length, notifLoading])

  function markAllRead() {
    fetch("/api/notifications", { method: "PUT" })
      .then(() => setNotifications(prev => prev.map(n => ({ ...n, read: true }))))
      .catch(() => {})
  }

  return (
    <header className="relative z-10 h-16 border-b border-border/60 bg-white/80 backdrop-blur-xl flex items-center justify-between px-3 sm:px-6 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2.5 rounded-xl hover:bg-gray-100 transition-colors active:bg-gray-200"
          aria-label="Buka menu"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>

        <div className="hidden sm:flex items-center gap-1 text-sm text-muted">
          <span className="hover:text-foreground transition-colors cursor-pointer">Dashboard</span>
        </div>

        <div className="hidden md:flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-gray-50/80 backdrop-blur-sm border border-border text-muted w-56 lg:w-72 focus-within:border-primary-300 focus-within:ring-2 focus-within:ring-primary-500/10 transition-all duration-200">
          <Search className="w-4 h-4 shrink-0" />
          <input
            type="text"
            placeholder="Cari transaksi..."
            className="bg-transparent text-sm text-foreground outline-none w-full placeholder:text-muted"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors active:bg-gray-200"
          >
            <Bell className="w-5 h-5 text-muted" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] rounded-full bg-primary-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white/95 backdrop-blur-xl rounded-2xl border border-border shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">Notifikasi</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-primary-600 hover:text-primary-700 font-medium">Tandai dibaca</button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-5 py-8 text-center text-sm text-muted">Belum ada notifikasi</div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className={`flex items-start gap-3 px-5 py-3.5 ${!n.read ? "bg-primary-50/30" : ""}`}>
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? "bg-primary-500" : "bg-transparent"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{n.title}</p>
                        <p className="text-xs text-muted mt-0.5">{n.desc}</p>
                        <p className="text-[11px] text-muted/60 mt-1">{n.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-border cursor-pointer hover:bg-gray-50 rounded-xl p-1.5 sm:pr-3 transition-colors"
          >
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-foreground leading-tight">{user.name}</p>
              <p className={`text-[11px] leading-tight ${roleColors[effectiveRole] || "text-muted"}`}>
                {effectiveRole === "user" ? businessLabels[user.businessType || ""] || "Pribadi" : roleLabel[effectiveRole]}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-medium shadow-sm shrink-0">
              {initial}
            </div>
            <ChevronDown
              className={`hidden sm:block w-4 h-4 text-muted transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
            />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-2xl border border-border shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-4 border-b border-border">
                <p className="text-sm font-semibold text-foreground">{user.name}</p>
                <p className="text-xs text-muted mt-0.5">{user.email}</p>
                {effectiveRole === "user" && user.businessType && (
                  <span className="inline-block mt-1.5 text-[10px] font-medium text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded">
                    {businessLabels[user.businessType] || user.businessType}
                  </span>
                )}
              </div>
              <div className="py-1">
                <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-gray-50 transition-colors" onClick={() => setProfileOpen(false)}>
                  <Settings className="w-4 h-4 text-muted" />
                  Pengaturan
                </Link>
              </div>
              <div className="border-t border-border py-1">
                <LogoutButton />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
