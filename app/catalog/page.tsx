// /app/catalog/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimeCard } from "@/components/anime-card";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { CatalogFilters, type FiltersState, DEFAULT_FILTERS } from "@/components/catalog-filters";
import { AnimeGrid } from "@/components/anime-grid";
import { HeroSection } from "@/components/hero-section";
import { getCatalogAnime, getGenres, getStatuses, getStudios, getTypes, getYears } from "@/lib/data-fetchers";

interface Anime {
  id: number;
  shikimori_id: string;
  title: string;
  poster_url?: string | null;
  year?: number | null;
  user_list_status?: string | null;
  // Добавляем поля для HoverCard
  description?: string;
  type?: string;
  genres?: { name: string }[];
  shikimori_rating?: number;
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
    tags: params.get('tags')?.split(',') || [],
    tags_exclude: params.get('tags_exclude')?.split(',') || [],
    user_list_status: params.get('user_list_status') || '',
});

async function fetchCatalogData(searchParams: { [key: string]: string | string[] | undefined }) {
  const { animes, totalPages } = await getCatalogAnime(searchParams);
  const genres = await getGenres();
  const statuses = await getStatuses();
  const studios = await getStudios();
  const types = await getTypes();
  const years = await getYears();

  return { animes, totalPages, genres, statuses, studios, types, years };
}

function CatalogView({ animes, totalPages, genres, statuses, studios, types, years }: { animes: Anime[], totalPages: number, genres: any[], statuses: any[], studios: any[], types: any[], years: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currentFilters, setCurrentFilters] = useState<FiltersState>(() => parseUrlToFilters(searchParams));

  const handleApplyFilters = useCallback((newFilters: FiltersState) => {
    setCurrentFilters(newFilters);
    router.push(`/catalog?${new URLSearchParams(Object.entries(newFilters)).toString()}`, { scroll: false });
  }, [router]);

  return (
    <div className="container mx-auto px-4 py-8">
      <HeroSection title="Каталог аниме" description="Исследуйте нашу обширную коллекцию аниме." />
      <CatalogFilters genres={genres} statuses={statuses} studios={studios} types={types} years={years} initialFilters={currentFilters} onApply={handleApplyFilters} />
      <AnimeGrid animes={animes} totalPages={totalPages} />
    </div>
  );
}

export default async function CatalogPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const { animes, totalPages, genres, statuses, studios, types, years } = await fetchCatalogData(searchParams);

  return (
    <CatalogView animes={animes} totalPages={totalPages} genres={genres} statuses={statuses} studios={studios} types={types} years={years} />
  );
}
