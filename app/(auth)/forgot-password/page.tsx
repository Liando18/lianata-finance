"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, ArrowLeft, CheckCircle2, Sparkles } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        throw new Error("Gagal mengirim email")
      }

      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-primary-50 via-white to-primary-100">
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Lupa Password?</h2>
          <p className="text-white/70 max-w-sm mx-auto leading-relaxed">
            Tenang, kami akan kirim link untuk mengatur ulang password kamu.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>

          <h1 className="text-2xl font-bold text-foreground mb-1">Lupa Password</h1>
          <p className="text-sm text-muted mb-8">
            Masukkan email yang terdaftar untuk menerima link reset password.
          </p>

          {sent ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Email Terkirim</h3>
              <p className="text-sm text-muted leading-relaxed">
                Cek inbox email <strong className="text-foreground">{email}</strong>
                <br />
                Link reset password sudah dikirim.
              </p>
              <p className="text-xs text-muted mt-4">
                Tidak menerima email?{" "}
                <button onClick={() => { setSent(false); setLoading(false) }} className="text-primary-600 hover:underline font-medium">
                  Kirim ulang
                </button>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contoh@email.com"
                    className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-border bg-white text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-500/10 transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2.5 border border-red-100">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 shadow-lg shadow-primary-500/25 transition-all duration-300"
              >
                {loading ? "Mengirim..." : "Kirim Reset Link"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
