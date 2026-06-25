import { Infinity, Lock, Zap, HeartHandshake } from "lucide-react"

const reasons = [
  {
    icon: Infinity,
    title: "100% Gratis Selamanya",
    description: "Tidak ada biaya langganan, tidak ada fitur premium. Semua fitur bisa kamu gunakan tanpa batas.",
    color: "from-primary-400 to-primary-600",
    bg: "bg-primary-50",
    iconColor: "text-primary-600",
  },
  {
    icon: Lock,
    title: "Data Kamu Aman",
    description: "Semua data transaksi dienkripsi dan disimpan di server aman. Kami tidak akan pernah menjual data kamu.",
    color: "from-emerald-400 to-emerald-600",
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    icon: Zap,
    title: "Cepat & Responsif",
    description: "Dibangun dengan teknologi modern untuk pengalaman yang cepat, mulus, dan nyaman di perangkat apa pun.",
    color: "from-amber-400 to-amber-600",
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    icon: HeartHandshake,
    title: "Dibuat dengan Sepenuh Hati",
    description: "Lianata dikembangkan oleh anak bangsa untuk membantu sesama mengelola keuangan dengan lebih baik.",
    color: "from-rose-400 to-rose-600",
    bg: "bg-rose-50",
    iconColor: "text-rose-600",
  },
]

export default function Testimonials() {
  return (
    <section className="py-16 sm:py-28 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(193,42,88,0.02)_0%,transparent_50%)]" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
            <HeartHandshake className="w-3.5 h-3.5" />
            Kenapa Lianata?
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-foreground px-2">
            Dibuat untuk{" "}
            <span className="bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
              Semua Orang
            </span>
          </h2>
          <p className="mt-3 text-sm sm:text-lg text-muted max-w-2xl mx-auto">
            Kami percaya mengelola keuangan adalah hak semua orang, bukan hanya yang mampu bayar.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          {reasons.map((item, index) => (
            <div
              key={item.title}
              className="group relative p-5 sm:p-6 rounded-2xl border border-border/60 bg-white hover:border-primary-200/80 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              style={{
                animation: `slide-up 0.5s ease-out ${0.1 + index * 0.1}s both`,
              }}
            >
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${item.bg} flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-110 transition-transform duration-300`}
              >
                <item.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${item.iconColor}`} />
              </div>

              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1.5 sm:mb-2 group-hover:text-primary-700 transition-colors">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                {item.description}
              </p>

              <div
                className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${item.color} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-full`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}