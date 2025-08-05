// /app/page.tsx
import { HeroSlider } from "@/components/HeroSlider";
// Импортируем клиентский компонент обертку
import AnimeCarouselClient from "@/components/AnimeCarouselClient";
import { Suspense } from "react";
import { getHomePageData } from "@/lib/data-fetchers";
import { SuspenseFallback } from "@/components/suspense-fallback";
import { TrendingUp, Star } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getHomePageData();

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Оборачиваем HeroSlider в контейнер, чтобы он имел те же отступы, что и основной контент */}
      <div className="container mx-auto px-4">
        <Suspense fallback={<SuspenseFallback type="hero" />}>
          <HeroSlider items={data.hero} />
        </Suspense>
      </div>
      <main className="container mx-auto px-4 py-12 space-y-12">
        <Suspense fallback={<SuspenseFallback type="carousel" />}>
          {/* Используем клиентский компонент */}
          <AnimeCarouselClient
            title="Тренды сезона"
            items={data.trending}
            viewAllLink="/catalog?sort=updated_at"
            icon={<TrendingUp />}
          />
        </Suspense>
        <Suspense fallback={<SuspenseFallback type="carousel" />}>
          {/* Используем клиентский компонент */}
          <AnimeCarouselClient
            title="Самое популярное"
            items={data.popular}
            viewAllLink="/catalog?sort=shikimori_votes"
            icon={<Star />}
          />
        </Suspense>
      </main>
    </div>
  );
}