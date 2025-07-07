// Создайте новый файл: /components/catalog-filters.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { ChevronDown, X } from "lucide-react"

// Типы для пропсов и состояния
interface FiltersState {
  genres: string[],
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
  initialFilters: FiltersState;
  onApplyFilters: (filters: FiltersState) => void;
}

const STATUS_OPTIONS = { 'all': 'Все статусы', 'ongoing': 'Онгоинг', 'released': 'Вышел', 'anons': 'Анонс' };
const TYPE_OPTIONS = [
    { id: 'anime-serial', label: 'ТВ-сериал' },
    { id: 'anime', label: 'Фильм' },
    { id: 'OVA', label: 'OVA' },
    { id: 'ONA', label: 'ONA' },
];
const SORT_OPTIONS = {
    'shikimori_rating': 'По рейтингу',
    'shikimori_votes': 'По популярности',
    'year': 'По году',
};

export function CatalogFilters({ initialFilters, onApplyFilters }: CatalogFiltersProps) {
  const [filters, setFilters] = useState(initialFilters);
  const [genresList, setGenresList] = useState<string[]>([]);
  const [studiosList, setStudiosList] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/genres').then(res => res.json()).then(data => setGenresList(data.genres || []));
    fetch('/api/studios').then(res => res.json()).then(data => setStudiosList(data.studios || []));
  }, []);

  const handleInputChange = (key: keyof FiltersState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const handleMultiSelectToggle = (key: 'genres' | 'studios' | 'type', value: string) => {
    const currentValues = filters[key] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    setFilters(prev => ({ ...prev, [key]: newValues }));
  };

  const handleReset = () => {
    setFilters(initialFilters);
    onApplyFilters(initialFilters);
  };

  return (
    <div className="w-full lg:w-80 bg-card border-r border-border p-4 space-y-4 h-full flex-shrink-0">
      <div className="pb-2 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Фильтры</h2>
        <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs">
          <X className="w-4 h-4 mr-1" />
          Сбросить
        </Button>
      </div>

      <div className="space-y-4">
        {/* Жанры */}
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

        {/* Студии */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span>{filters.studios.length > 0 ? `Студии: ${filters.studios.length}` : 'Все студии'}</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 max-h-96 overflow-y-auto">
            <DropdownMenuLabel>Выберите студии</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {studiosList.map((studio) => (
              <DropdownMenuCheckboxItem key={studio} checked={filters.studios.includes(studio)} onCheckedChange={() => handleMultiSelectToggle('studios', studio)}>
                {studio}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Separator />
        
        {/* Год релиза */}
        <div className="space-y-2">
            <Label className="text-sm font-medium">Год релиза</Label>
            <div className="flex items-center space-x-2">
                <Input placeholder="От" value={filters.yearFrom} onChange={(e) => handleInputChange("yearFrom", e.target.value)} />
                <span className="text-muted-foreground">—</span>
                <Input placeholder="До" value={filters.yearTo} onChange={(e) => handleInputChange("yearTo", e.target.value)} />
            </div>
        </div>

        {/* Количество эпизодов */}
        <div className="space-y-2">
            <Label className="text-sm font-medium">Количество эпизодов</Label>
            <div className="flex items-center space-x-2">
                <Input placeholder="От" value={filters.episodesFrom} onChange={(e) => handleInputChange("episodesFrom", e.target.value)} />
                <span className="text-muted-foreground">—</span>
                <Input placeholder="До" value={filters.episodesTo} onChange={(e) => handleInputChange("episodesTo", e.target.value)} />
            </div>
        </div>

        {/* Рейтинг */}
        <div className="space-y-2">
            <Label className="text-sm font-medium">Рейтинг</Label>
            <div className="flex items-center space-x-2">
                <Input placeholder="От" value={filters.ratingFrom} onChange={(e) => handleInputChange("ratingFrom", e.target.value)} />
                <span className="text-muted-foreground">—</span>
                <Input placeholder="До" value={filters.ratingTo} onChange={(e) => handleInputChange("ratingTo", e.target.value)} />
            </div>
        </div>

        <Separator />

        {/* Тип */}
        <div className="space-y-2">
            <Label className="text-sm font-medium">Тип</Label>
            {TYPE_OPTIONS.map(item => (
                <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox id={`type-${item.id}`} checked={filters.type.includes(item.id)} onCheckedChange={(checked) => handleMultiSelectToggle('type', item.id, checked as boolean)} />
                    <Label htmlFor={`type-${item.id}`} className="font-normal">{item.label}</Label>
                </div>
            ))}
        </div>

        <Separator />

        {/* Статус */}
        <div className="space-y-2">
            <Label className="text-sm font-medium">Статус</Label>
            <Select value={filters.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                    {Object.entries(STATUS_OPTIONS).map(([key, value]) => (<SelectItem key={key} value={key}>{value}</SelectItem>))}
                </SelectContent>
            </Select>
        </div>
        
        {/* Сортировка */}
        <div className="space-y-2">
            <Label className="text-sm font-medium">Сортировка</Label>
            <Select value={filters.sort} onValueChange={(value) => handleInputChange("sort", value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                    {Object.entries(SORT_OPTIONS).map(([key, value]) => (<SelectItem key={key} value={key}>{value}</SelectItem>))}
                </SelectContent>
            </Select>
        </div>

        <Button onClick={() => onApplyFilters(filters)} className="w-full bg-primary hover:bg-primary/90">
            Применить
        </Button>
      </div>
    </div>
  )
}
