"use client"

import { useTransition } from "react"

export function NavigationLoader() {
  const [pending] = useTransition()

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[9999] h-0.5 bg-primary-500 transition-opacity duration-300 ${
        pending ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="h-full bg-primary-600 animate-pulse" style={{ width: "30%" }} />
    </div>
  )
}
