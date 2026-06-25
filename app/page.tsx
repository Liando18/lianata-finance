import Navbar from "@/app/components/landing/navbar"
import Hero from "@/app/components/landing/hero"
import Features from "@/app/components/landing/features"
import Banner from "@/app/components/landing/banner"
import WhyLianata from "@/app/components/landing/why-lianata"
import HowItWorks from "@/app/components/landing/how-it-works"
import Pricing from "@/app/components/landing/pricing"
import CTASection from "@/app/components/landing/cta-section"
import Footer from "@/app/components/landing/footer"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        <Hero />
        <Features />
        <Banner />
        <WhyLianata />
        <HowItWorks />
        <Pricing />
        <CTASection />
      </main>

      <Footer />
    </div>
  )
}