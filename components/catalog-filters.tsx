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

const SORT_OPTIONS = [
  { value: "shikimori_rating", label: "По рейтингу" },
  { value: "year", label: "По году" },
  { value: "title", label: "По названию" },
]

const TYPE_OPTIONS = [
  { value: "tv", label: "TV Сериал" },
  { value: "movie", label: "Фильм" },
  { value: "ova", label: "OVA" },
  { value: "ona", label: "ONA" },
  { value: "special", label: "Спешл" },
]

export function CatalogFilters({ filters, onFiltersChange, onApply, onReset }: CatalogFiltersProps) {
  const set = <K extends keyof FiltersState>(key: K, value: FiltersState[K]) =>
    onFiltersChange((prev) => ({ ...prev, [key]: value }))

  const handleTypeChange = (type: string, checked: boolean) => {
    const newTypes = checked ? [...filters.type, type] : filters.type.filter((t) => t !== type)
    set("type", newTypes)
  }

  return (
    <aside className="bg-slate-800 rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Фильтры</h2>
        <Button variant="ghost" size="sm" onClick={onReset}>
          <X className="mr-1 h-4 w-4" />
          Сбросить
        </Button>
      </div>

      {/* Поиск по названию */}
      <div className="space-y-2">
        <Label htmlFor="search">Поиск</Label>
        <Input
          id="search"
          placeholder="Название аниме..."
          value={filters.title}
          onChange={(e) => set("title", e.target.value)}
          className="bg-slate-700 border-slate-600"
        />
      </div>

      {/* Сортировка */}
      <div className="space-y-2">
        <Label>Сортировка</Label>
        <Select value={filters.sort} onValueChange={(value) => set("sort", value)}>
          <SelectTrigger className="bg-slate-700 border-slate-600">
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

      {/* Год выпуска */}
      <div className="space-y-2">
        <Label>Год выпуска</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="От"
            value={filters.yearFrom}
            onChange={(e) => set("yearFrom", e.target.value)}
            className="bg-slate-700 border-slate-600"
          />
          <Input
            placeholder="До"
            value={filters.yearTo}
            onChange={(e) => set("yearTo", e.target.value)}
            className="bg-slate-700 border-slate-600"
          />
        </div>
      </div>

      {/* Тип */}
      <div className="space-y-2">
        <Label>Тип</Label>
        <div className="space-y-2">
          {TYPE_OPTIONS.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={option.value}
                checked={filters.type.includes(option.value)}
                onCheckedChange={(checked) => handleTypeChange(option.value, checked as boolean)}
              />
              <Label htmlFor={option.value} className="text-sm">
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Button className="w-full" onClick={onApply}>
        Применить
      </Button>
    </aside>
  )
}
