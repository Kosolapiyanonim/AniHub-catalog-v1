// /components/catalog-filters.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { ChevronDown, X, Search } from "lucide-react"

// Типы для пропсов и состояния
export interface FiltersState {
  title: string,
  genres: string[],
  tags: string[],
  studios: string[],
  yearFrom: string,
  yearTo: string,
  episodesFrom: string,
  episodesTo: string,
  ratingFrom: string,
  ratingTo: string,
  status: string,
  type: string[],
  sort: string,
}

interface CatalogFiltersProps {
  filters: FiltersState;
  onFiltersChange: (newFilters: FiltersState) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
}

const STATUS_OPTIONS = { 'all': 'Любой', 'ongoing': 'Онгоинг', 'released': 'Вышел', 'announced': 'Анонс' };
const TYPE_OPTIONS = [
    { id: 'tv', label: 'TV Сериал' },
    { id: 'movie', label: 'Фильм' },
    { id: 'short', label: 'Короткометражка' },
    { id: 'ova', label: 'OVA' },
    { id: 'special', label: 'Спешл' },
    { id: 'ona', label: 'ONA' },
    { id: 'music', label: 'Клип' },
];
const SORT_OPTIONS = {
    'shikimori_rating': 'По рейтингу',
    'shikimori_votes': 'По популярности',
    'year': 'По году',
};

export function CatalogFilters({ filters, onFiltersChange, onApplyFilters, onResetFilters }: CatalogFiltersProps) {
  const [genresList, setGenresList] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/genres').then(res => res.json()).then(data => setGenresList(data.genres || []));
  }, []);

  const handleInputChange = (key: keyof FiltersState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };
  
  const handleMultiSelectToggle = (key: 'genres' | 'tags' | 'type', value: string) => {
    const currentValues = filters[key] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    onFiltersChange({ ...filters, [key]: newValues });
  };

  return (
    <div className="w-full lg:w-80 bg-card border-l border-border p-4 space-y-4 h-full flex-shrink-0">
      <div className="pb-2 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Фильтры</h2>
        <Button variant="ghost" size="sm" onClick={onResetFilters} className="text-xs">
          <X className="w-4 h-4 mr-1" />
          Сбросить
        </Button>
      </div>
      
      <div className="relative">
        <Input 
          placeholder="Поиск по названию..."
          value={filters.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className="pr-10"
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>

      <div className="space-y-4 pt-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span>{filters.genres.length > 0 ? `Жанры: ${filters.genres.length}` : 'Все жанры'}</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 max-h-96 overflow-y-auto">
            <DropdownMenuLabel>Выберите жанры</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {genresList.map((genre) => (
              <DropdownMenuCheckboxItem key={genre} checked={filters.genres.includes(genre)} onCheckedChange={() => handleMultiSelectToggle('genres', genre)}>
                {genre}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator />
        
        <div className="space-y-2">
            <Label className="text-sm font-medium">Год релиза</Label>
            <div className="flex items-center space-x-2">
                <Input placeholder="От" value={filters.yearFrom} onChange={(e) => handleInputChange("yearFrom", e.target.value)} />
                <span className="text-muted-foreground">—</span>
                <Input placeholder="До" value={filters.yearTo} onChange={(e) => handleInputChange("yearTo", e.target.value)} />
            </div>
        </div>

        <div className="space-y-2">
            <Label className="text-sm font-medium">Количество эпизодов</Label>
            <div className="flex items-center space-x-2">
                <Input placeholder="От" value={filters.episodesFrom} onChange={(e) => handleInputChange("episodesFrom", e.target.value)} />
                <span className="text-muted-foreground">—</span>
                <Input placeholder="До" value={filters.episodesTo} onChange={(e) => handleInputChange("episodesTo", e.target.value)} />
            </div>
        </div>

        <Separator />

        <div className="space-y-2">
            <Label className="text-sm font-medium">Тип</Label>
            {TYPE_OPTIONS.map(item => (
                <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox id={`type-${item.id}`} checked={filters.type.includes(item.id)} onCheckedChange={() => handleMultiSelectToggle('type', item.id)} />
                    <Label htmlFor={`type-${item.id}`} className="font-normal">{item.label}</Label>
                </div>
            ))}
        </div>

        <Separator />
        
        <div className="space-y-2">
            <Label className="text-sm font-medium">Статус</Label>
            <Select value={filters.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                    {Object.entries(STATUS_OPTIONS).map(([key, value]) => (<SelectItem key={key} value={key}>{value}</SelectItem>))}
                </SelectContent>
            </Select>
        </div>
        
        <div className="space-y-2">
            <Label className="text-sm font-medium">Сортировка</Label>
            <Select value={filters.sort} onValueChange={(value) => handleInputChange("sort", value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                    {Object.entries(SORT_OPTIONS).map(([key, value]) => (<SelectItem key={key} value={key}>{value}</SelectItem>))}
                </SelectContent>
            </Select>
        </div>
      </div>
      <Button onClick={onApplyFilters} className="w-full bg-primary hover:bg-primary/90 mt-6">
        Применить
      </Button>
    </div>
  )
}
