import { HeroSection } from "@/components/hero-section"
import { AnimeGrid } from "@/components/anime-grid"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <HeroSection />
      <main className="container mx-auto px-4 py-16">
        <AnimeGrid />
      </main>
      <Footer />
    </div>
  )
}
