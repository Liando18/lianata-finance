"use client"

import { useEffect, useRef } from "react"
import { Loader2 } from "lucide-react"

export default function LogoutPage() {
  const done = useRef(false)

  useEffect(() => {
    if (done.current) return
    done.current = true

    const names = [
      "better-auth.session_token",
      "better-auth.session_data",
      "better-auth.dont_remember",
    ]

    const paths = ["/", "/dashboard", "/login", "/api/auth"]

    for (const name of names) {
      for (const p of paths) {
        document.cookie = `${name}=; path=${p}; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`
      }
    }

    window.location.replace("/login")
  }, [])

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="flex items-center gap-2 text-sm text-muted">
        <Loader2 className="w-4 h-4 animate-spin" />
        Logging out...
      </div>
    </div>
  )
}
