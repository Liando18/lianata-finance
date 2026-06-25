import { ArrowRightLeft, BarChart3, Wallet, Target, HandCoins, RefreshCw } from "lucide-react"

const features = [
  {
    icon: ArrowRightLeft,
    title: "Catat Transaksi",
    description: "Catat pemasukan & pengeluaran dengan cepat, lengkap dengan kategori dan dompet.",
    gradient: "from-emerald-400 to-emerald-600",
    bg: "bg-emerald-50",
    cardBg: "bg-emerald-50/40",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    badge: "emerald",
    hoverBorder: "hover:border-emerald-200",
    hoverShadow: "hover:shadow-emerald-500/10",
  },
  {
    icon: BarChart3,
    title: "Laporan & Grafik",
    description: "Lihat laporan keuangan dalam bentuk grafik interaktif yang mudah dipahami.",
    gradient: "from-primary-400 to-primary-600",
    bg: "bg-primary-50",
    cardBg: "bg-primary-50/40",
    iconBg: "bg-primary-100",
    iconColor: "text-primary-600",
    badge: "primary",
    hoverBorder: "hover:border-primary-200",
    hoverShadow: "hover:shadow-primary-500/10",
  },
  {
    icon: Wallet,
    title: "Multiple Dompet",
    description: "Kelola berbagai akun keuangan (cash, bank, e-wallet) dalam satu tempat.",
    gradient: "from-violet-400 to-violet-600",
    bg: "bg-violet-50",
    cardBg: "bg-violet-50/40",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    badge: "violet",
    hoverBorder: "hover:border-violet-200",
    hoverShadow: "hover:shadow-violet-500/10",
  },
  {
    icon: Target,
    title: "Budget Planning",
    description: "Buat anggaran per kategori dan pantau progres pengeluaranmu secara real-time.",
    gradient: "from-amber-400 to-amber-600",
    bg: "bg-amber-50",
    cardBg: "bg-amber-50/40",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    badge: "amber",
    hoverBorder: "hover:border-amber-200",
    hoverShadow: "hover:shadow-amber-500/10",
  },
  {
    icon: HandCoins,
    title: "Hutang & Piutang",
    description: "Catat hutang dan piutang dengan status dan pengingat jatuh tempo otomatis.",
    gradient: "from-rose-400 to-rose-600",
    bg: "bg-rose-50",
    cardBg: "bg-rose-50/40",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    badge: "rose",
    hoverBorder: "hover:border-rose-200",
    hoverShadow: "hover:shadow-rose-500/10",
  },
  {
    icon: RefreshCw,
    title: "Transaksi Berulang",
    description: "Atur transaksi rutin bulanan seperti tagihan dan langganan secara otomatis.",
    gradient: "from-cyan-400 to-cyan-600",
    bg: "bg-cyan-50",
    cardBg: "bg-cyan-50/40",
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-600",
    badge: "cyan",
    hoverBorder: "hover:border-cyan-200",
    hoverShadow: "hover:shadow-cyan-500/10",
  },
]

export default function Features() {
  return (
    <section id="features" className="py-16 sm:py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-100/60 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-100/40 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200/60 text-primary-700 text-xs sm:text-sm font-medium mb-4 sm:mb-5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-[pulse-soft_2s_ease-in-out_infinite]" />
            Semua Gratis, Tanpa Batas
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-foreground tracking-tight">
            Fitur{" "}
            <span className="bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
              Lengkap
            </span>
            ,{" "}
            <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
              Gratis
            </span>
          </h2>
          <p className="mt-2 text-sm sm:text-base text-muted max-w-2xl mx-auto">
            Semua fitur bisa kamu gunakan tanpa batas. Tidak ada fitur yang dikunci.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`group relative border ${feature.hoverBorder} rounded-2xl p-5 sm:p-6 transition-all duration-300 ${feature.cardBg} border-border/60 hover:shadow-lg hover:-translate-y-1 ${feature.hoverShadow}`}
              style={{
                animation: `fade-in-up 0.5s ease-out ${0.1 + index * 0.08}s both`,
              }}
            >
              <div className="relative z-10">
                <div
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl ${feature.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300`}
                >
                  <feature.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${feature.iconColor}`} />
                </div>

                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1.5 group-hover:text-primary-700 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {feature.description}
                </p>
              </div>

              <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${feature.gradient} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-full`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}