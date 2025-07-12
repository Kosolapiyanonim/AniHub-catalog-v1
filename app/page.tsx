// /app/page.tsx
import { HeroSlider } from "@/components/HeroSlider";
import { AnimeCarousel } from "@/components/AnimeCarousel";
import { LoadingSpinner } from "@/components/loading-spinner";
import { TrendingUp, Star, Zap, CheckCircle } from "lucide-react";
import { Suspense } from "react";

// Определяем типы данных, которые мы ожидаем от API
interface Anime {
  id: number;
  shikimori_id: string;
  title: string;
  poster_url?: string | null;
  year?: number | null;
  description?: string;
}

interface HomePageData {
  hero?: Anime[] | null;
  trending?: Anime[] | null;
  popular?: Anime[] | null;
  recentlyCompleted?: Anime[] | null;
  latestUpdates?: Anime[] | null;
}

// Асинхронная функция для загрузки данных
async function getHomePageData(): Promise<HomePageData> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/homepage-sections`, {
      cache: 'no-store', 
    });
    
    if (!response.ok) {
      console.error("Failed to fetch homepage data:", response.statusText);
      return {};
    }
    
    return response.json();
  } catch (error) {
    console.error("Error in getHomePageData:", error);
    return {};
  }
}

// Основной компонент главной страницы
export default async function HomePage() {
  const data = await getHomePageData();

  // Отфильтровываем пустые данные для надежности
  const cleanHeroItems = data.hero?.filter(Boolean) || [];
  const cleanTrendingItems = data.trending?.filter(Boolean) || [];
  const cleanPopularItems = data.popular?.filter(Boolean) || [];
  const cleanLatestUpdates = data.latestUpdates?.filter(Boolean) || [];
  const cleanRecentlyCompleted = data.recentlyCompleted?.filter(Boolean) || [];

  return (
    <div className="min-h-screen bg-slate-900">
      {/* HeroSlider теперь сам управляет поэтапной загрузкой */}
      <HeroSlider initialItems={cleanHeroItems} />

      <main className="container mx-auto px-4 py-12 space-y-12">
        <Suspense fallback={<LoadingSpinner />}>
          <AnimeCarousel 
            title="Тренды сезона" 
            items={cleanTrendingItems} 
            viewAllLink="/catalog?sort=updated_at"
            icon={<TrendingUp />}
          />
        </Suspense>
        
        <Suspense fallback={<LoadingSpinner />}>
          <AnimeCarousel 
            title="Самое популярное" 
            items={cleanPopularItems} 
            viewAllLink="/catalog?sort=shikimori_votes"
            icon={<Star />}
          />
        </Suspense>
        
        <Suspense fallback={<LoadingSpinner />}>
          <AnimeCarousel 
            title="Последние обновления" 
            items={cleanLatestUpdates} 
            viewAllLink="/catalog?sort=updated_at_kodik"
            icon={<Zap />}
          />
        </Suspense>

        <Suspense fallback={<LoadingSpinner />}>
          <AnimeCarousel 
            title="Недавно завершенные" 
            items={cleanRecentlyCompleted} 
            viewAllLink="/catalog?status=released"
            icon={<CheckCircle />}
          />
        </Suspense>
      </main>
    </div>
  );
}
