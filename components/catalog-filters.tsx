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
]

const SORT_OPTIONS = [
  { value: "shikimori_rating", label: "По рейтингу" },
  { value: "year", label: "По году" },
  { value: "title", label: "По названию" },
]

export function CatalogFilters({ filters, onFiltersChange, onApply, onReset }: CatalogFiltersProps) {
  const set = <K extends keyof FiltersState>(key: K, value: FiltersState[K]) =>
    onFiltersChange((prev) => ({ ...prev, [key]: value }))

  const toggleType = (type: string) => {
    const newTypes = filters.type.includes(type) ? filters.type.filter((t) => t !== type) : [...filters.type, type]
    set("type", newTypes)
  }

  return (
    <aside className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Фильтры</h2>
        <Button variant="ghost" size="sm" onClick={onReset} className="text-slate-400 hover:text-white">
          <X className="mr-1 h-4 w-4" />
          Сбросить
        </Button>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="search" className="text-white">
            Поиск
          </Label>
          <Input
            id="search"
            placeholder="Название аниме…"
            value={filters.title}
            onChange={(e) => set("title", e.target.value)}
            className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-white">Сортировка</Label>
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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="yearFrom" className="text-white">
              Год от
            </Label>
            <Input
              id="yearFrom"
              type="number"
              placeholder="2000"
              value={filters.yearFrom}
              onChange={(e) => set("yearFrom", e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="yearTo" className="text-white">
              Год до
            </Label>
            <Input
              id="yearTo"
              type="number"
              placeholder="2024"
              value={filters.yearTo}
              onChange={(e) => set("yearTo", e.target.value)}
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-white">Тип</Label>
          <div className="space-y-2">
            {ANIME_TYPES.map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <Checkbox
                  id={type.value}
                  checked={filters.type.includes(type.value)}
                  onCheckedChange={() => toggleType(type.value)}
                  className="border-slate-600 data-[state=checked]:bg-purple-600"
                />
                <Label htmlFor={type.value} className="text-sm text-slate-300">
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Button className="mt-6 w-full bg-purple-600 hover:bg-purple-700" onClick={onApply}>
        Применить
      </Button>
    </aside>
  )
}
