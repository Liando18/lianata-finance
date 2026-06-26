"use client"

import { useEffect, useState } from "react"
import { Sparkles } from "lucide-react"
import { useSession, getEffectiveRole } from "./session-context"

const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]
const months = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
]

const roleGreeting: Record<string, Record<string, string>> = {
  user: {
    pribadi: "Atur keuangan pribadimu dengan cerdas!",
    toko: "Kelola toko dan keuangan dalam satu tempat!",
    umkm: "Kembangkan UMKM-mu dengan pencatatan keuangan yang rapi!",
    perusahaan: "Kelola keuangan perusahaan secara profesional!",
    lainnya: "Atur keuanganmu dengan cerdas!",
  },
  admin: { _: "Pantau aktivitas pengguna dengan seksama." },
  owner: { _: "Kendalikan penuh sistem Lianata." },
}

const badgeDefaults: Record<string, string> = {
  pribadi: "Belum ada tagihan jatuh tempo",
  toko: "Pantau stok dan penjualan",
  umkm: "Kelola proyek dan invoice",
  perusahaan: "Pantau kinerja perusahaan",
}

export default function WelcomeBanner() {
  const { user } = useSession()
  const effectiveRole = getEffectiveRole(user.role)
  const businessType = user.businessType || "pribadi"
  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? "Selamat Pagi" : hour < 17 ? "Selamat Siang" : "Selamat Malam"
  const date = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`
  const [badgeText, setBadgeText] = useState<string>("")

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => {
        if (d?.badge?.text) setBadgeText(d.badge.text)
      })
      .catch(() => {})
  }, [])

  const greetingMsg = effectiveRole === "user"
    ? (roleGreeting.user[businessType] || roleGreeting.user.lainnya)
    : (roleGreeting[effectiveRole]?._ || "")

  const defaultBadge = effectiveRole === "user"
    ? (badgeDefaults[businessType] || badgeDefaults.pribadi)
    : effectiveRole === "admin"
    ? "Memantau aktivitas"
    : "Pengawasan sistem aktif"

  return (
    <div className="rounded-2xl bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 p-5 sm:p-7 animate-[fade-in-up_0.4s_ease-out]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-white/80 text-sm font-medium">{greeting},</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">{user.name}</h1>
          <p className="text-white/60 text-sm">{date}</p>
          <p className="text-white/40 text-xs">{greetingMsg}</p>
        </div>
        {badgeText && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 text-white text-xs font-medium self-start sm:self-auto animate-[pulse-glow_2s_ease-in-out_infinite]">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-300 animate-pulse" />
            {badgeText}
          </div>
        )}
      </div>
    </div>
  )
}
