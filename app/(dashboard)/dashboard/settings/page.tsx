"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Loader2, User, Building2, Mail, Save, CheckCircle2, AlertCircle,
  Lock, Eye, EyeOff,
} from "lucide-react"

interface SettingsData {
  id: string
  name: string
  email: string
  businessType: string
  role: string
  legacyUserId: number | null
  hasPassword: boolean
}

const BUSINESS_TYPES = [
  { value: "pribadi", label: "Pribadi", desc: "Keuangan personal harian" },
  { value: "toko", label: "Toko", desc: "POS, stok barang, produk" },
  { value: "umkm", label: "UMKM", desc: "Usaha jasa, klien, invoice" },
  { value: "perusahaan", label: "Perusahaan", desc: "Karyawan, penggajian, pembukuan" },
]

export default function SettingsPage() {
  const router = useRouter()
  const [data, setData] = useState<SettingsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState("")
  const [businessType, setBusinessType] = useState("pribadi")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(j => {
        if (j.error) return
        setData(j)
        setName(j.name || "")
        setBusinessType(j.businessType || "pribadi")
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, businessType }),
      })
      const json = await res.json()
      if (json.error) {
        setMessage({ type: "error", text: json.error })
      } else {
        setMessage({ type: "success", text: "Pengaturan berhasil disimpan" })
        router.refresh()
      }
    } catch {
      setMessage({ type: "error", text: "Gagal menyimpan pengaturan" })
    } finally {
      setSaving(false)
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setChangingPassword(true)
    setPasswordMsg(null)
    try {
      const res = await fetch("/api/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const json = await res.json()
      if (json.error) {
        setPasswordMsg({ type: "error", text: json.error })
      } else {
        setPasswordMsg({ type: "success", text: "Password berhasil diubah" })
        setCurrentPassword("")
        setNewPassword("")
      }
    } catch {
      setPasswordMsg({ type: "error", text: "Gagal mengubah password" })
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-48 bg-white rounded-2xl border border-border/50 shadow-sm">
      <div className="flex flex-col items-center gap-2"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /><p className="text-xs text-muted">Memuat pengaturan...</p></div>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-8">
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-foreground">Pengaturan</h1>
        <p className="text-sm text-muted">Kelola profil dan preferensi akun Anda</p>
      </div>

      {/* Profile */}
      <form onSubmit={handleSave} className="space-y-4">
        {message && (
          <div className={`flex items-center gap-2.5 p-3.5 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
            {message.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 flex items-center gap-3 border-b border-border/40">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-sm shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Profil</h2>
              <p className="text-[11px] text-muted">Informasi dasar akun</p>
            </div>
          </div>
          <div className="p-4 sm:p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Nama Lengkap</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full h-11 px-3.5 rounded-xl border border-border/70 bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/15 focus:border-primary-300 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <div className="flex items-center h-11 px-3.5 rounded-xl border border-border/50 bg-gray-50 text-sm text-muted">
                <Mail className="w-4 h-4 mr-2 shrink-0" />
                {data?.email || "-"}
              </div>
              <p className="text-[11px] text-muted mt-1">Email tidak dapat diubah</p>
            </div>
          </div>
        </div>

        {/* Business Type */}
        <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 flex items-center gap-3 border-b border-border/40">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-sm shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Tipe Bisnis</h2>
              <p className="text-[11px] text-muted">Sesuaikan menu dengan kebutuhan</p>
            </div>
          </div>
          <div className="p-4 sm:p-5 space-y-2.5">
            {BUSINESS_TYPES.map(bt => (
              <label key={bt.value} className={`flex items-center gap-3.5 p-3.5 rounded-xl border-2 transition-all cursor-pointer ${businessType === bt.value ? "border-primary-300 bg-primary-50/50" : "border-border/50 hover:border-border"}`}>
                <input type="radio" name="businessType" value={bt.value} checked={businessType === bt.value} onChange={e => setBusinessType(e.target.value)} className="w-4 h-4 accent-primary-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{bt.label}</p>
                  <p className="text-[11px] text-muted">{bt.desc}</p>
                </div>
                {businessType === bt.value && (
                  <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center"><CheckCircle2 className="w-3.5 h-3.5 text-white" /></div>
                )}
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold hover:from-primary-600 hover:to-primary-700 shadow-sm hover:shadow-md transition-all disabled:opacity-50 active:scale-[0.98]">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Perubahan
          </button>
        </div>
      </form>

      {/* Password */}
      {data?.hasPassword ? (
        <form onSubmit={handleChangePassword} className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 flex items-center gap-3 border-b border-border/40">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center shadow-sm shrink-0">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Ubah Password</h2>
              <p className="text-[11px] text-muted">Minimal 6 karakter</p>
            </div>
          </div>
          <div className="p-4 sm:p-5 space-y-4">
            {passwordMsg && (
              <div className={`flex items-center gap-2.5 p-3.5 rounded-xl text-sm font-medium ${passwordMsg.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
                {passwordMsg.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                {passwordMsg.text}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password Saat Ini</label>
              <div className="relative">
                <input type={showCurrent ? "text" : "password"} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full h-11 px-3.5 pr-10 rounded-xl border border-border/70 bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/15 focus:border-primary-300 transition-all" />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground">
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password Baru</label>
              <div className="relative">
                <input type={showNew ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full h-11 px-3.5 pr-10 rounded-xl border border-border/70 bg-white text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/15 focus:border-primary-300 transition-all" />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={changingPassword || !currentPassword || !newPassword || newPassword.length < 6} className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 text-white text-sm font-semibold hover:from-violet-600 hover:to-violet-700 shadow-sm hover:shadow-md transition-all disabled:opacity-50 active:scale-[0.98]">
                {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                Ubah Password
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 flex items-center gap-3 border-b border-border/40">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center shadow-sm shrink-0">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Keamanan</h2>
              <p className="text-[11px] text-muted">Metode login</p>
            </div>
          </div>
          <div className="p-4 sm:p-5">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm shrink-0">G</div>
              <div>
                <p className="text-sm font-medium text-foreground">Masuk dengan Google</p>
                <p className="text-[11px] text-muted">Kamu login menggunakan akun Google, tidak perlu password</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
