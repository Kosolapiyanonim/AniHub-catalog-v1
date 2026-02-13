"use client";

import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Star, Search, Check, X, Save, RefreshCw } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface Anime {
  id: number;
  shikimori_id: string;
  title: string;
  poster_url: string | null;
  shikimori_rating: number | null;
  shikimori_votes: number | null;
  is_featured_in_hero: boolean;
  hero_position: number | null;
  hero_custom_image_url: string | null;
}

interface HeroSlide {
  animeId: number;
  position: number;
  customImageUrl: string;
}

export default function HeroManagementPage() {
  const [heroAnimes, setHeroAnimes] = useState<Anime[]>([]);
  const [popularAnimes, setPopularAnimes] = useState<Anime[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSlides, setSelectedSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const filteredAnimes = useMemo(() => {
    if (!searchQuery.trim()) return popularAnimes;

    const query = searchQuery.toLowerCase();
    return popularAnimes.filter(
      (anime) => anime.title.toLowerCase().includes(query) || anime.shikimori_id.toLowerCase().includes(query)
    );
  }, [searchQuery, popularAnimes]);

  const selectedById = useMemo(() => new Set(selectedSlides.map((slide) => slide.animeId)), [selectedSlides]);

  const heroWithMeta = useMemo(() => {
    const animeMap = new Map(popularAnimes.map((anime) => [anime.id, anime]));

    return [...selectedSlides]
      .sort((a, b) => a.position - b.position)
      .map((slide, index) => ({
        ...slide,
        position: index + 1,
        anime: animeMap.get(slide.animeId) || heroAnimes.find((anime) => anime.id === slide.animeId),
      }))
      .filter((item) => item.anime);
  }, [heroAnimes, popularAnimes, selectedSlides]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/hero");
      if (!response.ok) throw new Error("Ошибка при загрузке данных");

      const data = await response.json();
      const nextHero = data.heroAnimes || [];
      setHeroAnimes(nextHero);
      setPopularAnimes(data.popularAnimes || []);

      const slides = [...nextHero]
        .sort((a: Anime, b: Anime) => (a.hero_position ?? Number.MAX_SAFE_INTEGER) - (b.hero_position ?? Number.MAX_SAFE_INTEGER))
        .map((anime: Anime, index: number) => ({
          animeId: anime.id,
          position: anime.hero_position ?? index + 1,
          customImageUrl: anime.hero_custom_image_url || "",
        }));

      setSelectedSlides(slides);
    } catch (error) {
      console.error("Ошибка загрузки:", error);
      toast.error("Не удалось загрузить данные");
    } finally {
      setLoading(false);
    }
  };

  const toggleAnimeSelection = (animeId: number) => {
    setSelectedSlides((prev) => {
      const exists = prev.find((slide) => slide.animeId === animeId);
      if (exists) return prev.filter((slide) => slide.animeId !== animeId);

      if (prev.length >= 10) {
        toast.error("Можно выбрать максимум 10 аниме для Hero-секции");
        return prev;
      }

      const maxPosition = prev.reduce((max, slide) => Math.max(max, slide.position), 0);
      return [...prev, { animeId, position: maxPosition + 1, customImageUrl: "" }];
    });
  };

  const updateSlide = (animeId: number, patch: Partial<HeroSlide>) => {
    setSelectedSlides((prev) => prev.map((slide) => (slide.animeId === animeId ? { ...slide, ...patch } : slide)));
  };

  const saveChanges = async () => {
    if (selectedSlides.length === 0) {
      toast.error("Выберите хотя бы одно аниме");
      return;
    }

    if (selectedSlides.length > 10) {
      toast.error("Можно выбрать максимум 10 аниме для Hero-секции");
      return;
    }

    const normalizedSlides = [...selectedSlides]
      .sort((a, b) => a.position - b.position)
      .map((slide, index) => ({
        animeId: slide.animeId,
        position: index + 1,
        customImageUrl: slide.customImageUrl.trim() || null,
      }));

    setSaving(true);
    try {
      const response = await fetch("/api/admin/hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set",
          slides: normalizedSlides,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Ошибка при сохранении");
      }

      toast.success("Hero-слайды успешно обновлены");
      await loadData();
    } catch (error) {
      console.error("Ошибка сохранения:", error);
      toast.error(error instanceof Error ? error.message : "Не удалось сохранить изменения");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24 min-h-screen">
      <Card className="max-w-7xl mx-auto mb-6">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <Star className="text-yellow-500" />
            Управление Hero-секцией
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Выберите до 10 аниме, настройте порядок слайдов и при необходимости задайте свой URL фонового изображения.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <Badge variant="secondary">Выбрано: {selectedSlides.length} / 10</Badge>
            <Button onClick={saveChanges} disabled={saving || selectedSlides.length === 0} className="gap-2">
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Сохранить изменения
            </Button>
          </div>

          {heroWithMeta.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Текущие Hero-слайды</h3>
              <div className="space-y-3">
                {heroWithMeta.map((slide) => (
                  <div key={slide.animeId} className="border rounded-lg p-3 flex flex-col md:flex-row gap-3 md:items-center">
                    <div className="flex items-center gap-3 min-w-0 md:w-[300px]">
                      <div className="relative w-12 h-16 rounded overflow-hidden bg-muted">
                        {slide.anime?.poster_url ? (
                          <Image src={slide.anime.poster_url} alt={slide.anime.title} fill className="object-cover" sizes="48px" />
                        ) : null}
                      </div>
                      <p className="text-sm font-medium truncate">{slide.anime?.title}</p>
                    </div>

                    <div className="flex items-center gap-2 md:w-[180px]">
                      <span className="text-xs text-muted-foreground">Позиция</span>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={slide.position}
                        onChange={(e) => updateSlide(slide.animeId, { position: Number(e.target.value) || 1 })}
                        className="w-20"
                      />
                    </div>

                    <Input
                      placeholder="URL фона для этого слайда (опционально)"
                      value={slide.customImageUrl}
                      onChange={(e) => updateSlide(slide.animeId, { customImageUrl: e.target.value })}
                    />

                    <Button variant="destructive" size="sm" onClick={() => toggleAnimeSelection(slide.animeId)} className="md:w-auto w-full">
                      <X className="w-3 h-3 mr-1" />
                      Удалить
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Поиск аниме по названию или ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <h3 className="text-lg font-semibold mb-3">Каталог для выбора</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[600px] overflow-y-auto">
            {filteredAnimes.map((anime) => (
              <Card
                key={anime.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${selectedById.has(anime.id) ? "ring-2 ring-yellow-500" : ""}`}
                onClick={() => toggleAnimeSelection(anime.id)}
              >
                <div className="relative aspect-[2/3]">
                  {anime.poster_url ? (
                    <Image src={anime.poster_url} alt={anime.title} fill className="object-cover" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw" />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                      <span className="text-xs text-slate-500">Нет постера</span>
                    </div>
                  )}
                  {selectedById.has(anime.id) && (
                    <div className="absolute top-2 right-2 bg-yellow-500 rounded-full p-1">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <CardContent className="p-3">
                  <p className="text-xs font-medium line-clamp-2 mb-1">{anime.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {anime.shikimori_rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {anime.shikimori_rating.toFixed(1)}
                      </div>
                    )}
                    {anime.shikimori_votes && <span>({anime.shikimori_votes.toLocaleString()})</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredAnimes.length === 0 && <div className="text-center py-8 text-muted-foreground">Аниме не найдено</div>}
        </CardContent>
      </Card>
    </div>
  );
}
