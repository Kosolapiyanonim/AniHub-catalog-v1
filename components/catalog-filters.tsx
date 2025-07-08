"use client"

import type { Dispatch, SetStateAction } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { X } from "lucide-react"

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

const ANIME_TYPES = [
  { value: "tv", label: "TV Сериал" },
  { value: "movie", label: "Фильм" },
  { value: "ova", label: "OVA" },
  { value: "ona", label: "ONA" },
  { value: "special", label: "Спешл" },
  { value: "music", label: "Клип" },
]

const SORT_OPTIONS = [
  { value: "shikimori_rating", label: "По рейтингу" },
  { value: "year", label: "По году" },
  { value: "title", label: "По названию" },
  { value: "created_at", label: "По дате добавления" },
]

export function CatalogFilters({ filters, onFiltersChange, onApply, onReset }: CatalogFiltersProps) {
  const set = <K extends keyof FiltersState>(key: K, value: FiltersState[K]) =>
    onFiltersChange((prev) => ({ ...prev, [key]: value }))

  const handleTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      set("type", [...filters.type, type])
    } else {
      set(
        "type",
        filters.type.filter((t) => t !== type),
      )
    }
  }

  return (
    <aside className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Фильтры</h2>
        <Button variant="ghost" size="sm" onClick={onReset}>
          <X className="mr-1 h-4 w-4" />
          Сбросить
        </Button>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="search">Поиск</Label>
          <Input
            id="search"
            placeholder="Название аниме..."
            value={filters.title}
            onChange={(e) => set("title", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Сортировка</Label>
          <Select value={filters.sort} onValueChange={(value) => set("sort", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="yearFrom">Год от</Label>
            <Input
              id="yearFrom"
              type="number"
              placeholder="2000"
              value={filters.yearFrom}
              onChange={(e) => set("yearFrom", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="yearTo">Год до</Label>
            <Input
              id="yearTo"
              type="number"
              placeholder="2024"
              value={filters.yearTo}
              onChange={(e) => set("yearTo", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label>Тип</Label>
          <div className="space-y-2">
            {ANIME_TYPES.map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <Checkbox
                  id={type.value}
                  checked={filters.type.includes(type.value)}
                  onCheckedChange={(checked) => handleTypeChange(type.value, checked as boolean)}
                />
                <Label htmlFor={type.value} className="text-sm font-normal">
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Button className="w-full" onClick={onApply}>
          Применить
        </Button>
      </div>
    </aside>
  )
}
