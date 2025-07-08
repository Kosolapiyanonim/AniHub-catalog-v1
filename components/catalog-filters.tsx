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

  const toggleType = (type: string) => {
    const newTypes = filters.type.includes(type) ? filters.type.filter((t) => t !== type) : [...filters.type, type]
    set("type", newTypes)
  }

  return (
    <aside className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Фильтры</h2>
        <Button variant="ghost" size="sm" onClick={onReset} className="text-slate-400 hover:text-white">
          <X className="mr-1 h-4 w-4" />
          Сбросить
        </Button>
      </div>

      <div className="space-y-6">
        {/* Поиск по названию */}
        <div className="space-y-2">
          <Label htmlFor="search" className="text-sm font-medium text-slate-300">
            Поиск
          </Label>
          <Input
            id="search"
            placeholder="Название аниме..."
            value={filters.title}
            onChange={(e) => set("title", e.target.value)}
            className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
          />
        </div>

        {/* Сортировка */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-300">Сортировка</Label>
          <Select value={filters.sort} onValueChange={(value) => set("sort", value)}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-white hover:bg-slate-600">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Год выпуска */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-300">Год выпуска</Label>
          <div className="flex gap-2">
            <Input
              placeholder="От"
              value={filters.yearFrom}
              onChange={(e) => set("yearFrom", e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
            />
            <Input
              placeholder="До"
              value={filters.yearTo}
              onChange={(e) => set("yearTo", e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
            />
          </div>
        </div>

        {/* Тип */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-300">Тип</Label>
          <div className="space-y-2">
            {TYPE_OPTIONS.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={option.value}
                  checked={filters.type.includes(option.value)}
                  onCheckedChange={() => toggleType(option.value)}
                  className="border-slate-600 data-[state=checked]:bg-purple-600"
                />
                <Label htmlFor={option.value} className="text-sm text-slate-300 cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Button className="mt-6 w-full bg-purple-600 hover:bg-purple-700" onClick={onApply}>
        Применить фильтры
      </Button>
    </aside>
  )
}
