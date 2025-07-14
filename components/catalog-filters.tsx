// /components/catalog-filters.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlidersHorizontal } from "lucide-react";
import { useSupabase } from './supabase-provider';

export interface FiltersState {
  title: string;
  sort: string;
  user_list_status: string;
  // ... other filters
}

export const DEFAULT_FILTERS: FiltersState = {
  title: "",
  sort: "shikimori_votes",
  user_list_status: "",
  // ... other filters
};

const userListStatuses = [
    { key: "all", label: "Все аниме" },
    { key: "watching", label: "Смотрю" },
    { key: "planned", label: "В планах" },
    { key: "completed", label: "Просмотрено" },
    { key: "rewatching", label: "Пересматриваю" },
    { key: "on_hold", label: "Отложено" },
    { key: "dropped", label: "Брошено" },
];

interface CatalogFiltersProps {
  initialFilters: FiltersState;
  onApply: (filters: FiltersState) => void;
}

export function CatalogFilters({ initialFilters, onApply }: CatalogFiltersProps) {
  const { session } = useSupabase();
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const handleApply = () => {
      onApply(filters);
  };
  
  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    onApply(DEFAULT_FILTERS);
  };

  return (
    <Card className="sticky top-20 bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-white"><SlidersHorizontal className="w-5 h-5" />Фильтры</CardTitle>
            <Button onClick={handleReset} variant="ghost" size="sm" className="text-gray-400 hover:text-white">Сбросить</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input 
            placeholder="Поиск по названию..."
            value={filters.title}
            onChange={e => setFilters(prev => ({ ...prev, title: e.target.value }))}
            className="bg-slate-700 border-slate-600"
        />
        <Select value={filters.sort} onValueChange={val => setFilters(prev => ({...prev, sort: val}))}>
            <SelectTrigger className="w-full bg-slate-700 border-slate-600"><SelectValue placeholder="Сортировка" /></SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="shikimori_votes">По популярности</SelectItem>
                <SelectItem value="weighted_rating">По рейтингу</SelectItem>
                <SelectItem value="year">По дате выхода</SelectItem>
            </SelectContent>
        </Select>
        <Button onClick={handleApply} className="w-full bg-purple-600 hover:bg-purple-700">Применить</Button>
        <Accordion type="multiple" className="w-full" defaultValue={['user_list_status']}>
            {session && (
              <AccordionItem value="user_list_status" className="border-slate-700">
                  <AccordionTrigger className="text-white hover:no-underline">Мои списки</AccordionTrigger>
                  <AccordionContent>
                      <Select value={filters.user_list_status} onValueChange={val => setFilters(prev => ({...prev, user_list_status: val === 'all' ? '' : val}))}>
                          <SelectTrigger className="w-full bg-slate-700 border-slate-600"><SelectValue placeholder="Выберите список" /></SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700 text-white">
                              {userListStatuses.map(status => (<SelectItem key={status.key} value={status.key}>{status.label}</SelectItem>))}
                          </SelectContent>
                      </Select>
                  </AccordionContent>
              </AccordionItem>
            )}
        </Accordion>
      </CardContent>
    </Card>
  );
}
