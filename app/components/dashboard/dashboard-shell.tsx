"use client"

import { useState } from "react"
import Sidebar from "@/app/components/dashboard/sidebar"
import Header from "@/app/components/dashboard/header"
import { SessionProvider, type SessionData } from "./session-context"

interface DashboardShellProps {
  children: React.ReactNode
  session: SessionData
}

export default function DashboardShell({ children, session }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <SessionProvider value={session}>
      <div className="flex h-screen bg-gray-50">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} user={session.user} />
        <div className="flex flex-col flex-1 min-w-0">
          <Header onMenuClick={() => setSidebarOpen(true)} user={session.user} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  )
}
