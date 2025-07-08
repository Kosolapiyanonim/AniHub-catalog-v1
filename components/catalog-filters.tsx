// /components/catalog-filters.tsx
"use client"

import type { Dispatch, SetStateAction } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Search } from "lucide-react"

export interface FiltersState {
  title: string
  sort: string
  yearFrom: string
  yearTo: string
  type: string[]
  page: number
  limit: number
}

interface CatalogFiltersProps {
  filters: FiltersState
  onFiltersChange: Dispatch<SetStateAction<FiltersState>>
  onApply: () => void
  onReset: () => void
}

const SORT_OPTIONS = {
  shikimori_rating: "По рейтингу",
  shikimori_votes: "По популярности",
  year: "По году",
}

const TYPE_OPTIONS = [
  { id: "tv", label: "TV Сериал" },
  { id: "movie", label: "Фильм" },
  { id: "ova", label: "OVA" },
  { id: "ona", label: "ONA" },
  { id: "special", label: "Спешл" },
  { id: "music", label: "Клип" },
]

export function CatalogFilters({ filters, onFiltersChange, onApply, onReset }: CatalogFiltersProps) {
  const set = <K extends keyof FiltersState>(key: K, value: FiltersState[K]) =>
    onFiltersChange((prev) => ({ ...prev, [key]: value }))

  const toggleType = (typeId: string) => {
    const newTypes = filters.type.includes(typeId)
      ? filters.type.filter((t) => t !== typeId)
      : [...filters.type, typeId]
    set("type", newTypes)
  }

  return (
    <aside className="w-full lg:w-80 bg-card border-l border-border p-4 space-y-4 h-full flex-shrink-0">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Фильтры</h2>
        <Button variant="ghost" size="sm" onClick={onReset}>
          <X className="mr-1 h-4 w-4" />
          Сбросить
        </Button>
      </div>

      {/* --- НОВЫЙ БЛОК ПОИСКА --- */}
      <div className="space-y-1">
        <Label htmlFor="search">Поиск</Label>
        <div className="relative">
          <Input
            id="search"
            placeholder="Название аниме…"
            value={filters.title}
            onChange={(e) => set("title", e.target.value)}
            className="pr-10"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Год релиза */}
      <div className="space-y-1">
        <Label>Год релиза</Label>
        <div className="flex gap-2">
          <Input placeholder="От" value={filters.yearFrom} onChange={(e) => set("yearFrom", e.target.value)} />
          <span className="self-center text-muted-foreground">—</span>
          <Input placeholder="До" value={filters.yearTo} onChange={(e) => set("yearTo", e.target.value)} />
        </div>
      </div>

      {/* Тип аниме */}
      <div className="space-y-1">
        <Label>Тип</Label>
        {TYPE_OPTIONS.map((type) => (
          <div key={type.id} className="flex items-center gap-2">
            <Checkbox
              id={`type-${type.id}`}
              checked={filters.type.includes(type.id)}
              onCheckedChange={() => toggleType(type.id)}
            />
            <Label htmlFor={`type-${type.id}`} className="font-normal">
              {type.label}
            </Label>
          </div>
        ))}
      </div>

      {/* Сортировка */}
      <div className="space-y-1">
        <Label>Сортировка</Label>
        <Select value={filters.sort} onValueChange={(v) => set("sort", v)}>
          <SelectTrigger>
            <SelectValue />
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

      <Button className="w-full mt-6" onClick={onApply}>
        Применить
      </Button>
    </aside>
  )
}

export default CatalogFilters
