// /components/catalog-filters.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, SlidersHorizontal, Check, Minus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { useSupabase } from './supabase-provider'; // Предполагается, что у вас есть провайдер Supabase

type FilterItem = { id: number; name: string; slug: string; };
export interface FiltersState {
  title: string; sort: string;
  year_from: string; year_to: string;
  // ... другие поля ...
  genres: string[]; genres_exclude: string[];
  studios: string[]; studios_exclude: string[];
  types: string[]; statuses: string[];
  user_list_status: string; // <-- НОВОЕ ПОЛЕ
}

export const DEFAULT_FILTERS: FiltersState = {
  title: "", sort: "shikimori_votes",
  year_from: "", year_to: "",
  rating_from: "", rating_to: "",
  episodes_from: "", episodes_to: "",
  genres: [], genres_exclude: [],
  studios: [], studios_exclude: [],
  types: [], statuses: [],
  user_list_status: "", // <-- НОВОЕ ПОЛЕ
};

interface CatalogFiltersProps {
  initialFilters: FiltersState;
  onApply: (filters: FiltersState) => void;
}

export function CatalogFilters({ initialFilters, onApply }: CatalogFiltersProps) {
  const { session } = useSupabase(); // Получаем сессию из нашего провайдера
  const [filters, setFilters] = useState(initialFilters);
  const [genres, setGenres] = useState<FilterItem[]>([]);
  const [studios, setStudios] = useState<FilterItem[]>([]);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [genresRes, studiosRes] = await Promise.all([
          fetch('/api/genres'),
          fetch('/api/studios')
        ]);
        if (genresRes.ok) setGenres(await genresRes.json());
        if (studiosRes.ok) setStudios(await studiosRes.json());
      } catch (error) { console.error("Failed to fetch filter data", error); }
    };
    fetchFilterData();
  }, []);

  const handleApply = () => onApply(filters);
  const handleReset = () => onApply(DEFAULT_FILTERS);
  
  return (
    <Card className="sticky top-20 bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-white"><SlidersHorizontal className="w-5 h-5" />Фильтры</CardTitle>
            <Button onClick={handleReset} variant="ghost" size="sm" className="text-gray-400 hover:text-white">Сбросить</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ... другие фильтры (поиск, сортировка) ... */}
        <Button onClick={handleApply} className="w-full bg-purple-600 hover:bg-purple-700">Применить</Button>

        <Accordion type="multiple" className="w-full" defaultValue={['genres']}>
            {/* НОВЫЙ РАЗДЕЛ, ВИДИМЫЙ ТОЛЬКО АВТОРИЗОВАННЫМ */}
            {session && (
                <FilterSection title="Мои списки">
                    <Select value={filters.user_list_status} onValueChange={val => setFilters(prev => ({...prev, user_list_status: val}))}>
                        <SelectTrigger className="w-full bg-slate-700 border-slate-600"><SelectValue placeholder="Выберите список" /></SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                            <SelectItem value="">Все</SelectItem>
                            <SelectItem value="watching">Смотрю</SelectItem>
                            <SelectItem value="planned">В планах</SelectItem>
                            <SelectItem value="completed">Просмотрено</SelectItem>
                            <SelectItem value="on_hold">Отложено</SelectItem>
                            <SelectItem value="dropped">Брошено</SelectItem>
                        </SelectContent>
                    </Select>
                </FilterSection>
            )}
            
            <FilterSection title="Жанры">{/* ... */}</FilterSection>
            <FilterSection title="Год выхода">{/* ... */}</FilterSection>
            {/* ... и так далее ... */}
        </Accordion>
      </CardContent>
    </Card>
  );
}

// ... Вспомогательные компоненты без изменений ...
