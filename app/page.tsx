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
}

interface HomePageData {
  hero?: Anime[] | null;
  trending?: Anime[] | null;
  popular?: Anime[] | null;
  recentlyCompleted?: Anime[] | null;
  latestUpdates?: Anime[] | null;
  continueWatching?: (Anime & { progress: number })[] | null;
  myUpdates?: Anime[] | null;
}

// Асинхронная функция для загрузки данных
async function getHomePageData(): Promise<HomePageData> {
  try {
    // Делаем запрос к нашему API. 'force-dynamic' гарантирует, что данные будут свежими.
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/homepage-sections`, {
      cache: 'no-store', 
    });
    
    if (!response.ok) {
      // В случае ошибки возвращаем пустые данные
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

  return (
    <div className="min-h-screen bg-slate-900">
      <HeroSlider items={data.hero} />

      <main className="container mx-auto px-4 py-12 space-y-12">
        {/* Оборачиваем каждую секцию в Suspense для лучшего UX */}
        <Suspense fallback={<LoadingSpinner />}>
          <AnimeCarousel 
            title="Тренды сезона" 
            items={data.trending} 
            viewAllLink="/catalog?sort=trending"
            icon={<TrendingUp />}
          />
        </Suspense>
        
        <Suspense fallback={<LoadingSpinner />}>
          <AnimeCarousel 
            title="Самое популярное" 
            items={data.popular} 
            viewAllLink="/catalog?sort=popular"
            icon={<Star />}
          />
        </Suspense>
        
        <Suspense fallback={<LoadingSpinner />}>
          <AnimeCarousel 
            title="Последние обновления" 
            items={data.latestUpdates} 
            viewAllLink="/catalog?sort=updated_at"
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

        {/* Персональные блоки (Мои обновления, Продолжить просмотр) 
          будут добавлены здесь на следующем этапе, когда мы будем делать страницу профиля.
          Сейчас API уже отдает для них данные, если пользователь авторизован.
        */}
      </main>
    </div>
  );
}
