// /components/search-dialog.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { AnimeCard } from "./anime-card";

interface AnimeSearchResult {
  id: number;
  shikimori_id: string;
  title: string;
  poster_url?: string | null;
  year?: number | null;
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

  useEffect(() => {
    performSearch(debouncedQuery);
  }, [debouncedQuery, performSearch]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] bg-slate-900 border-slate-800 flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Поиск по сайту</DialogTitle>
          {/* ИСПРАВЛЕНИЕ: Добавлено описание для доступности */}
          <DialogDescription className="sr-only">
            Введите название аниме для поиска и результаты появятся ниже.
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
                placeholder="Начните вводить название, например: ванпис"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 bg-slate-800 border-slate-700 h-12 text-lg"
                autoFocus
            />
            {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-gray-400" />}
        </div>
        <div className="mt-4 flex-1 overflow-y-auto">
          {results.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {results.map((anime) => (
                <div key={anime.id} onClick={() => onOpenChange(false)}>
                  <AnimeCard anime={anime} />
                </div>
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
