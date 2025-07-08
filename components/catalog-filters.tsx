"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, X } from "lucide-react"
import { Separator } from "@/components/ui/separator"

/* -----------------------------------------------------------
 * Типы и константы
 * --------------------------------------------------------- */

export interface FiltersState {
  genres: string[]
  yearFrom: string
  yearTo: string
  episodesFrom: string
  episodesTo: string
  type: string[]
  status: string
  sort: string
}

interface CatalogFiltersProps {
  filters: FiltersState
  onFiltersChange: (next: FiltersState) => void
  onApply: () => void
  onReset: () => void
}

const TYPE_OPTIONS = [
  { id: "tv", label: "TV-сериал" },
  { id: "movie", label: "Фильм" },
  { id: "ova", label: "OVA" },
  { id: "special", label: "Спешл" },
  { id: "ona", label: "ONA" },
  { id: "music", label: "Клип" },
]

const STATUS_OPTIONS: Record<string, string> = {
  all: "Любой",
  ongoing: "Онгоинг",
  released: "Вышел",
}

const SORT_OPTIONS: Record<string, string> = {
  popularity: "Популярность",
  rating: "Рейтинг",
  year: "Год",
}

/* -----------------------------------------------------------
 * Компонент
 * --------------------------------------------------------- */

export function CatalogFilters({ filters, onFiltersChange, onApply, onReset }: CatalogFiltersProps) {
  /* --- Справочники жанров (пример) --- */
  const [genreList, setGenreList] = useState<string[]>([])

  useEffect(() => {
    // Загружаем список жанров (заглушка)
    fetch("/api/genres")
      .then((r) => r.json())
      .then((data) => setGenreList(data.genres ?? []))
      .catch(() => setGenreList([]))
  }, [])

  /* --- Вспомогательные функции --- */
  const set = (key: keyof FiltersState, value: unknown) => onFiltersChange({ ...filters, [key]: value })

  const toggleArray = (key: "genres" | "type", value: string) => {
    const current = filters[key]
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
    set(key, next)
  }

  /* --- UI --- */
  return (
    <aside className="sticky top-0 h-screen w-full max-w-xs shrink-0 overflow-y-auto border-l border-border bg-card p-4">
      {/* Заголовок и сброс */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Фильтры</h2>
        <Button variant="ghost" size="sm" onClick={onReset}>
          <X className="mr-1 h-4 w-4" />
          Сбросить
        </Button>
      </div>

      {/* Жанры */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between bg-transparent">
            {filters.genres.length > 0 ? `Жанры: ${filters.genres.length}` : "Все жанры"}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-h-72 w-64 overflow-y-auto">
          <DropdownMenuLabel>Выберите жанры</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {genreList.map((g) => (
            <DropdownMenuCheckboxItem
              key={g}
              onCheckedChange={() => toggleArray("genres", g)}
              checked={filters.genres.includes(g)}
            >
              {g}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator className="my-4" />

      {/* Год релиза */}
      <div className="space-y-1">
        <Label>Год релиза</Label>
        <div className="flex items-center gap-2">
          <Input placeholder="От" value={filters.yearFrom} onChange={(e) => set("yearFrom", e.target.value)} />
          <span>—</span>
          <Input placeholder="До" value={filters.yearTo} onChange={(e) => set("yearTo", e.target.value)} />
        </div>
      </div>

      {/* Кол-во эпизодов */}
      <div className="mt-3 space-y-1">
        <Label>Эпизоды</Label>
        <div className="flex items-center gap-2">
          <Input placeholder="От" value={filters.episodesFrom} onChange={(e) => set("episodesFrom", e.target.value)} />
          <span>—</span>
          <Input placeholder="До" value={filters.episodesTo} onChange={(e) => set("episodesTo", e.target.value)} />
        </div>
      </div>

      <Separator className="my-4" />

      {/* Тип */}
      <div className="space-y-1">
        <Label>Тип</Label>
        {TYPE_OPTIONS.map((opt) => (
          <label key={opt.id} className="flex items-center gap-2">
            <Checkbox checked={filters.type.includes(opt.id)} onCheckedChange={() => toggleArray("type", opt.id)} />
            {opt.label}
          </label>
        ))}
      </div>

      <Separator className="my-4" />

      {/* Статус */}
      <div className="space-y-1">
        <Label>Статус</Label>
        <Select value={filters.status} onValueChange={(value) => set("status", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Любой" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(STATUS_OPTIONS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Сортировка */}
      <div className="mt-3 space-y-1">
        <Label>Сортировка</Label>
        <Select value={filters.sort} onValueChange={(value) => set("sort", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Популярность" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SORT_OPTIONS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Кнопка "Применить" */}
      <Button className="mt-6 w-full" onClick={onApply}>
        Применить
      </Button>
    </aside>
  )
}

/* экспорт по умолчанию на случай импорта default */
export default CatalogFilters
