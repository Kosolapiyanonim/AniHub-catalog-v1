// /app/page.tsx
import { HeroSlider } from "@/components/HeroSlider"
import { AnimeCarousel } from "@/components/AnimeCarousel"
import { LoadingSpinner } from "@/components/loading-spinner"
import { TrendingUp, Star, RotateCw } from "lucide-react" // <-- Импортируем новую иконку
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
        {/* Существующая секция "Тренды сезона" */}
        <Suspense fallback={<LoadingSpinner />}>
          <AnimeCarousel
            title="Тренды сезона"
            items={data.trending}
            viewAllLink="/catalog?sort=shikimori_rating" // <-- Исправлено на правильную сортировку
            icon={<TrendingUp />}
          />
        </Suspense>
        
        {/* Существующая секция "Самое популярное" */}
        <Suspense fallback={<LoadingSpinner />}>
          <AnimeCarousel
            title="Самое популярное"
            items={data.popular}
            viewAllLink="/catalog?sort=shikimori_votes"
            icon={<Star />}
          />
        </Suspense>

        {/* НОВАЯ секция "Недавно обновленные" */}
        <Suspense fallback={<LoadingSpinner />}>
          <AnimeCarousel
            title="Недавно обновленные"
            items={data.latestUpdates} // <-- Используем новые данные
            viewAllLink="/catalog?sort=updated_at_kodik" // <-- Ссылка на каталог с правильной сортировкой
            icon={<RotateCw />} // <-- Используем новую иконку
          />
        </Suspense>
      </main>
    </div>
  )
}