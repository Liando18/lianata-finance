import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Providers } from "@/app/components/providers"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const siteUrl = process.env.BETTER_AUTH_URL || "https://lianata-finance.vercel.app"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: "%s | Lianata Finance",
    default: "Lianata Finance - Kelola Keuangan dengan Mudah & Cerdas",
  },
  description:
    "Catat pemasukan dan pengeluaran, buat budget, pantau laporan keuangan — semua dalam satu platform yang simpel dan elegan.",
  keywords: ["manajemen keuangan", "aplikasi keuangan", "budget", "catatan keuangan", "lianata finance", "finance app"],
  authors: [{ name: "Aprilian Gevindo" }, { name: "Hesti Ananta" }],
  creator: "Aprilian Gevindo & Hesti Ananta",
  publisher: "Lianata Finance",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  alternates: { canonical: siteUrl },
  openGraph: {
    title: "Lianata Finance",
    description: "Catat pemasukan dan pengeluaran, buat budget, pantau laporan keuangan — semua dalam satu platform.",
    url: siteUrl,
    siteName: "Lianata Finance",
    locale: "id_ID",
    type: "website",
    images: [{ url: "/logo-lianata-finance.png", width: 512, height: 512, alt: "Lianata Finance" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lianata Finance",
    description: "Kelola keuangan dengan mudah & cerdas — catat, pantau, dan kendalikan keuanganmu.",
    images: ["/logo-lianata-finance.png"],
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }, { url: "/logo-lianata-finance.png", sizes: "512x512" }],
    apple: [{ url: "/logo-lianata-finance.png" }],
  },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Lianata Finance",
  url: siteUrl,
  description: "Aplikasi manajemen keuangan untuk mencatat pemasukan, pengeluaran, budget, dan laporan keuangan.",
  applicationCategory: "FinanceApplication",
  operatingSystem: "All",
  author: [{ "@type": "Person", name: "Aprilian Gevindo" }, { "@type": "Person", name: "Hesti Ananta" }],
  offers: { "@type": "Offer", price: "0", priceCurrency: "IDR" },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
