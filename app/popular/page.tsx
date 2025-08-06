// app/popular/page.tsx

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, Calendar, Flame } from 'lucide-react'
import { AnimeCard } from "@/components/anime-card"
import { getPopularAnime } from "@/lib/data-fetchers";
import { AnimeGrid } from "@/components/anime-grid";
import { HeroSection } from "@/components/hero-section";

// Интерфейс для данных аниме
interface Anime {
  id: number;
  shikimori_id: string;
  // ... и другие поля, которые приходят от /api/catalog
}

export default async function PopularPage() {
  const popularAnime = await getPopularAnime();

  return (
    <div className="min-h-screen bg-slate-900 pt-16 pb-16">
      <div className="container mx-auto px-4 py-8">
        <HeroSection title="Популярное аниме" description="Самые просматриваемые и обсуждаемые аниме." />
        <AnimeGrid animes={popularAnime} />
      </div>
    </div>
  );
}
