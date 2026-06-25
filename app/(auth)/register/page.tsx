"use client"

/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Eye, EyeOff, Loader2, User, Store, ShoppingBag, Building2, Grid3x3, ArrowLeft, ArrowRight,
  Check, Mail, X, AlertCircle, KeyRound,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
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

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
}

const REMEMBER_KEY = "lianata_remember_email"

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [remember, setRemember] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [otpValue, setOtpValue] = useState("")
  const otpTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [otpCountdown, setOtpCountdown] = useState(0)

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    businessType: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [emailStatus, setEmailStatus] = useState<"idle" | "checking" | "available" | "taken">("idle")
  const [pwCriteria, setPwCriteria] = useState({ min6: false, hasUpper: false, hasNumber: false, match: false })

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY)
    if (saved) {
      setForm((f) => ({ ...f, email: saved }))
      setRemember(true)
    }
  }, [])

  useEffect(() => {
    if (otpCountdown > 0) {
      otpTimerRef.current = setInterval(() => {
        setOtpCountdown((prev) => {
          if (prev <= 1) {
            if (otpTimerRef.current) clearInterval(otpTimerRef.current)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => { if (otpTimerRef.current) clearInterval(otpTimerRef.current) }
    }
  }, [otpCountdown])

  async function handleSendOtp() {
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setErrors({ email: "Email tidak valid" })
      return
    }
    setOtpLoading(true)
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      })
      if (!res.ok) {
        throw new Error("Gagal mengirim kode")
      }
      setOtpSent(true)
      setOtpCountdown(60)
      setDirection(1)
      setStep(1)
      toast.success("Kode verifikasi telah dikirim ke email")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setOtpLoading(false)
    }
  }

  async function handleVerifyOtp() {
    if (!otpValue || otpValue.length < 6) {
      setErrors({ otp: "Masukkan kode 6 digit" })
      return
    }
    setOtpLoading(true)
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp: otpValue }),
      })
      if (!res.ok) {
        throw new Error("Kode tidak valid")
      }
      setOtpVerified(true)
      setDirection(1)
      setStep(2)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Kode tidak valid")
    } finally {
      setOtpLoading(false)
    }
  }

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setForm((f) => ({ ...f, email: val }))
    if (!val) { setEmailStatus("idle"); return }
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
    if (valid) setEmailStatus("available")
    else setEmailStatus("idle")
  }

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setForm((f) => ({ ...f, password: val }))
    setPwCriteria({
      min6: val.length >= 6,
      hasUpper: /[A-Z]/.test(val),
      hasNumber: /[0-9]/.test(val),
      match: val === form.confirmPassword && val.length > 0,
    })
  }

  function handleConfirmChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setForm((f) => ({ ...f, confirmPassword: val }))
    setPwCriteria((p) => ({ ...p, match: val === form.password && val.length > 0 }))
  }

  function validateStep(): boolean {
    const errs: Record<string, string> = {}
    if (step === 0) {
      if (!form.email) errs.email = "Email wajib diisi"
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Email tidak valid"
    }
    if (step === 2) {
      if (!form.name.trim()) errs.name = "Nama wajib diisi"
      if (!form.password) errs.password = "Password wajib diisi"
      else {
        if (form.password.length < 6) errs.password = "Minimal 6 karakter"
        else if (!/[A-Z]/.test(form.password)) errs.password = "Harus ada huruf besar"
        else if (!/[0-9]/.test(form.password)) errs.password = "Harus ada angka"
      }
      if (!form.confirmPassword) errs.confirmPassword = "Konfirmasi wajib diisi"
      else if (form.password !== form.confirmPassword) errs.confirmPassword = "Password tidak cocok"
    }
    if (step === 3) {
      if (!form.businessType) errs.businessType = "Pilih tipe akun"
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function nextStep() {
    if (validateStep()) {
      if (remember && form.email) localStorage.setItem(REMEMBER_KEY, form.email)
      else localStorage.removeItem(REMEMBER_KEY)
      setDirection(1)
      setStep(step + 1)
    }
  }

  function prevStep() {
    setDirection(-1)
    setStep(step - 1)
  }

  async function handleSubmit() {
    if (!validateStep()) return
    setLoading(true)
    try {
      const res = await fetch("/api/auth/sign-up/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, businessType: form.businessType }),
      })
      if (!res.ok) {
        throw new Error("Gagal mendaftar")
      }
      if (remember && form.email) localStorage.setItem(REMEMBER_KEY, form.email)
      else localStorage.removeItem(REMEMBER_KEY)
      setRegistered(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleRegister() {
    setGoogleLoading(true)
    try {
      const res = await fetch("/api/auth/sign-in/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: "google", callbackURL: "/dashboard" }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else { setGoogleLoading(false); toast.error("Gagal memulai login Google") }
    } catch {
      setGoogleLoading(false)
      toast.error("Terjadi kesalahan")
    }
  }

  const isLastStep = step === 3
  const isFirstStep = step === 0
  const totalSteps = 4
  const progress = ((step + 1) / totalSteps) * 100
  const stepLabels = ["Email", "Verifikasi", "Keamanan", "Tipe Akun"]

  const criteriaList = [
    { key: "min6", label: "Minimal 6 karakter" },
    { key: "hasUpper", label: "Huruf besar (A-Z)" },
    { key: "hasNumber", label: "Angka (0-9)" },
    { key: "match", label: "Konfirmasi password cocok" },
  ] as const

  return (
    <div className="h-screen flex overflow-hidden bg-white">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700">
        <div className="absolute inset-0">
          <div className="absolute top-0 -right-20 w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/10" />
        </div>
        <div className="relative flex flex-col justify-between p-12 w-full">
          <img src="/logo-lianata-finance.png" alt="Lianata Finance" width={44} height={44} className="object-contain" />
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-white leading-tight">
              Mulai Kelola<br /><span className="text-white/80">Keuanganmu Sekarang</span>
            </h1>
            <p className="text-white/70 text-base max-w-sm leading-relaxed">
              Daftar gratis dan nikmati semua fitur untuk kelola keuangan pribadi maupun usaha.
            </p>
          </div>
          <div className="space-y-4">
            {["Catat pemasukan & pengeluaran", "Pantau dengan grafik interaktif", "Atur budget & target"].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-white/70 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full flex items-start justify-center px-6 lg:px-16 py-10">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <img src="/logo-lianata-finance.png" alt="Lianata Finance" width={36} height={36} className="object-contain" />
            <span className="font-semibold text-foreground text-lg">Lianata</span>
          </div>

          {/* Step Indicator */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-3">
              {stepLabels.map((label, i) => (
                <button key={label} onClick={() => { if (i <= step) { setDirection(i > step ? 1 : -1); setStep(i) } }}
                  className={`text-xs font-medium transition-colors ${i === step ? "text-primary-600" : i < step ? "text-primary-500" : "text-muted"}`}>
                  {label}
                </button>
              ))}
            </div>
            <div className="relative h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
                initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4, ease: "easeInOut" }} />
            </div>
            <p className="text-xs text-muted mt-2 text-right">Langkah {step + 1} dari {totalSteps}</p>
          </div>

          {registered ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
                <Check className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground tracking-tight mb-2">Pendaftaran Berhasil</h2>
              <p className="text-sm text-muted leading-relaxed mb-6 max-w-xs mx-auto">
                Akun <strong className="text-foreground">{form.email}</strong> berhasil dibuat. Silakan masuk.
              </p>
              <Button onClick={() => router.push("/login")}>Ke Halaman Masuk</Button>
            </div>
          ) : (
            <>
            <AnimatePresence mode="wait" custom={direction}>
            <motion.div key={step} custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: "easeInOut" }}>

              {/* Step 0: Email */}
              {step === 0 && (
                <div className="space-y-5">
                  <div className="text-center lg:text-left mb-6">
                    <h2 className="text-2xl font-bold text-foreground tracking-tight">Masukkan Email</h2>
                    <p className="text-muted mt-1.5 text-sm">Kami akan kirim kode verifikasi ke email kamu</p>
                  </div>
                  <div>
                    <Input id="email" label="Email" type="email" placeholder="nama@email.com"
                      value={form.email} error={errors.email} onChange={handleEmailChange} />
                  </div>
                  <div className="flex items-center gap-2">
                    <input id="remember" type="checkbox" checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary-500 focus:ring-primary-500 cursor-pointer" />
                    <label htmlFor="remember" className="text-sm text-muted cursor-pointer select-none">Ingat email saya</label>
                  </div>
                  <Button className="w-full" size="lg" disabled={otpLoading || !form.email} onClick={handleSendOtp}>
                    {otpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Kirim Kode Verifikasi"}
                  </Button>
                </div>
              )}

              {/* Step 1: OTP */}
              {step === 1 && (
                <div className="space-y-5">
                  <div className="text-center lg:text-left mb-6">
                    <h2 className="text-2xl font-bold text-foreground tracking-tight">Cek Email Kamu</h2>
                    <p className="text-muted mt-1.5 text-sm">
                      Kami sudah kirim kode ke <strong className="text-foreground">{form.email}</strong>
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-5">
                      <Mail className="w-8 h-8 text-primary-500" />
                    </div>
                    <Input
                      id="otp"
                      label="Kode Verifikasi"
                      type="text"
                      placeholder="000000"
                      maxLength={6}
                      value={otpValue}
                      error={errors.otp}
                      onChange={(e) => { setOtpValue(e.target.value.replace(/\D/g, "").slice(0, 6)); setErrors((p) => ({ ...p, otp: "" })) }}
                      className="text-center text-2xl tracking-[8px] font-bold"
                    />
                    <Button className="w-full mt-5" size="lg" disabled={otpLoading || otpValue.length < 6} onClick={handleVerifyOtp}>
                      {otpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verifikasi"}
                    </Button>
                    <div className="mt-4 text-xs text-muted">
                      {otpCountdown > 0 ? (
                        <span>Kirim ulang dalam {otpCountdown} detik</span>
                      ) : (
                        <button onClick={handleSendOtp} className="text-primary-600 hover:text-primary-700 font-medium">
                          Kirim ulang kode
                        </button>
                      )}
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 mt-4">
                      Cek folder spam atau promosi jika email tidak masuk.
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Name + Password */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="text-center lg:text-left mb-6">
                    <h2 className="text-2xl font-bold text-foreground tracking-tight">Keamanan</h2>
                    <p className="text-muted mt-1.5 text-sm">Buat akun dengan nama dan password</p>
                  </div>
                  <Input id="name" label="Nama Lengkap" type="text" placeholder="Nama kamu"
                    value={form.name} error={errors.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                  <div className="relative">
                    <Input id="password" label="Password" type={showPassword ? "text" : "password"} placeholder="Minimal 6 karakter"
                      value={form.password} error={errors.password} onChange={handlePasswordChange} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-[38px] text-muted hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <Input id="confirmPassword" label="Konfirmasi Password" type="password" placeholder="Ulangi password"
                    value={form.confirmPassword} error={errors.confirmPassword} onChange={handleConfirmChange} />
                  {form.password && (
                    <div className="space-y-1.5">
                      {criteriaList.map((c) => {
                        const met = pwCriteria[c.key]
                        return (
                          <div key={c.key} className="flex items-center gap-2 text-xs">
                            {met ? <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 text-muted shrink-0" />}
                            <span className={met ? "text-emerald-600" : "text-muted"}>{c.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                    <Check className="w-4 h-4 text-green-600 shrink-0" />
                    <span className="text-xs text-green-700">Email terverifikasi: {form.email}</span>
                  </div>
                </div>
              )}

              {/* Step 3: Business Type */}
              {step === 3 && (
                <div className="space-y-5">
                  <div className="text-center lg:text-left mb-6">
                    <h2 className="text-2xl font-bold text-foreground tracking-tight">Tipe Akun</h2>
                    <p className="text-muted mt-1.5 text-sm">Pilih jenis penggunaan akun kamu</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {businessTypes.map((bt) => {
                      const selected = form.businessType === bt.id
                      return (
                        <button key={bt.id} type="button" onClick={() => setForm((f) => ({ ...f, businessType: bt.id }))}
                          className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                            selected ? "border-primary-500 bg-primary-50 shadow-sm" : "border-border hover:border-primary-200 hover:bg-gray-50"
                          }`}>
                          {selected && <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${selected ? "bg-primary-500 text-white" : "bg-gray-100 text-muted"}`}>
                            <bt.icon className="w-5 h-5" />
                          </div>
                          <p className="text-sm font-semibold text-foreground">{bt.label}</p>
                          <p className="text-xs text-muted mt-0.5 leading-relaxed">{bt.desc}</p>
                        </button>
                      )
                    })}
                  </div>
                  {errors.businessType && <p className="text-xs text-red-500">{errors.businessType}</p>}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center gap-3 mt-8">
                {step > 1 ? (
                  <Button variant="outline" className="flex-1" size="lg" onClick={prevStep}>
                    <ArrowLeft className="w-4 h-4 mr-1.5" />Kembali
                  </Button>
                ) : step === 1 ? (
                  <Button variant="outline" className="flex-1" size="lg" onClick={() => setStep(0)}>
                    <ArrowLeft className="w-4 h-4 mr-1.5" />Ganti Email
                  </Button>
                ) : <div className="flex-1" />}
                {isLastStep ? (
                  <Button className="flex-1" size="lg" disabled={loading} onClick={handleSubmit}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buat Akun"}
                  </Button>
                ) : step < 1 ? null : (
                  <Button className="flex-1" size="lg" onClick={nextStep}>
                    Lanjut<ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                )}
              </div>

              {/* Google */}
              {isFirstStep && (
                <>
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                    <div className="relative flex justify-center text-sm"><span className="bg-white px-3 text-muted">Atau</span></div>
                  </div>
                  <Button variant="google" className="w-full" size="lg" disabled={googleLoading} onClick={handleGoogleRegister}>
                    {googleLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Daftar dengan Google
                      </>
                    )}
                  </Button>
                </>
              )}

              <p className="text-center text-sm text-muted mt-8">
                Sudah punya akun?{" "}
                <Link href="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">Masuk</Link>
              </p>
            </>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}
