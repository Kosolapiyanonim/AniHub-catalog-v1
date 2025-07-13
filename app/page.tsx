import { HeroSlider } from "@/components/HeroSlider";
import { AnimeCarousel } from "@/components/AnimeCarousel";
import { LoadingSpinner } from "@/components/loading-spinner";
import { TrendingUp, Star, Zap, CheckCircle, History, BellRing } from "lucide-react";
import { Suspense } from "react";
import { getHomePageData } from "@/lib/data-fetchers";

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const data = await getHomePageData();

  return (
    <div className="min-h-screen bg-slate-900">
      <HeroSlider items={data.hero} />

      <main className="container mx-auto px-4 py-12 space-y-12">
        
        {data.continueWatching && data.continueWatching.length > 0 && (
          <Suspense fallback={<LoadingSpinner />}>
            <AnimeCarousel 
              title="Продолжить просмотр" 
              items={data.continueWatching}
              icon={<History />}
            />
          </Suspense>
        )}

        {data.myUpdates && data.myUpdates.length > 0 && (
          <Suspense fallback={<LoadingSpinner />}>
            <AnimeCarousel 
              title="Мои обновления" 
              items={data.myUpdates}
              icon={<BellRing />}
            />
          </Suspense>
        )}

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
        
        <Suspense fallback={<LoadingSpinner />}>
          <AnimeCarousel 
            title="Последние обновления" 
            items={data.latestUpdates} 
            viewAllLink="/catalog?sort=updated_at_kodik"
            icon={<Zap />}
          />
        </Suspense>

        <Suspense fallback={<LoadingSpinner />}>
          <AnimeCarousel 
            title="Недавно завершенные" 
            items={data.recentlyCompleted} 
            viewAllLink="/catalog?status=released"
            icon={<CheckCircle />}
          />
        </Suspense>
      </main>
    </div>
  );
}
