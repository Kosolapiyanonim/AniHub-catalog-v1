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
import { useSupabase } from './supabase-provider';

type FilterItem = { id: number; name: string; slug: string; };
export interface FiltersState {
  title: string; sort: string;
  year_from: string; year_to: string;
  rating_from: string; rating_to: string;
  episodes_from: string; episodes_to: string;
  genres: string[]; genres_exclude: string[];
  studios: string[]; studios_exclude: string[];
  types: string[]; statuses: string[];
  user_list_status: string;
}

export const DEFAULT_FILTERS: FiltersState = {
  title: "", sort: "shikimori_votes",
  year_from: "", year_to: "",
  rating_from: "", rating_to: "",
  episodes_from: "", episodes_to: "",
  genres: [], genres_exclude: [],
  studios: [], studios_exclude: [],
  types: [], statuses: [],
  user_list_status: "",
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

const animeTypes = ['tv_series', 'movie', 'ova', 'ona', 'special'];
const animeStatuses = ['released', 'ongoing', 'anons'];

interface CatalogFiltersProps {
  initialFilters: FiltersState;
  onApply: (filters: FiltersState) => void;
}

export function CatalogFilters({ initialFilters, onApply }: CatalogFiltersProps) {
  const { session } = useSupabase();
  const [filters, setFilters] = useState(initialFilters);
  const [genres, setGenres] = useState<FilterItem[]>([]);
  const [studios, setStudios] = useState<FilterItem[]>([]);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [genresRes, studiosRes] = await Promise.all([fetch('/api/genres'), fetch('/api/studios')]);
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
        <Input placeholder="Поиск по названию..." value={filters.title} onChange={e => setFilters(prev => ({ ...prev, title: e.target.value }))} className="bg-slate-700 border-slate-600" />
        <Select value={filters.sort} onValueChange={val => setFilters(prev => ({...prev, sort: val}))}>
            <SelectTrigger className="w-full bg-slate-700 border-slate-600"><SelectValue placeholder="Сортировка" /></SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="shikimori_votes">По популярности</SelectItem>
                <SelectItem value="weighted_rating">По рейтингу</SelectItem>
                <SelectItem value="year">По дате выхода</SelectItem>
            </SelectContent>
        </Select>
        <Button onClick={handleApply} className="w-full bg-purple-600 hover:bg-purple-700">Применить</Button>

        <Accordion type="multiple" className="w-full" defaultValue={['user_list_status', 'genres']}>
            {session && (<FilterSection title="Мои списки"><Select value={filters.user_list_status} onValueChange={val => setFilters(prev => ({...prev, user_list_status: val === 'all' ? '' : val}))}><SelectTrigger className="w-full bg-slate-700 border-slate-600"><SelectValue placeholder="Выберите список" /></SelectTrigger><SelectContent className="bg-slate-800 border-slate-700 text-white">{userListStatuses.map(status => (<SelectItem key={status.key} value={status.key}>{status.label}</SelectItem>))}</SelectContent></Select></FilterSection>)}
            <FilterSection title="Жанры"><MultiSelectFilter items={genres} selected={filters.genres} excluded={filters.genres_exclude} onChange={(s, e) => setFilters(prev => ({ ...prev, genres: s, genres_exclude: e }))} /></FilterSection>
            <FilterSection title="Год выхода"><RangeInput from={filters.year_from} to={filters.year_to} onFromChange={val => setFilters(prev => ({...prev, year_from: val}))} onToChange={val => setFilters(prev => ({...prev, year_to: val}))} /></FilterSection>
            <FilterSection title="Тип"><CheckboxGroup items={animeTypes} selected={filters.types} onChange={val => setFilters(prev => ({...prev, types: val}))} /></FilterSection>
            <FilterSection title="Статус"><CheckboxGroup items={animeStatuses} selected={filters.statuses} onChange={val => setFilters(prev => ({...prev, statuses: val}))} /></FilterSection>
            <FilterSection title="Студии"><MultiSelectFilter items={studios} selected={filters.studios} excluded={filters.studios_exclude} onChange={(s, e) => setFilters(prev => ({ ...prev, studios: s, studios_exclude: e }))} /></FilterSection>
        </Accordion>
      </CardContent>
    </Card>
  );
}
// Вспомогательные компоненты
const FilterSection = ({ title, children }: { title: string, children: React.ReactNode }) => (<AccordionItem value={title} className="border-slate-700"><AccordionTrigger className="text-white hover:no-underline">{title}</AccordionTrigger><AccordionContent>{children}</AccordionContent></AccordionItem>);
const RangeInput = ({ from, to, onFromChange, onToChange }: any) => (<div className="flex items-center gap-2"><Input type="number" placeholder="От" value={from} onChange={e => onFromChange(e.target.value)} className="bg-slate-700 border-slate-600" /><span className="text-gray-400">-</span><Input type="number" placeholder="До" value={to} onChange={e => onToChange(e.target.value)} className="bg-slate-700 border-slate-600" /></div>);
const MultiSelectFilter = ({ items, selected, excluded, onChange }: any) => {
    const handleStateChange = (slug: string, currentState: 'none' | 'included' | 'excluded') => {
        const newSelected = new Set(selected); const newExcluded = new Set(excluded);
        if (currentState === 'none') { newSelected.add(slug); newExcluded.delete(slug); } 
        else if (currentState === 'included') { newSelected.delete(slug); newExcluded.add(slug); } 
        else { newExcluded.delete(slug); }
        onChange(Array.from(newSelected), Array.from(newExcluded));
    };
    return (<ScrollArea className="h-48"><div className="space-y-1 pr-2">{items.map((item: FilterItem) => {
        const isIncluded = selected.includes(`${item.id}-${item.slug}`); const isExcluded = excluded.includes(`${item.id}-${item.slug}`);
        const state = isIncluded ? 'included' : isExcluded ? 'excluded' : 'none';
        return (<Button key={item.id} variant="ghost" className="w-full justify-start gap-2" onClick={() => handleStateChange(`${item.id}-${item.slug}`, state)}><div className={`w-4 h-4 rounded-sm border border-primary flex items-center justify-center ${isIncluded ? 'bg-primary' : ''} ${isExcluded ? 'bg-destructive' : ''}`}>{isIncluded && <Check className="w-3 h-3 text-primary-foreground" />}{isExcluded && <Minus className="w-3 h-3 text-destructive-foreground" />}</div><span className="text-sm font-medium text-gray-300">{item.name}</span></Button>);
    })}</div></ScrollArea>);
};
const CheckboxGroup = ({ items, selected, onChange }: { items: string[], selected: string[], onChange: (newSelected: string[]) => void }) => {
    const handleCheck = (item: string) => {
        const newSelected = new Set(selected);
        if (newSelected.has(item)) newSelected.delete(item);
        else newSelected.add(item);
        onChange(Array.from(newSelected));
    };
    return (
        <div className="space-y-2">
            {items.map(item => (
                <div key={item} className="flex items-center space-x-2">
                    <Checkbox id={item} checked={selected.includes(item)} onCheckedChange={() => handleCheck(item)} />
                    <Label htmlFor={item} className="text-sm font-medium text-gray-300 capitalize">{item.replace(/_/g, ' ')}</Label>
                </div>
            ))}
        </div>
    );
};
