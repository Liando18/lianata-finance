import Image from "next/image"
import Link from "next/link"
import { Heart, Coffee } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t border-border bg-gray-50/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/logo-lianata-finance.png"
                alt="Lianata Finance"
                width={32}
                height={32}
                className="object-contain"
              />
              <span className="font-semibold text-foreground">Lianata Finance</span>
            </div>
            <p className="text-sm text-muted max-w-sm leading-relaxed">
              Platform manajemen keuangan pribadi, UMKM, dan toko. 100% gratis, 
              dikembangkan dengan sepenuh hati untuk membantu sesama mengelola keuangan.
            </p>
            <div className="flex items-center gap-1.5 mt-4 text-xs text-muted">
              <Heart className="w-3.5 h-3.5 text-primary-500 fill-primary-500" />
              Dibuat dengan cinta di Indonesia
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Fitur</h4>
            <ul className="space-y-2.5">
              {["Catat Transaksi", "Laporan & Grafik", "Budget Planning", "Multiple Dompet"].map(
                (item) => (
                  <li key={item}>
                    <span className="text-sm text-muted cursor-default">
                      {item}
                    </span>
                  </li>
                ),
              )}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Dukung Kami</h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-amber-600 transition-colors"
                >
                  <Coffee className="w-3.5 h-3.5" />
                  Traktir Kopi
                </Link>
              </li>
              <li>
                <span className="text-xs text-muted">Donasi akan segera hadir</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} Lianata Finance. All rights reserved.
          </p>
          <p className="text-xs text-muted">
            Dikembangkan oleh <span className="font-medium text-foreground">Aprilian Gevindo</span> &amp; <span className="font-medium text-foreground">Hesti Ananta</span>
          </p>
          <div className="flex items-center gap-1 text-xs text-muted">
            <Heart className="w-3 h-3 text-primary-500 fill-primary-500" />
            Gratis selamanya
          </div>
        </div>
      </div>
    </footer>
  )
}