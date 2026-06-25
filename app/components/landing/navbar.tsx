"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-14 sm:h-16 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl border-b border-border/50 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/logo-lianata-finance.png"
            alt="Lianata Finance"
            width={28}
            height={28}
            className="object-contain sm:w-8 sm:h-8"
          />
          <span
            className={`font-semibold inline text-sm sm:text-base transition-colors duration-300 ${
              scrolled ? "text-foreground" : "text-white"
            }`}
          >
            Lianata
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {["Fitur", "Cara Kerja", "Donasi"].map((item) => {
            const href = item === "Donasi" ? "#pricing" : `#${item.toLowerCase().replace(" ", "-")}`
            return (
              <a
                key={item}
                href={href}
                className={`text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 ${
                  scrolled
                    ? "text-muted hover:text-foreground hover:bg-gray-50"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                {item}
              </a>
            )
          })}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            href="/login"
            className={`text-xs sm:text-sm font-medium transition-colors px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg ${
              scrolled
                ? "text-muted hover:text-foreground hover:bg-gray-50"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className={`text-xs sm:text-sm font-medium rounded-xl px-3.5 sm:px-5 py-1.5 sm:py-2 transition-all duration-300 whitespace-nowrap ${
              scrolled
                ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-sm hover:shadow-md"
                : "bg-white/15 backdrop-blur-sm text-white hover:bg-white/25 border border-white/20"
            }`}
          >
            Daftar
          </Link>
        </div>
      </div>
    </nav>
  )
}