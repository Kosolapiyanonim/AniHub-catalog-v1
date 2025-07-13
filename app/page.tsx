// /app/page.tsx

import { HeroSlider } from "@/components/HeroSlider";
import { AnimeCarousel } from "@/components/AnimeCarousel";
import { LoadingSpinner } from "@/components/loading-spinner";
import { TrendingUp, Star, Zap, CheckCircle } from "lucide-react";
import { Suspense } from "react";
import { getHomePageData } from "@/lib/data-fetchers"; // <-- ИМПОРТИРУЕМ НАШУ НОВУЮ ФУНКЦИЮ

// Принудительно делаем страницу динамической, чтобы она всегда запрашивала свежие данные
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Вызываем функцию напрямую, вместо fetch
  const data = await getHomePageData();
  
  // Добавляем лог, чтобы видеть данные на сервере (в логах Vercel)
  console.log('Hero items fetched on server:', data.hero?.length || 0);

  return (
    <div className="min-h-screen bg-slate-900">
      <HeroSlider items={data.hero} />

      <main className="container mx-auto px-4 py-12 space-y-12">
        {/* ... остальные карусели ... */}
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
  );
}
