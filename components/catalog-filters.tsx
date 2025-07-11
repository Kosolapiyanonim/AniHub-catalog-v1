// /components/catalog-filters.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, SlidersHorizontal } from "lucide-react";

// Типы для данных, которые мы будем загружать
type FilterItem = {
  id: number;
  name: string;
  slug: string;
};

// Тип для состояния всех фильтров
export interface FiltersState {
  title: string;
  sort: string;
  year_from: string;
  year_to: string;
  rating_from: string;
  rating_to: string;
  episodes_from: string;
  episodes_to: string;
  genres: string[];
  genres_exclude: string[];
  studios: string[];
  studios_exclude: string[];
  types: string[];
  statuses: string[];
}

interface CatalogFiltersProps {
  initialFilters: FiltersState;
  onApply: (filters: FiltersState) => void;
  onReset: () => void;
}

// --- ОСНОВНОЙ КОМПОНЕНТ ФИЛЬТРОВ ---
export function CatalogFilters({ initialFilters, onApply, onReset }: CatalogFiltersProps) {
  const [filters, setFilters] = useState(initialFilters);
  const [genres, setGenres] = useState<FilterItem[]>([]);
  const [studios, setStudios] = useState<FilterItem[]>([]);
  // Тут можно будет добавить загрузку и других справочников (типы, статусы)

  // Загружаем справочники при первом рендере
  useEffect(() => {
    // В реальности здесь будут fetch-запросы к вашим API /api/genres, /api/studios
    // Для примера используем моковые данные
    setGenres([
        { id: 7, name: 'Детектив', slug: 'mystery' },
        { id: 12, name: 'Фэнтези', slug: 'fantasy' },
        { id: 88, name: 'Ужасы', slug: 'horror' },
        { id: 1, name: 'Экшен', slug: 'action' },
    ]);
    setStudios([
        { id: 1, name: 'Bones', slug: 'bones' },
        { id: 2, name: 'Madhouse', slug: 'madhouse' },
        { id: 3, name: 'MAPPA', slug: 'mappa' },
    ]);
  }, []);

  const handleApplyClick = () => {
    onApply(filters);
  };
  
  const handleResetClick = () => {
    setFilters(initialFilters);
    onReset();
  };

  return (
    <Card className="sticky top-20 bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <SlidersHorizontal className="w-5 h-5" />
          Фильтры
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
            <Button onClick={handleApplyClick} className="w-full bg-purple-600 hover:bg-purple-700">Применить</Button>
            <Button onClick={handleResetClick} variant="ghost" className="w-full text-gray-400 hover:text-white">Сбросить фильтры</Button>
        </div>

        <Accordion type="multiple" defaultValue={['sort', 'genres']} className="w-full">
            {/* Сортировка */}
            <FilterSection title="Сортировка">
                {/* Здесь будет компонент Select для выбора сортировки */}
            </FilterSection>

            {/* Жанры */}
            <FilterSection title="Жанры">
                <MultiSelectFilter
                    items={genres}
                    selected={filters.genres}
                    excluded={filters.genres_exclude}
                    onChange={(newSelected, newExcluded) => setFilters(prev => ({ ...prev, genres: newSelected, genres_exclude: newExcluded }))}
                />
            </FilterSection>

            {/* Год выхода */}
            <FilterSection title="Год выхода">
                <RangeInput
                    from={filters.year_from}
                    to={filters.year_to}
                    onFromChange={val => setFilters(prev => ({ ...prev, year_from: val }))}
                    onToChange={val => setFilters(prev => ({ ...prev, year_to: val }))}
                    placeholderFrom="С"
                    placeholderTo="По"
                />
            </FilterSection>
            
            {/* Другие фильтры добавляются аналогично */}

        </Accordion>
      </CardContent>
    </Card>
  );
}


// --- ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ ---

// Компонент для секции в аккордеоне
function FilterSection({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <AccordionItem value={title} className="border-slate-700">
            <AccordionTrigger className="text-white hover:no-underline">{title}</AccordionTrigger>
            <AccordionContent>{children}</AccordionContent>
        </AccordionItem>
    )
}

// Компонент для выбора диапазона (для годов, рейтинга и т.д.)
function RangeInput({ from, to, onFromChange, onToChange, placeholderFrom, placeholderTo }: any) {
    return (
        <div className="flex items-center gap-2">
            <Input type="number" placeholder={placeholderFrom} value={from} onChange={e => onFromChange(e.target.value)} className="bg-slate-700 border-slate-600" />
            <span className="text-gray-400">-</span>
            <Input type="number" placeholder={placeholderTo} value={to} onChange={e => onToChange(e.target.value)} className="bg-slate-700 border-slate-600" />
        </div>
    )
}

// Компонент для мульти-выбора с исключением (для жанров, студий)
function MultiSelectFilter({ items, selected, excluded, onChange }: any) {
    const handleSelect = (itemSlug: string, type: 'include' | 'exclude') => {
        const newSelected = new Set(selected);
        const newExcluded = new Set(excluded);

        if (type === 'include') {
            newSelected.has(itemSlug) ? newSelected.delete(itemSlug) : newSelected.add(itemSlug);
            newExcluded.delete(itemSlug); // Нельзя одновременно включать и исключать
        } else {
            newExcluded.has(itemSlug) ? newExcluded.delete(itemSlug) : newExcluded.add(itemSlug);
            newSelected.delete(itemSlug);
        }
        
        onChange(Array.from(newSelected), Array.from(newExcluded));
    };

    return (
        <ScrollArea className="h-48">
            <div className="space-y-2">
                {items.map((item: FilterItem) => (
                    <div key={item.id} className="flex items-center justify-between">
                        <Label htmlFor={`item-${item.id}`} className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-300">
                            {item.name}
                        </Label>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id={`item-${item.id}`}
                                checked={selected.includes(`${item.id}-${item.slug}`)}
                                onCheckedChange={() => handleSelect(`${item.id}-${item.slug}`, 'include')}
                            />
                            <Button variant="ghost" size="icon" className="w-6 h-6 text-gray-400 hover:bg-red-500/20 hover:text-red-400" onClick={() => handleSelect(`${item.id}-${item.slug}`, 'exclude')}>
                                <X className={`w-4 h-4 ${excluded.includes(`${item.id}-${item.slug}`) ? 'text-red-400' : ''}`} />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    )
}
