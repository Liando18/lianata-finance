"use client"

import { useState, useCallback } from "react"
import { LogOut, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LogoutButtonProps {
  className?: string
}

export default function LogoutButton({ className }: LogoutButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleLogout = useCallback(() => {
    setLoading(true)
    // Clear Better Auth cookies client-side (reliable, doesn't depend on fetch)
    const cookies = [
      "better-auth.session_token",
      "better-auth.session_data",
      "better-auth.dont_remember",
      "better-auth.account_data",
    ]
    cookies.forEach((name) => {
      document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`
    })
    // Also call server to invalidate session
    fetch("/api/auth/sign-out", { method: "POST" }).catch(() => {})
    // Navigate to login (cache-bust to avoid proxy redirect from stale response)
    window.location.replace("/api/clear-session")
  }, [])

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={cn(
        "flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors rounded-xl",
        className,
      )}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
      Keluar
    </button>
  )
}
