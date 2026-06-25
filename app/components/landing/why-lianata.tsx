import { Sparkles } from "lucide-react"

const reasons = [
  {
    icon: "🎯",
    title: "100% Gratis Selamanya",
    description:
      "Tidak ada biaya langganan, tidak ada fitur premium. Semua fitur bisa kamu gunakan tanpa batas, tanpa syarat.",
    gradient: "from-primary-500 to-primary-600",
    bg: "bg-primary-50",
    shadow: "shadow-primary-500/10",
    border: "hover:border-primary-200",
    decoration: "bg-primary-100",
  },
  {
    icon: "🔒",
    title: "Data Kamu Aman",
    description:
      "Semua data transaksi dienkripsi dan disimpan di server aman. Kami tidak akan pernah menjual data kamu ke pihak ketiga.",
    gradient: "from-emerald-500 to-emerald-600",
    bg: "bg-emerald-50",
    shadow: "shadow-emerald-500/10",
    border: "hover:border-emerald-200",
    decoration: "bg-emerald-100",
  },
  {
    icon: "⚡",
    title: "Cepat & Responsif",
    description:
      "Dibangun dengan teknologi modern untuk pengalaman yang cepat, mulus, dan nyaman di perangkat apa pun.",
    gradient: "from-amber-400 to-amber-500",
    bg: "bg-amber-50",
    shadow: "shadow-amber-500/10",
    border: "hover:border-amber-200",
    decoration: "bg-amber-100",
  },
  {
    icon: "💜",
    title: "Dibuat dengan Sepenuh Hati",
    description:
      "Dikembangkan oleh anak bangsa untuk membantu sesama mengelola keuangan dengan lebih baik secara gratis.",
    gradient: "from-rose-400 to-rose-500",
    bg: "bg-rose-50",
    shadow: "shadow-rose-500/10",
    border: "hover:border-rose-200",
    decoration: "bg-rose-100",
  },
]

export default function WhyLianata() {
  return (
    <section className="py-16 sm:py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-50 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-50 rounded-full blur-3xl" />
      </div>

      <div className="absolute top-20 left-20 w-20 h-20 rounded-2xl bg-primary-100/50 rotate-12 hidden lg:block" />
      <div className="absolute bottom-32 right-32 w-16 h-16 rounded-xl bg-amber-100/50 -rotate-6 hidden lg:block" />
      <div className="absolute top-1/2 right-16 w-12 h-12 rounded-full bg-emerald-100/50 hidden lg:block" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200/60 text-primary-700 text-xs sm:text-sm font-medium mb-5 sm:mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Kenapa Lianata?
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-foreground tracking-tight">
            Dibuat untuk{" "}
            <span className="bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
              Semua Orang
            </span>
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-muted max-w-2xl mx-auto">
            Kami percaya mengelola keuangan adalah hak semua orang, bukan hanya yang mampu bayar.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
          {reasons.map((item, index) => (
            <div
              key={item.title}
              className={`group relative bg-white rounded-2xl border border-border/60 p-6 sm:p-8 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 ${item.border} ${item.shadow}`}
              style={{
                animation: `fade-in-up 0.5s ease-out ${0.1 + index * 0.12}s both`,
              }}
            >
              <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${item.decoration}`} />

              <div className="relative flex items-start gap-4 sm:gap-5">
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${item.bg} flex items-center justify-center shrink-0 text-2xl group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300`}
                >
                  {item.icon}
                </div>
                <div className="min-w-0 pt-1">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <div
                className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${item.gradient} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-full`}
              />
            </div>
          ))}
        </div>

        <div
          className="relative mt-10 sm:mt-14 bg-gradient-to-r from-primary-50 via-white to-amber-50 border border-primary-100/60 rounded-2xl p-5 sm:p-7 text-center"
          style={{
            animation: "fade-in-up 0.5s ease-out 0.5s both",
          }}
        >
          <p className="text-sm sm:text-base text-muted max-w-3xl mx-auto">
            <span className="font-semibold text-foreground">Lianata</span> adalah platform
            manajemen keuangan yang{" "}
            <span className="font-semibold text-primary-600">100% gratis</span>. Kami tidak
            menjual data, tidak menampilkan iklan, dan tidak mengunci fitur.
          </p>
        </div>
      </div>
    </section>
  )
}