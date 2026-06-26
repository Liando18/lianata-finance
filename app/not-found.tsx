"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Construction, ArrowLeft, Home, LayoutDashboard, LogIn } from "lucide-react"

export default function NotFound() {
  const router = useRouter()
  const pathname = usePathname()
  const [target, setTarget] = useState({ label: "Beranda", href: "/", icon: Home })

  useEffect(() => {
    if (pathname.startsWith("/dashboard")) {
      setTarget({ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard })
    } else if (["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"].includes(pathname)) {
      setTarget({ label: "Login", href: "/login", icon: LogIn })
    } else {
      setTarget({ label: "Beranda", href: "/", icon: Home })
    }
  }, [pathname])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-primary-500/25"
        >
          <Construction className="w-12 h-12 text-white" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-6xl font-bold text-primary-600 mb-2"
        >
          404
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl font-semibold text-foreground mb-2"
        >
          Halaman Sedang Dikembangkan
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-muted leading-relaxed mb-8"
        >
          Maaf, halaman yang kamu tuju belum tersedia. 
          Tim pengembang sedang bekerja keras untuk menyelesaikannya.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={() => router.push(target.href)}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/25 transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke {target.label}
        </motion.button>
      </motion.div>
    </div>
  )
}
