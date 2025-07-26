// /app/page.tsx
import { HeroSlider } from "@/components/HeroSlider"
import { AnimeCarousel } from "@/components/AnimeCarousel"
import { LoadingSpinner } from "@/components/loading-spinner"
import { TrendingUp, Star } from "lucide-react"
import { Suspense } from "react"
import { getHomePageData } from "@/lib/data-fetchers"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const data = await getHomePageData()

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Оборачиваем HeroSlider в контейнер, чтобы он имел те же отступы, что и основной контент */}
      <div className="container mx-auto px-4">
        <HeroSlider items={data.hero} />
      </div>
      <main className="container mx-auto px-4 py-12 space-y-12">
        <Suspense fallback={<LoadingSpinner />}>
          <AnimeCarousel
            title="Тренды сезона"
            items={data.trending}
            viewAllLink="/catalog?sort=updated_at"
            icon={<TrendingUp />}
          />
        </Suspense>
        <Suspense fallback={<LoadingSpinner />}>
          <AnimeCarousel
            title="Самое популярное"
            items={data.popular}
            viewAllLink="/catalog?sort=shikimori_votes"
            icon={<Star />}
          />
        </Suspense>
      </main>
    </div>
  )
}
