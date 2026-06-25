"use client"

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Store, ShoppingBag, Building2, Grid3x3, Check, Sparkles, User, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"

const businessTypes = [
  { id: "pribadi", icon: User, label: "Pribadi", desc: "Keuangan pribadi sehari-hari" },
  { id: "umkm", icon: Store, label: "UMKM", desc: "Usaha mikro & kecil" },
  { id: "toko", icon: ShoppingBag, label: "Toko", desc: "Toko retail atau online" },
  { id: "perusahaan", icon: Building2, label: "Perusahaan", desc: "Bisnis & korporasi" },
  { id: "lainnya", icon: Grid3x3, label: "Lainnya", desc: "Kebutuhan lainnya" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [selected, setSelected] = useState("")
  const [loading, setLoading] = useState(false)
  const [sessionLoading, setSessionLoading] = useState(true)

  useEffect(() => {
    fetch("/api/auth/get-session")
      .then((r) => r.json())
      .then((d) => {
        if (d?.user?.name) setName(d.user.name)
        if (d?.user?.businessType) setSelected(d.user.businessType)
      })
      .catch(() => {})
      .finally(() => setSessionLoading(false))
  }, [])

  async function handleSubmit() {
    if (!name.trim() || !selected) return
    setLoading(true)
    try {
      const res = await fetch("/api/auth/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), businessType: selected }),
      })
      if (!res.ok) throw new Error("Gagal menyimpan")
      router.push("/dashboard")
    } catch {
      toast.error("Gagal menyimpan. Coba lagi.")
    } finally {
      setLoading(false)
    }
  }

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100">
        <Loader2 className="w-6 h-6 animate-spin text-muted" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-primary-50 via-white to-primary-100">
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Satu Langkah Lagi!</h2>
          <p className="text-white/70 max-w-sm mx-auto leading-relaxed">
            Lengkapi profil kamu sebelum mulai.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Lengkapi Profil</h1>
            <p className="text-muted mt-1.5 text-sm">Masukkan nama dan pilih tipe akun kamu</p>
          </div>

          <div className="space-y-5">
            <Input
              id="name"
              label="Nama Lengkap"
              type="text"
              placeholder="Nama kamu"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div>
              <p className="text-sm font-medium text-foreground mb-3">Tipe Akun</p>
              <div className="grid grid-cols-2 gap-3">
                {businessTypes.map((bt) => {
                  const sel = selected === bt.id
                  return (
                    <button key={bt.id} type="button" onClick={() => setSelected(bt.id)}
                      className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        sel ? "border-primary-500 bg-primary-50 shadow-sm" : "border-border hover:border-primary-200 hover:bg-gray-50"
                      }`}
                    >
                      {sel && <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${sel ? "bg-primary-500 text-white" : "bg-gray-100 text-muted"}`}>
                        <bt.icon className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">{bt.label}</p>
                      <p className="text-xs text-muted mt-0.5 leading-relaxed">{bt.desc}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <Button className="w-full mt-8" size="lg" disabled={!name.trim() || !selected || loading} onClick={handleSubmit}>
            {loading ? "Menyimpan..." : "Lanjut ke Dashboard"}
          </Button>
        </div>
      </div>
    </div>
  )
}
