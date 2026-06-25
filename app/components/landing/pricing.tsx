import Link from "next/link"
import { Check, Heart, Coffee, Rocket, Star } from "lucide-react"

const features = [
  "Catat pemasukan & pengeluaran tak terbatas",
  "Multiple dompet (cash, bank, e-wallet)",
  "Laporan & grafik interaktif real-time",
  "Budget planning per kategori",
  "Manajemen hutang & piutang",
  "Transaksi berulang otomatis",
  "Ekspor data (CSV/PDF)",
  "Segmentasi pengguna dengan ML",
  "Deteksi anomali transaksi",
  "Semua fitur, tanpa batas!",
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-16 sm:py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-50 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-50 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200/60 text-amber-700 text-xs sm:text-sm font-medium mb-5 sm:mb-6 shadow-sm">
            <Heart className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            Gratis Selamanya
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-foreground tracking-tight">
            Rp{" "}
            <span className="text-primary-500">0</span>
            {" "}untuk{" "}
            <span className="bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
              Semua Fitur
            </span>
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-muted max-w-2xl mx-auto">
            Tidak ada paket Pro, tidak ada paket Bisnis. Semua fitur bisa kamu gunakan gratis, selamanya.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div
            className="relative bg-white rounded-3xl border-2 border-primary-200/80 shadow-2xl shadow-primary-500/10 overflow-hidden"
            style={{
              animation: "fade-in-up 0.6s ease-out 0.1s both",
            }}
          >
            <div className="absolute -top-0.5 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600" />

            <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[10px] sm:text-xs font-semibold shadow-lg shadow-amber-500/20">
                <Star className="w-3 h-3 fill-white" />
                Paling Populer
              </div>
            </div>

            <div className="p-6 sm:p-8 lg:p-10">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6 pb-6 sm:pb-8 border-b border-border/60">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1">Gratis</h3>
                  <p className="text-sm text-muted max-w-md">
                    Semua fitur bisa kamu gunakan tanpa batas. Tidak perlu upgrade.
                  </p>
                </div>
                <div className="flex items-baseline gap-1 shrink-0">
                  <span className="text-4xl sm:text-5xl font-bold text-foreground">Rp 0</span>
                  <span className="text-sm text-muted">/selamanya</span>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5 sm:gap-y-3 pt-6 sm:pt-8">
                {features.map((f) => (
                  <div key={f} className="flex items-center gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-primary-600" />
                    </div>
                    <span className="text-muted">{f}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-2 mt-8 sm:mt-10 w-full h-12 sm:h-13 px-8 text-sm sm:text-base font-semibold rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-300"
              >
                Mulai Gratis Sekarang
                <Rocket className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="mt-12 sm:mt-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200/60 text-amber-700 text-xs sm:text-sm font-medium mb-4">
              <Coffee className="w-3.5 h-3.5" />
              Dukung Kami
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
              Suka dengan Lianata?
            </h3>
            <p className="text-sm sm:text-base text-muted max-w-lg mx-auto mb-6">
              Kami tidak menampilkan iklan dan tidak menjual data. Jika kamu merasa terbantu,
              kamu bisa mendukung kami dengan donasi untuk biaya server dan pengembangan.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-2 h-10 sm:h-11 px-5 sm:px-6 text-sm font-semibold rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-md shadow-amber-500/20 cursor-default">
                <Coffee className="w-4 h-4" />
                Traktir Kopi
              </span>
              <span className="text-xs text-muted px-3 py-1.5 rounded-full bg-gray-100">
                Segera hadir
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}