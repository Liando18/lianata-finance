import Link from "next/link"
import { ArrowRight, Heart, Sparkles } from "lucide-react"

export default function CTASection() {
  return (
    <section className="relative py-16 sm:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 75%, rgba(255,255,255,0.12) 0%, transparent 50%), radial-gradient(circle at 75% 25%, rgba(255,255,255,0.06) 0%, transparent 40%)",
          }}
        />
      </div>

      <div className="absolute top-10 left-1/4 w-64 h-64 rounded-full bg-primary-300/10 blur-3xl animate-[float-slow_8s_ease-in-out_infinite]" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 rounded-full bg-amber-400/5 blur-3xl animate-[float-slow_12s_ease-in-out_infinite_-4s]" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs sm:text-sm font-medium mb-5 sm:mb-6 backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          Mulai Sekarang, Gratis
        </div>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight px-2">
          Siap Kelola{" "}
          <span className="bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
            Keuanganmu
          </span>
          ?
        </h2>

        <p className="mt-3 sm:mt-5 text-sm sm:text-lg text-white/70 max-w-2xl mx-auto">
          Daftar gratis sekarang dan nikmati semua fitur tanpa batas, tanpa biaya, tanpa kartu kredit.
        </p>

        <div className="flex flex-col items-center sm:flex-row sm:justify-center gap-3 mt-8 sm:mt-10">
          <Link
            href="/register"
            className="group inline-flex items-center justify-center h-12 sm:h-13 px-8 sm:px-10 text-sm sm:text-base font-semibold rounded-xl bg-white text-primary-600 hover:bg-primary-50 shadow-xl hover:shadow-2xl transition-all duration-300 whitespace-nowrap"
          >
            Mulai Gratis Sekarang
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center h-12 sm:h-13 px-8 sm:px-10 text-sm sm:text-base font-medium rounded-xl border-2 border-white/30 text-white/80 hover:bg-white/10 hover:text-white hover:border-white/50 transition-all duration-300 whitespace-nowrap"
          >
            Masuk
          </Link>
        </div>

        <div className="flex items-center justify-center gap-2 mt-8 sm:mt-10 text-white/50 text-xs sm:text-sm">
          <Heart className="w-4 h-4" />
          100% gratis selamanya — tanpa batas — tanpa iklan — tanpa syarat
        </div>
      </div>
    </section>
  )
}