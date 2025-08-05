// /app/page.tsx
import { HeroSlider } from "@/components/HeroSlider"
import { AnimeCarousel } from "@/components/AnimeCarousel"
import { LoadingSpinner } from "@/components/loading-spinner"
import { TrendingUp, Star, RotateCw } from "lucide-react"
import { Suspense } from "react"
import { getHomePageData } from "@/lib/data-fetchers"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const data = await getHomePageData()

  return (
    <>
      {/* HeroSlider теперь действительно вне любого контейнера с px-4 */}
      {/* Он растягивается на 100% ширины, так как находится в div.flex-1 в layout.tsx */}
      <div className="min-h-screen bg-slate-900">
      <HeroSlider items={data.hero} />
      
      {/* Основной контент теперь ЯВНО обернут в container */}
      {/* Этот main рендерится внутри div.flex-1 в layout.tsx, но сам добавляет контейнер */}
      <main className="container mx-auto px-4 py-12 space-y-12">
        <Suspense fallback={<LoadingSpinner />}>
          <AnimeCarousel
            title="Тренды сезона"
            items={data.trending}
            viewAllLink="/catalog?sort=shikimori_rating"
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

        <Suspense fallback={<LoadingSpinner />}>
          <AnimeCarousel
            title="Недавно обновленные"
            items={data.latestUpdates}
            viewAllLink="/catalog?sort=updated_at_kodik"
            icon={<RotateCw />}
          />
        </Suspense>
      </main>
      </div>
    </>
  )
}