import Link from "next/link"
import { ArrowRight, Sparkles, Shield, Heart, TrendingUp, Wallet, BarChart3 } from "lucide-react"

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(193,42,88,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 40%), radial-gradient(circle at 50% 80%, rgba(193,42,88,0.15) 0%, transparent 40%)",
        }}
      />

      <div className="absolute top-20 left-10 w-48 sm:w-96 h-48 sm:h-96 rounded-full bg-primary-400/10 blur-3xl animate-[float-slow_10s_ease-in-out_infinite]" />
      <div className="absolute bottom-40 right-20 w-48 sm:w-80 h-48 sm:h-80 rounded-full bg-primary-300/10 blur-3xl animate-[float-slow_14s_ease-in-out_infinite_-4s]" />
      <div className="hidden sm:block absolute top-1/3 right-1/4 w-48 h-48 rounded-full bg-amber-400/5 blur-3xl animate-[float-slow_12s_ease-in-out_infinite_-2s]" />

      <div className="relative max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-12 sm:pb-20 min-h-screen flex items-center">
        <div className="grid lg:grid-cols-5 gap-10 lg:gap-16 items-center w-full">
          <div className="lg:col-span-3 flex flex-col text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs sm:text-sm font-medium mb-5 sm:mb-8 w-fit shadow-sm animate-[slide-up_0.6s_ease-out]">
              <Heart className="w-3.5 h-3.5 fill-primary-400 text-primary-400" />
              100% Gratis — Tanpa Biaya, Tanpa Batas
            </div>

            <h1 className="text-[clamp(2rem,6vw,3.75rem)] font-bold tracking-tight leading-[1.08] animate-[slide-up_0.6s_ease-out_0.1s_both]">
              <span className="text-white">Kelola Keuangan </span>
              <span className="bg-gradient-to-r from-primary-300 via-primary-200 to-amber-200 bg-clip-text text-transparent">
                dengan Percaya Diri
              </span>
            </h1>

            <p className="mt-3 sm:mt-5 text-sm sm:text-base lg:text-lg text-white/60 max-w-xl leading-relaxed animate-[slide-up_0.6s_ease-out_0.15s_both]">
              Catat pemasukan dan pengeluaran, buat anggaran, pantau laporan keuangan — 
              semua gratis selamanya. Untuk pribadi, UMKM, dan toko.
            </p>

            <div className="flex flex-row flex-wrap items-center gap-3 mt-5 sm:mt-8 animate-[slide-up_0.6s_ease-out_0.2s_both]">
              <Link
                href="/register"
                className="group inline-flex items-center justify-center h-11 sm:h-13 px-6 sm:px-9 text-sm sm:text-base font-semibold rounded-xl bg-white text-primary-700 hover:bg-primary-50 shadow-xl shadow-black/10 hover:shadow-2xl hover:shadow-black/15 transition-all duration-300 whitespace-nowrap"
              >
                Mulai Gratis
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center h-11 sm:h-13 px-6 sm:px-9 text-sm sm:text-base font-medium rounded-xl border-2 border-white/20 text-white/80 hover:bg-white/10 hover:text-white hover:border-white/40 transition-all duration-300 whitespace-nowrap"
              >
                Masuk
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-6 sm:mt-10 animate-[slide-up_0.6s_ease-out_0.25s_both]">
              <span className="flex items-center gap-2 text-xs sm:text-sm text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Data Terenkripsi
              </span>
              <span className="flex items-center gap-2 text-xs sm:text-sm text-amber-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Tanpa Kartu Kredit
              </span>
              <span className="flex items-center gap-2 text-xs sm:text-sm text-primary-300">
                <Shield className="w-3.5 h-3.5 text-primary-300" />
                Privasi Terjaga
              </span>
            </div>
          </div>

          <div className="lg:col-span-2 hidden lg:flex items-center justify-center animate-[slide-up_0.6s_ease-out_0.15s_both]">
            <div className="relative w-full">
              <div className="absolute -top-8 -left-8 w-40 h-40 rounded-full bg-primary-300/20 blur-2xl animate-[float_7s_ease-in-out_infinite]" />
              <div className="absolute -bottom-6 -right-6 w-48 h-48 rounded-full bg-amber-400/15 blur-2xl animate-[float_9s_ease-in-out_infinite_-3s]" />

              <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                <div className="flex items-center gap-1.5 px-5 py-3.5 border-b border-white/10 bg-white/5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                  <div className="ml-3 text-[11px] text-white/40 font-mono">lianata.finance/dashboard</div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-white/40 font-medium uppercase tracking-wider">Total Balance</p>
                      <p className="text-xl font-bold text-white mt-0.5">Rp 12.500.000</p>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/20">
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                      <span className="text-[10px] font-semibold text-emerald-400">+8.2%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white/5 border border-white/10 p-3.5">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <span className="text-[10px] text-white/40">Pemasukan</span>
                      </div>
                      <p className="text-sm font-bold text-white">Rp 8.500.000</p>
                      <p className="text-[10px] text-emerald-400/70 mt-0.5">Bulan ini</p>
                    </div>
                    <div className="rounded-xl bg-white/5 border border-white/10 p-3.5">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 rounded-lg bg-rose-500/20 flex items-center justify-center">
                          <Wallet className="w-3.5 h-3.5 text-rose-400" />
                        </div>
                        <span className="text-[10px] text-white/40">Pengeluaran</span>
                      </div>
                      <p className="text-sm font-bold text-white">Rp 5.200.000</p>
                      <p className="text-[10px] text-rose-400/70 mt-0.5">Bulan ini</p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-white/5 border border-white/10 p-3.5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] text-white/40 font-medium">Grafik Pengeluaran</span>
                      <BarChart3 className="w-3.5 h-3.5 text-white/30" />
                    </div>
                    <div className="flex items-end gap-2 h-16">
                      {[40, 58, 32, 68, 45, 62, 38].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1 justify-end h-full group">
                          <div
                            className="w-full bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-lg opacity-80 group-hover:opacity-100 transition-opacity"
                            style={{ height: `${h}%` }}
                          />
                          <span className="text-[7px] text-white/30 font-medium">
                            {["S","S","R","K","J","S","M"][i]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-amber-500/10 border border-amber-500/20 p-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-amber-400/20 flex items-center justify-center text-xs">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-[10px] text-amber-300/70">Budget Makanan</p>
                        <p className="text-xs font-semibold text-amber-200">75% terpakai</p>
                      </div>
                    </div>
                    <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-amber-400 to-amber-500" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -right-8 top-12 px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-400/20 flex items-center justify-center">
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/50">Transaksi hari ini</p>
                    <p className="text-xs font-bold text-white">23 transaksi</p>
                  </div>
                </div>
              </div>

              <div className="absolute -left-10 bottom-16 px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary-400/20 flex items-center justify-center">
                    <Heart className="w-3 h-3 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/50">Status</p>
                    <p className="text-xs font-bold text-white">100% Gratis</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}