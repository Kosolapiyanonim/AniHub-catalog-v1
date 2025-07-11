// /app/catalog/page.tsx
"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimeCard } from "@/components/anime-card";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { CatalogFilters, type FiltersState } from "@/components/catalog-filters";
import { ArrowLeft } from "lucide-react";

interface Anime {
  id: number;
  shikimori_id: string;
  title: string;
  poster_url?: string | null;
  year?: number | null;
}

// Начальное состояние для фильтров
const INITIAL_FILTERS: FiltersState = {
  title: "",
  sort: "weighted_rating",
  year_from: "",
  year_to: "",
  rating_from: "",
  rating_to: "",
  episodes_from: "",
  episodes_to: "",
  genres: [],
  genres_exclude: [],
  studios: [],
  studios_exclude: [],
  types: [],
  statuses: [],
};

function CatalogView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Функция для построения URL из объекта фильтров
  const buildUrl = (filters: FiltersState, page: number) => {
    const params = new URLSearchParams();
    // Преобразуем объект фильтров в параметры URL
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        params.append(key, value.join(','));
      } else if (typeof value === 'string' && value) {
        params.append(key, value);
      }
    });
    params.append('page', page.toString());
    return `/api/catalog?${params.toString()}`;
  };

  // Функция для загрузки данных
  const fetchData = useCallback(async (filters: FiltersState, page: number) => {
    if (page === 1) {
      setLoading(true);
      setAnimes([]);
    } else {
      setLoadingMore(true);
    }

    try {
      const url = buildUrl(filters, page);
      const response = await fetch(url);
      if (!response.ok) throw new Error("Ошибка сети");
      
      const data = await response.json();
      
      setAnimes(prev => (page === 1 ? data.results : [...prev, ...data.results]));
      setHasMore(data.hasMore);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Функция, которую вызывает компонент фильтров
  const handleApplyFilters = (newFilters: FiltersState) => {
    setCurrentPage(1);
    fetchData(newFilters, 1);
    // Обновляем URL в браузере для возможности поделиться ссылкой
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length > 0) params.set(key, value.join(','));
        else if (typeof value === 'string' && value) params.set(key, value);
    });
    router.push(`/catalog?${params.toString()}`);
  };

  const handleResetFilters = () => {
    setCurrentPage(1);
    fetchData(INITIAL_FILTERS, 1);
    router.push('/catalog');
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      // Нужно получить текущие фильтры из URL или хранить их в состоянии
      // Для простоты пока будем считать, что фильтры не меняются при пагинации
      const currentFilters = {} as FiltersState; // Тут нужно будет взять фильтры из состояния
      fetchData(currentFilters, nextPage);
    }
  };

  // Начальная загрузка данных на основе URL
  useEffect(() => {
    // Здесь мы должны будем распарсить searchParams и установить initialFilters
    // А затем вызвать fetchData
    fetchData(INITIAL_FILTERS, 1);
  }, [fetchData]);


  return (
    <div className="container mx-auto px-4 pt-20">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-80 lg:max-w-xs shrink-0">
          <CatalogFilters
            initialFilters={INITIAL_FILTERS}
            onApply={handleApplyFilters}
            onReset={handleResetFilters}
          />
        </aside>

        <main className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-white">Каталог аниме</h1>
            {!loading && <span className="text-muted-foreground text-sm">Найдено: {total}</span>}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
              {/* Скелетоны для загрузки */}
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-slate-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                {animes.map((anime, index) => (
                  <AnimeCard key={`${anime.shikimori_id}-${index}`} anime={anime} />
                ))}
              </div>
              {hasMore && (
                <div className="text-center mt-8">
                  <Button onClick={loadMore} disabled={loadingMore}>
                    {loadingMore ? <LoadingSpinner size="sm" /> : "Загрузить еще"}
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

// Обертка для Suspense, обязательная для useSearchParams
export default function CatalogPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>}>
      <CatalogView />
    </Suspense>
  );
}
