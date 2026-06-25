import { Sparkles } from "lucide-react"

const stats = [
  { label: "Fitur Premium", value: "Semua Gratis" },
  { label: "Pengguna", value: "Terus Bertambah" },
  { label: "Biaya", value: "Rp 0" },
  { label: "Dikembangkan", value: "Anak Bangsa" },
]

export default function Banner() {
  return (
    <section className="relative py-16 sm:py-36 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-900" />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 70%, rgba(255,255,255,0.08) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(255,255,255,0.05) 0%, transparent 40%)",
        }}
      />

      <div className="hidden sm:block absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-primary-400/10 rounded-full blur-3xl animate-[float-slow_10s_ease-in-out_infinite]" />
      <div className="hidden sm:block absolute bottom-0 left-0 w-64 sm:w-80 h-64 sm:h-80 bg-amber-400/5 rounded-full blur-3xl animate-[float-slow_14s_ease-in-out_infinite_-5s]" />

      <div className="relative max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs sm:text-sm font-medium mb-4 sm:mb-5 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Yang Perlu Kamu Tahu
          </div>
          <h2 className="text-2xl sm:text-5xl font-bold text-white tracking-tight">
            Kenapa Lianata{" "}
            <span className="bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
              Berbeda?
            </span>
          </h2>
          <p className="mt-2 sm:mt-4 text-xs sm:text-lg text-white/60 max-w-2xl mx-auto">
            Banyak aplikasi keuangan yang free hanya di awal. Lianata gratis selamanya, 
            tanpa syarat, tanpa batas.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="relative group h-full"
              style={{
                animation: `fade-in-up 0.5s ease-out ${0.1 + index * 0.1}s both`,
              }}
            >
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center hover:bg-white/10 hover:border-white/20 transition-all duration-300 h-full flex flex-col items-center justify-center">
                <div className="flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white/10 mb-2 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-base sm:text-xl">
                    {index === 0 && "🎁"}
                    {index === 1 && "👥"}
                    {index === 2 && "💰"}
                    {index === 3 && "🇮🇩"}
                  </span>
                </div>
                <p className="text-base sm:text-2xl font-bold text-white mb-0.5 sm:mb-1">{stat.value}</p>
                <p className="text-[11px] sm:text-sm text-white/50">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 sm:mt-14 text-center">
          <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-white/10 border border-white/10 text-white/70 text-xs sm:text-sm leading-relaxed max-w-2xl backdrop-blur-sm">
            <span className="text-base sm:text-lg">💡</span>
            Tidak ada batasan transaksi, tidak ada fitur terkunci, tidak ada masa trial.
            Semua bisa digunakan sekarang juga.
          </div>
        </div>
      </div>
    </section>
  )
}