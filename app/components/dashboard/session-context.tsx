"use client"

import { createContext, useContext } from "react"

export type UserRole = "user" | "admin" | "owner"

export interface SessionUser {
  id: string
  name: string
  email: string
  image?: string | null
  businessType?: string | null
  role?: UserRole | string | null
}

export interface SessionData {
  user: SessionUser
}

export function getEffectiveRole(role: SessionUser["role"]): UserRole {
  if (role === "admin" || role === "owner") return role
  return "user"
}

const SessionContext = createContext<SessionData | null>(null)

export function SessionProvider({ value, children }: { value: SessionData; children: React.ReactNode }) {
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error("useSession must be used within a SessionProvider")
  return ctx
}
