// Замените содержимое файла: /app/catalog/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimeCard } from '@/components/anime-card';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Button } from '@/components/ui/button';
import { CatalogFilters } from '@/components/catalog-filters'; // Импортируем новый компонент

// --- Типы и константы ---
interface Anime {
  id: number;
  shikimori_id: string;
  title: string;
  poster_url?: string;
  year?: number;
}

const INITIAL_FILTERS = {
  page: 1, limit: 28, sort: 'shikimori_rating', order: 'desc',
  genres: [], studios: [], yearFrom: '', yearTo: '',
  episodesFrom: '', episodesTo: '', ratingFrom: '', ratingTo: '',
  status: 'all', type: [], title: '',
};

// --- Основной компонент страницы ---
export default function CatalogPage() {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const fetchCatalogData = useCallback(async (currentFilters: any, isNewFilter = false) => {
    if (isNewFilter) { setLoading(true); setAnimes([]); } 
    else { setLoadingMore(true); }
    setError(null);

    const params = new URLSearchParams({
      page: currentFilters.page.toString(),
      limit: currentFilters.limit.toString(),
      sort: currentFilters.sort,
      order: currentFilters.order,
    });
    // Добавляем все фильтры в параметры запроса
    Object.entries(currentFilters).forEach(([key, value]) => {
      if (key !== 'page' && key !== 'limit' && key !== 'sort' && key !== 'order') {
        if (Array.isArray(value) && value.length > 0) {
          params.append(key, value.join(','));
        } else if (typeof value === 'string' && value && value !== 'all') {
          params.append(key, value);
        }
      }
    });

    try {
      const response = await fetch(`/api/catalog?${params.toString()}`);
      if (!response.ok) throw new Error(`Ошибка сети: ${response.statusText}`);
      
      const data = await response.json();
      setAnimes(prev => isNewFilter ? data.results : [...prev, ...data.results]);
      setHasMore(data.hasMore);
      if(isNewFilter) setTotal(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
    } finally {
      setLoading(false); setLoadingMore(false);
    }
  }, []);

  const handleApplyFilters = (newFilters: any) => {
    const filtersToApply = { ...newFilters, page: 1 };
    setFilters(filtersToApply);
    fetchCatalogData(filtersToApply, true);
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const newPage = filters.page + 1;
      const newFilters = { ...filters, page: newPage };
      setFilters(newFilters);
      fetchCatalogData(newFilters, false);
    }
  };

  useEffect(() => {
    fetchCatalogData(INITIAL_FILTERS, true);
  }, [fetchCatalogData]);

  return (
    <div className="container mx-auto px-4 pt-20">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Левая колонка с фильтрами */}
        <aside className="w-full lg:w-80 lg:sticky top-20 h-full">
            <CatalogFilters 
                initialFilters={INITIAL_FILTERS}
                onApplyFilters={handleApplyFilters}
            />
        </aside>

        {/* Правая колонка с контентом */}
        <main className="flex-1">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Результаты</h1>
            {!loading && <span className="text-muted-foreground text-sm">Найдено: {total}</span>}
          </div>

          {loading && animes.length === 0 ? (
            <div className="flex justify-center items-center h-96"><LoadingSpinner size="lg" /></div>
          ) : error ? (
            <div className="text-center text-red-500 py-16">{error}</div>
          ) : animes.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">По вашему запросу ничего не найдено.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {animes.map((anime) => (
                  <AnimeCard key={`${anime.id}-${anime.shikimori_id}`} anime={anime} />
                ))}
              </div>
              {hasMore && (
                <div className="text-center mt-8">
                  <Button onClick={loadMore} disabled={loadingMore}>
                    {loadingMore ? <LoadingSpinner /> : 'Загрузить еще'}
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
