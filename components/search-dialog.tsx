// /components/search-dialog.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";

// Определяем тип для результатов поиска
interface AnimeSearchResult {
  id: number;
  shikimori_id: string;
  title: string;
  poster_url?: string | null;
  year?: number | null;
  type?: string;
}

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AnimeSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  // Функция для выполнения поиска
  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        setResults(await response.json());
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Вызываем поиск при изменении debouncedQuery
  useEffect(() => {
    performSearch(debouncedQuery);
  }, [debouncedQuery, performSearch]);

  // Очищаем результаты при закрытии окна
  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] bg-slate-900 border-slate-800 flex flex-col p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-white text-xl">Поиск по сайту</DialogTitle>
          <DialogDescription className="sr-only">
            Введите название аниме для поиска, и результаты появятся ниже.
          </DialogDescription>
        </DialogHeader>
        <div className="relative px-6">
            <Search className="absolute left-9 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
                placeholder="Начните вводить название, например: ванпис"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 bg-slate-800 border-slate-700 h-12 text-lg"
                autoFocus
            />
            {loading && <Loader2 className="absolute right-9 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-gray-400" />}
        </div>
        <div className="mt-4 flex-1 overflow-y-auto px-6 pb-6">
          {results.length > 0 ? (
            // ИЗМЕНЕНИЕ: Вместо сетки используем вертикальный список
            <div className="space-y-2">
              {results.map((anime) => (
                <Link
                  key={anime.shikimori_id}
                  href={`/anime/${anime.shikimori_id}`}
                  className="flex items-center p-3 hover:bg-slate-800 rounded-md transition-colors"
                  onClick={() => onOpenChange(false)}
                >
                  <div className="w-14 h-20 flex-shrink-0 mr-4 relative">
                    <Image
                      src={anime.poster_url || "/placeholder.svg"}
                      alt={anime.title}
                      fill
                      className="object-cover rounded"
                      sizes="56px"
                      quality={90} // <-- ИЗМЕНЕНИЕ: Увеличиваем качество до 90
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium text-white truncate mb-1">{anime.title}</p>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <span>{anime.type?.replace('_', ' ')}</span>
                      {anime.year && (
                        <>
                          <span>•</span>
                          <span>{anime.year} г.</span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            !loading && query.length > 2 && (
              <div className="text-center py-16 text-gray-500">
                <p>По запросу "{query}" ничего не найдено</p>
              </div>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
