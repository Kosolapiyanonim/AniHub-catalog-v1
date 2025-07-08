// /app/catalog/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimeCard } from '@/components/anime-card';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Button } from '@/components/ui/button';
// Убедитесь, что вы используете ваш новый компонент catalog-filters
import { CatalogFilters, type FiltersState } from '@/components/catalog-filters'; 
import { useSearchParams } from 'next/navigation';

// --- Типы и константы ---
interface Anime {
  id: number;
  shikimori_id: string;
  title: string;
  poster_url?: string;
  year?: number;
}

// ИЗМЕНЕНИЕ: Константа теперь соответствует новому, упрощенному интерфейсу FiltersState
const INITIAL_FILTERS: FiltersState = {
  page: 1,
  limit: 24,
  sort: 'shikimori_rating',
  title: '',
  yearFrom: '',
  yearTo: '',
  episodesFrom: '',
  episodesTo: '',
  type: [],
};

// --- Основной компонент страницы ---
export default function CatalogPage() {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const searchParams = useSearchParams();

  // Инициализируем фильтры, учитывая параметры из URL
  const [filters, setFilters] = useState<FiltersState>(() => {
    const initialTitle = searchParams.get('title') || '';
    return { ...INITIAL_FILTERS, title: initialTitle };
  });

  const fetchCatalogData = useCallback(async (currentFilters: FiltersState, isNewFilter = false) => {
    if (isNewFilter) { setLoading(true); setAnimes([]); } 
    else { setLoadingMore(true); }
    setError(null);

    const params = new URLSearchParams();
    
    // Динамически добавляем все фильтры в параметры запроса
    Object.entries(currentFilters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        params.append(key, value.join(','));
      } else if (typeof value === 'string' && value) {
        params.append(key, value);
      } else if (typeof value === 'number') {
        params.append(key, value.toString());
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

  const handleApplyFilters = () => {
    // При применении фильтров всегда сбрасываем на первую страницу
    const filtersToApply = { ...filters, page: 1 };
    fetchCatalogData(filtersToApply, true);
  };
  
  // ИЗМЕНЕНИЕ: Функция сброса теперь использует новую константу
  const handleResetFilters = () => {
      setFilters(INITIAL_FILTERS);
      fetchCatalogData(INITIAL_FILTERS, true);
  }

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const newPage = filters.page + 1;
      // Обновляем состояние страницы перед запросом
      setFilters(prev => ({ ...prev, page: newPage }));
      fetchCatalogData({ ...filters, page: newPage }, false);
    }
  };

  // Первоначальная загрузка данных при монтировании и при изменении параметров URL
  useEffect(() => {
    fetchCatalogData(filters, true);
  }, []); // Запускаем только один раз при первой загрузке

  return (
    <div className="container mx-auto px-4 pt-20">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-80 lg:sticky top-20 h-full">
            {/* ИЗМЕНЕНИЕ: Пропсы onApply и onReset соответствуют новому компоненту */}
          <CatalogFilters 
                filters={filters}
                onFiltersChange={setFilters}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
            />
        </aside>

        <main className="flex-1">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Каталог</h1>
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
                  <AnimeCard key={`${anime.shikimori_id}-${anime.id}`} anime={anime} />
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
