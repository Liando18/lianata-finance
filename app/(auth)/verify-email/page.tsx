"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle2, AlertCircle, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/app/components/ui/button"

export default function VerifyEmailPage(props: { searchParams: Promise<{ status?: string; message?: string }> }) {
  const searchParams = use(props.searchParams)
  const status = searchParams.status
  const message = searchParams.message

  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<"success" | "error" | null>(null)

  useEffect(() => {
    if (status === "success") {
      setResult("success")
      setLoading(false)
    } else if (status === "error") {
      setResult("error")
      setLoading(false)
    } else {
      setLoading(false)
      setResult("error")
    }
  }, [status])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 p-6">
      <div className="bg-white rounded-2xl shadow-sm border border-border p-8 max-w-sm w-full text-center">
        {loading ? (
          <>
            <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-7 h-7 text-primary-500 animate-spin" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">Memverifikasi...</h2>
          </>
        ) : result === "success" ? (
          <>
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">Email Terverifikasi!</h2>
            <p className="text-sm text-muted mb-6 leading-relaxed">
              Selamat! Email kamu sudah terverifikasi. Sekarang kamu bisa masuk ke akun Lianata Finance.
            </p>
            {message && <p className="text-xs text-muted mb-4">{message}</p>}
            <Link href="/login">
              <Button className="w-full">Masuk Sekarang</Button>
            </Link>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">Verifikasi Gagal</h2>
            <p className="text-sm text-muted mb-2 leading-relaxed">
              Link verifikasi tidak valid atau sudah kedaluwarsa.
            </p>
            {message && <p className="text-xs text-muted mb-4">{message}</p>}
            <Link href="/login">
              <Button variant="outline" className="w-full">Ke Halaman Masuk</Button>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
