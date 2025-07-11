// /app/catalog/page.tsx
"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimeCard } from "@/components/anime-card";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { CatalogFilters, type FiltersState, DEFAULT_FILTERS } from "@/components/catalog-filters";

interface Anime {
  id: number;
  shikimori_id: string;
  title: string;
  poster_url?: string | null;
  year?: number | null;
  user_list_status?: string | null;
}

const parseUrlToFilters = (params: URLSearchParams): FiltersState => ({
    ...DEFAULT_FILTERS,
    title: params.get('title') || '', 
    sort: params.get('sort') || 'shikimori_votes',
    year_from: params.get('year_from') || '',
    year_to: params.get('year_to') || '',
    genres: params.get('genres')?.split(',') || [], 
    genres_exclude: params.get('genres_exclude')?.split(',') || [],
    studios: params.get('studios')?.split(',') || [], 
    studios_exclude: params.get('studios_exclude')?.split(',') || [],
    types: params.get('types')?.split(',') || [], 
    statuses: params.get('statuses')?.split(',') || [],
    user_list_status: params.get('user_list_status') || '',
});

function CatalogView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [animes, setAnimes] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [currentFilters, setCurrentFilters] = useState<FiltersState>(() => parseUrlToFilters(searchParams));

  const fetchData = useCallback(async (filters: FiltersState, pageNum: number) => {
    const isNewSearch = pageNum === 1;
    if (isNewSearch) setLoading(true); else setLoadingMore(true);

    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) params.append(key, value.join(','));
      else if (typeof value === 'string' && value) params.append(key, value);
    });
    params.set('page', pageNum.toString());
    params.set('limit', '25');

    try {
      const response = await fetch(`/api/catalog?${params.toString()}`);
      if (!response.ok) throw new Error("Ошибка сети");
      const data = await response.json();
      
      setAnimes(prev => (isNewSearch ? data.results : [...prev, ...data.results]));
      setHasMore(data.hasMore);
      setTotal(data.total);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); setLoadingMore(false); }
  }, []);

  const handleApplyFilters = useCallback((newFilters: FiltersState) => {
    setPage(1);
    setCurrentFilters(newFilters);
    fetchData(newFilters, 1);

    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
        const filterKey = key as keyof FiltersState;
        if (JSON.stringify(value) !== JSON.stringify(DEFAULT_FILTERS[filterKey])) {
            if (Array.isArray(value) && value.length > 0) {
                params.set(key, value.join(','));
            } else if (typeof value === 'string' && value) {
                params.set(key, value);
            }
        }
    });
    const newUrl = params.toString() ? `/catalog?${params.toString()}` : '/catalog';
    router.push(newUrl, { scroll: false });
  }, [fetchData, router]);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchData(currentFilters, nextPage);
    }
  };

  useEffect(() => {
    const initialFilters = parseUrlToFilters(searchParams);
    setCurrentFilters(initialFilters);
    setPage(1);
    fetchData(initialFilters, 1);
  }, [searchParams, fetchData]);

  return (
    <div className="container mx-auto px-4 pt-20">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-80 lg:max-w-xs shrink-0">
          <CatalogFilters initialFilters={currentFilters} onApply={handleApplyFilters} />
        </aside>

        <main className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-white">Каталог аниме</h1>
            {!loading && <span className="text-muted-foreground text-sm">Найдено: {total}</span>}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 25 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-slate-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : animes.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {animes.map((anime, index) => (
                  <AnimeCard key={`${anime.shikimori_id}-${index}`} anime={anime} priority={index < 10} />
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
          ) : (
            <div className="text-center py-16">
                <p className="text-lg text-gray-400">По вашим фильтрам ничего не найдено</p>
                <p className="text-sm text-gray-500 mt-2">Попробуйте изменить или сбросить фильтры</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Обертка для Suspense
export default function CatalogPageWrapper() {
  return (
    <Suspense>
      <CatalogView />
    </Suspense>
  );
}
