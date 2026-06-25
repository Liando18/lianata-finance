"use client"

import { useState, use } from "react"
import Link from "next/link"
import { Eye, EyeOff, KeyRound, CheckCircle2, AlertCircle, Sparkles } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"

export default function ResetPasswordPage(props: { searchParams: Promise<{ token?: string }> }) {
  const searchParams = use(props.searchParams)
  const token = searchParams.token

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      setError("Password minimal 6 karakter")
      return
    }
    if (password !== confirmPassword) {
      setError("Password tidak cocok")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: password, token }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || data.message || "Gagal mereset password")
      }

      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-border p-8 max-w-sm w-full text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-2">Link Tidak Valid</h2>
          <p className="text-sm text-muted mb-6">Link reset password tidak valid atau sudah kedaluwarsa.</p>
          <Link href="/forgot-password">
            <Button variant="outline" className="w-full">Minta Link Baru</Button>
          </Link>
        </div>
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
          <h2 className="text-3xl font-bold text-white mb-3">Buat Password Baru</h2>
          <p className="text-white/70 max-w-sm mx-auto leading-relaxed">
            Masukkan password baru untuk akun kamu.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-8">
            <KeyRound className="w-4 h-4" />
            Kembali ke Login
          </Link>

          {done ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Password Diubah</h3>
              <p className="text-sm text-muted mb-6 leading-relaxed">
                Password kamu berhasil diubah. Silakan masuk dengan password baru.
              </p>
              <Link href="/login">
                <Button className="w-full">Masuk Sekarang</Button>
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-foreground mb-1">Buat Password Baru</h1>
              <p className="text-sm text-muted mb-8">
                Minimal 6 karakter, gunakan kombinasi huruf dan angka.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="relative">
                  <Input
                    id="password"
                    label="Password Baru"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[38px] text-muted hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <Input
                  id="confirmPassword"
                  label="Konfirmasi Password Baru"
                  type="password"
                  placeholder="Ulangi password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                {error && (
                  <div className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2.5 border border-red-100">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Menyimpan..." : "Simpan Password Baru"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
