import { Sparkles, UserPlus, ArrowRightLeft, BarChart3 } from "lucide-react"

const steps = [
  {
    number: 1,
    icon: UserPlus,
    title: "Buat Akun",
    description: "Daftar gratis dalam hitungan detik. Cukup email dan password, atau login dengan Google.",
    gradient: "from-primary-500 to-primary-600",
    lightBg: "bg-primary-50",
    iconColor: "text-primary-600",
  },
  {
    number: 2,
    icon: ArrowRightLeft,
    title: "Catat Transaksi",
    description: "Catat setiap pemasukan dan pengeluaran dengan kategori yang rapi dan mudah diatur.",
    gradient: "from-amber-400 to-amber-500",
    lightBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    number: 3,
    icon: BarChart3,
    title: "Pantau & Evaluasi",
    description: "Lihat laporan keuangan dalam grafik interaktif, evaluasi pengeluaran, dan capai target keuanganmu.",
    gradient: "from-emerald-500 to-emerald-600",
    lightBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-gray-50/80 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary-100/60 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-amber-100/40 rounded-full blur-3xl" />
      </div>

      <div className="absolute top-40 left-10 w-8 h-8 rounded-full border-2 border-primary-200/50 hidden lg:block animate-[float_6s_ease-in-out_infinite]" />
      <div className="absolute bottom-40 right-20 w-6 h-6 rounded-full border-2 border-amber-200/50 hidden lg:block animate-[float_8s_ease-in-out_infinite_-3s]" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-border text-foreground text-xs sm:text-sm font-medium mb-5 sm:mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-primary-500" />
            Cara Kerja
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-foreground tracking-tight">
            Mulai dalam{" "}
            <span className="bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
              3 Langkah Mudah
            </span>
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-muted max-w-2xl mx-auto">
            Tanpa ribet, langsung kelola keuanganmu dalam hitungan menit.
          </p>
        </div>

        <div className="relative">
          <div className="hidden sm:block absolute top-16 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200" />

          <div className="grid sm:grid-cols-3 gap-8 sm:gap-12">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <div
                  key={step.number}
                  className="relative flex flex-col items-center text-center group"
                  style={{
                    animation: `fade-in-up 0.5s ease-out ${0.15 + index * 0.18}s both`,
                  }}
                >
                  <div className="relative z-10 mb-5 sm:mb-7">
                    <div
                      className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-xl transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1`}
                      style={{ boxShadow: `0 8px 32px -8px rgba(var(--primary-500), 0.3)` }}
                    >
                      <Icon className="w-9 h-9 sm:w-11 sm:h-11 text-white" />
                    </div>
                    <div
                      className={`absolute -top-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full ${step.lightBg} border-2 border-white flex items-center justify-center shadow-md`}
                    >
                      <span className={`text-xs sm:text-sm font-bold ${step.iconColor}`}>
                        {step.number}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed max-w-xs">
                    {step.description}
                  </p>

                  <div
                    className={`mt-4 sm:mt-6 w-16 h-1 rounded-full bg-gradient-to-r ${step.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  />
                </div>
              )
            })}
          </div>
        </div>

        <div
          className="relative mt-12 sm:mt-16 text-center"
          style={{
            animation: "fade-in-up 0.5s ease-out 0.6s both",
          }}
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-border/80 text-muted text-xs sm:text-sm shadow-sm">
            <span className="text-base">⏱️</span>
            Kurang dari 2 menit — mulai dari daftar sampai catat transaksi pertama
          </div>
        </div>
      </div>
    </section>
  )
}