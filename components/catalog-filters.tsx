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

  const toggleType = (typeValue: string) => {
    const newTypes = filters.type.includes(typeValue)
      ? filters.type.filter((t) => t !== typeValue)
      : [...filters.type, typeValue]
    set("type", newTypes)
  }

  return (
    <aside className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-lg p-6 space-y-6">
      {/* Заголовок и сброс */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Фильтры</h2>
        <Button variant="ghost" size="sm" onClick={onReset} className="text-slate-400 hover:text-white">
          <X className="mr-1 h-4 w-4" />
          Сбросить
        </Button>
      </div>

      {/* Поиск */}
      <div className="space-y-2">
        <Label htmlFor="search" className="text-sm font-medium text-slate-300">
          Поиск
        </Label>
        <Input
          id="search"
          placeholder="Название аниме..."
          value={filters.title}
          onChange={(e) => set("title", e.target.value)}
          className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
        />
      </div>

      {/* Сортировка */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-300">Сортировка</Label>
        <Select value={filters.sort} onValueChange={(value) => set("sort", value)}>
          <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-white hover:bg-slate-700">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Год */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-300">Год выпуска</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="От"
            type="number"
            value={filters.yearFrom}
            onChange={(e) => set("yearFrom", e.target.value)}
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
          />
          <Input
            placeholder="До"
            type="number"
            value={filters.yearTo}
            onChange={(e) => set("yearTo", e.target.value)}
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Тип */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-300">Тип</Label>
        <div className="space-y-2">
          {ANIME_TYPES.map((type) => (
            <div key={type.value} className="flex items-center space-x-2">
              <Checkbox
                id={type.value}
                checked={filters.type.includes(type.value)}
                onCheckedChange={() => toggleType(type.value)}
                className="border-slate-600 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
              />
              <Label htmlFor={type.value} className="text-sm text-slate-300 cursor-pointer">
                {type.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={onApply}>
        Применить
      </Button>
    </aside>
  )
}
