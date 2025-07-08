// components/catalog-filters.tsx
//
// Боковая панель фильтров каталога.
//
// Экспортирует
//   • CatalogFilters – React-компонент
//   • FiltersState   – интерфейс состояния фильтров
//

"use client"

import type { Dispatch, SetStateAction } from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { ChevronDown, X } from "lucide-react"

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export interface FiltersState {
  /* Поиск */
  title: string
  /* Сортировка */
  sort: string
  /* Диапазоны */
  yearFrom: string
  yearTo: string
  episodesFrom: string
  episodesTo: string
  /* Чек-боксы */
  type: string[]
  /* Служебные */
  page: number
  limit: number
}

interface CatalogFiltersProps {
  filters: FiltersState
  onFiltersChange: Dispatch<SetStateAction<FiltersState>>
  onApplyFilters: () => void
  onResetFilters: () => void
}

/* -------------------------------------------------------------------------- */
/*                                  Consts                                    */
/* -------------------------------------------------------------------------- */

const SORT_OPTIONS: Record<string, string> = {
  shikimori_rating: "По рейтингу",
  shikimori_votes: "По популярности",
  year: "По году",
}

const TYPE_OPTIONS = [
  { id: "tv", label: "TV-сериал" },
  { id: "movie", label: "Фильм" },
  { id: "ova", label: "OVA" },
  { id: "ona", label: "ONA" },
]

/* -------------------------------------------------------------------------- */
/*                           Helper / util-functions                          */
/* -------------------------------------------------------------------------- */

function toggle(array: string[], value: string) {
  return array.includes(value) ? array.filter((v) => v !== value) : [...array, value]
}

/* -------------------------------------------------------------------------- */
/*                                 Component                                  */
/* -------------------------------------------------------------------------- */

export function CatalogFilters({ filters, onFiltersChange, onApplyFilters, onResetFilters }: CatalogFiltersProps) {
  /* Показывать ли панель на мобильном */
  const [open, setOpen] = useState<boolean>(true)

  /* Удобный сеттер */
  const set = <K extends keyof FiltersState>(key: K, value: FiltersState[K]) =>
    onFiltersChange((prev) => ({ ...prev, [key]: value }))

  return (
    <aside
      className={`bg-card border-l border-border p-4 space-y-4 h-full flex-shrink-0 ${
        open ? "block" : "hidden lg:block"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Фильтры</h2>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Сбросить фильтры"
          onClick={onResetFilters}
          className="text-muted-foreground"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Search */}
      <div className="space-y-1">
        <Label htmlFor="search">Поиск</Label>
        <Input
          id="search"
          placeholder="Название аниме…"
          value={filters.title}
          onChange={(e) => set("title", e.target.value)}
        />
      </div>

      {/* Year range */}
      <div className="space-y-1">
        <Label>Год релиза</Label>
        <div className="flex gap-2">
          <Input placeholder="От" value={filters.yearFrom} onChange={(e) => set("yearFrom", e.target.value)} />
          <span className="self-center text-muted-foreground">—</span>
          <Input placeholder="До" value={filters.yearTo} onChange={(e) => set("yearTo", e.target.value)} />
        </div>
      </div>

      {/* Episodes range */}
      <div className="space-y-1">
        <Label>Эпизоды</Label>
        <div className="flex gap-2">
          <Input placeholder="От" value={filters.episodesFrom} onChange={(e) => set("episodesFrom", e.target.value)} />
          <span className="self-center text-muted-foreground">—</span>
          <Input placeholder="До" value={filters.episodesTo} onChange={(e) => set("episodesTo", e.target.value)} />
        </div>
      </div>

      {/* Type checkboxes */}
      <div className="space-y-1">
        <Label>Тип</Label>
        {TYPE_OPTIONS.map((t) => (
          <div key={t.id} className="flex items-center gap-2">
            <Checkbox
              id={`type-${t.id}`}
              checked={filters.type.includes(t.id)}
              onCheckedChange={() => set("type", toggle(filters.type, t.id))}
            />
            <Label htmlFor={`type-${t.id}`} className="font-normal">
              {t.label}
            </Label>
          </div>
        ))}
      </div>

      {/* Sorting */}
      <div className="space-y-1">
        <Label>Сортировка</Label>
        <Select value={filters.sort} onValueChange={(v) => set("sort", v)}>
          <SelectTrigger className="w-full justify-between">
            <SelectValue placeholder="Выбрать…" />
            <ChevronDown className="w-4 h-4 opacity-50" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SORT_OPTIONS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Buttons */}
      <div className="pt-2 space-y-2">
        <Button className="w-full" onClick={onApplyFilters}>
          Применить
        </Button>
        <Button variant="outline" className="w-full lg:hidden bg-transparent" onClick={() => setOpen(false)}>
          Скрыть
        </Button>
      </div>
    </aside>
  )
}

/* Экспорт по умолчанию на случай `import Filters from …` */
export default CatalogFilters
