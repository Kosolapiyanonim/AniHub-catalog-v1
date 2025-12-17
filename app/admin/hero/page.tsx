"use client";

import { useState, useEffect } from "react";
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
}

export default function HeroManagementPage() {
  const [heroAnimes, setHeroAnimes] = useState<Anime[]>([]);
  const [popularAnimes, setPopularAnimes] = useState<Anime[]>([]);
  const [filteredAnimes, setFilteredAnimes] = useState<Anime[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAnimes, setSelectedAnimes] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Загружаем данные при монтировании
  useEffect(() => {
    loadData();
  }, []);

  // Фильтруем аниме по поисковому запросу
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredAnimes(popularAnimes);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredAnimes(
        popularAnimes.filter(
          (anime) =>
            anime.title.toLowerCase().includes(query) ||
            anime.shikimori_id.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, popularAnimes]);

  // Инициализируем выбранные аниме из Hero-секции
  useEffect(() => {
    const heroIds = new Set(heroAnimes.map((a) => a.id));
    setSelectedAnimes(heroIds);
  }, [heroAnimes]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/hero");
      if (!response.ok) {
        throw new Error("Ошибка при загрузке данных");
      }
      const data = await response.json();
      setHeroAnimes(data.heroAnimes || []);
      setPopularAnimes(data.popularAnimes || []);
      setFilteredAnimes(data.popularAnimes || []);
    } catch (error) {
      console.error("Ошибка загрузки:", error);
      toast.error("Не удалось загрузить данные");
    } finally {
      setLoading(false);
    }
  };

  const toggleAnimeSelection = (animeId: number) => {
    setSelectedAnimes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(animeId)) {
        newSet.delete(animeId);
      } else {
        newSet.add(animeId);
      }
      return newSet;
    });
  };

  const saveChanges = async () => {
    if (selectedAnimes.size === 0) {
      toast.error("Выберите хотя бы одно аниме");
      return;
    }

    if (selectedAnimes.size > 10) {
      toast.error("Можно выбрать максимум 10 аниме для Hero-секции");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set",
          animeIds: Array.from(selectedAnimes),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Ошибка при сохранении");
      }

      toast.success("Изменения успешно сохранены!");
      await loadData();
    } catch (error) {
      console.error("Ошибка сохранения:", error);
      toast.error(
        error instanceof Error ? error.message : "Не удалось сохранить изменения"
      );
    } finally {
      setSaving(false);
    }
  };

  const removeFromHero = async (animeId: number) => {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "remove",
          animeIds: [animeId],
        }),
      });

      if (!response.ok) {
        throw new Error("Ошибка при удалении");
      }

      toast.success("Аниме удалено из Hero-секции");
      await loadData();
    } catch (error) {
      console.error("Ошибка удаления:", error);
      toast.error("Не удалось удалить аниме");
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
            Выберите до 10 аниме для отображения в Hero-слайдере на главной
            странице
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                Выбрано: {selectedAnimes.size} / 10
              </Badge>
              {heroAnimes.length > 0 && (
                <Badge variant="outline">
                  В Hero-секции: {heroAnimes.length}
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={loadData} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Обновить
              </Button>
              <Button
                onClick={saveChanges}
                disabled={saving || selectedAnimes.size === 0}
                size="sm"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Сохранение..." : "Сохранить изменения"}
              </Button>
            </div>
          </div>

          {/* Текущие аниме в Hero-секции */}
          {heroAnimes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">
                Текущие аниме в Hero-секции:
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {heroAnimes.map((anime) => (
                  <Card
                    key={anime.id}
                    className={`relative overflow-hidden ${
                      selectedAnimes.has(anime.id)
                        ? "ring-2 ring-yellow-500"
                        : ""
                    }`}
                  >
                    <div className="relative aspect-[2/3]">
                      {anime.poster_url ? (
                        <Image
                          src={anime.poster_url}
                          alt={anime.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                          <span className="text-xs text-slate-500">
                            Нет постера
                          </span>
                        </div>
                      )}
                      {selectedAnimes.has(anime.id) && (
                        <div className="absolute top-2 right-2 bg-yellow-500 rounded-full p-1">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <p className="text-xs font-medium line-clamp-2 mb-1">
                        {anime.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {anime.shikimori_rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {anime.shikimori_rating.toFixed(1)}
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={() => removeFromHero(anime.id)}
                        variant="destructive"
                        size="sm"
                        className="w-full mt-2 text-xs"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Удалить
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Поиск и выбор аниме */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск аниме по названию или ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-3">
              Выберите аниме для Hero-секции:
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[600px] overflow-y-auto">
              {filteredAnimes.map((anime) => (
                <Card
                  key={anime.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedAnimes.has(anime.id)
                      ? "ring-2 ring-yellow-500"
                      : ""
                  }`}
                  onClick={() => toggleAnimeSelection(anime.id)}
                >
                  <div className="relative aspect-[2/3]">
                    {anime.poster_url ? (
                      <Image
                        src={anime.poster_url}
                        alt={anime.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                        <span className="text-xs text-slate-500">
                          Нет постера
                        </span>
                      </div>
                    )}
                    {selectedAnimes.has(anime.id) && (
                      <div className="absolute top-2 right-2 bg-yellow-500 rounded-full p-1">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <p className="text-xs font-medium line-clamp-2 mb-1">
                      {anime.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {anime.shikimori_rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {anime.shikimori_rating.toFixed(1)}
                        </div>
                      )}
                      {anime.shikimori_votes && (
                        <span className="text-xs">
                          ({anime.shikimori_votes.toLocaleString()})
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {filteredAnimes.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Аниме не найдено
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
