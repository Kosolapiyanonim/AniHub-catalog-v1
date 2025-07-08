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
  filters: FiltersState | undefined
  onFiltersChange: Dispatch<SetStateAction<FiltersState>>
  onApply: () => void
  onReset: () => void
}

/* ---------- OPTIONS ---------- */
const SORT_OPTIONS = [
  { value: "shikimori_rating", label: "По рейтингу" },
  { value: "year", label: "По году" },
  { value: "title", label: "По названию" },
]

const TYPE_OPTIONS = [
  { value: "tv", label: "TV-сериал" },
  { value: "movie", label: "Фильм" },
  { value: "ova", label: "OVA" },
  { value: "ona", label: "ONA" },
  { value: "special", label: "Спешл" },
]

/* ----------------------------------------------------------------- */

export function CatalogFilters({ filters, onFiltersChange, onApply, onReset }: CatalogFiltersProps) {
  /* Если фильтры внезапно undefined — просто не рендерим панель, чтобы избежать ошибок. */
  if (!filters) return null

  const set = <K extends keyof FiltersState>(key: K, value: FiltersState[K]) =>
    onFiltersChange((prev) => ({ ...prev, [key]: value }))

  const toggleType = (type: string) => {
    const list = filters.type ?? [] // гарантируем, что это всегда массив
    const newTypes = list.includes(type) ? list.filter((t) => t !== type) : [...list, type]
    set("type", newTypes)
  }

  return (
    <aside className="rounded-lg bg-slate-800/60 border border-slate-700 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Фильтры</h2>
        <Button variant="ghost" size="sm" onClick={onReset}>
          <X className="h-4 w-4 mr-1" />
          Сбросить
        </Button>
      </div>

      {/* Поиск */}
      <div className="space-y-2">
        <Label htmlFor="search">Поиск</Label>
        <Input
          id="search"
          placeholder="Название аниме…"
          value={filters.title}
          onChange={(e) => set("title", e.target.value)}
        />
      </div>

      {/* Сортировка */}
      <div className="space-y-2">
        <Label>Сортировка</Label>
        <Select value={filters.sort} onValueChange={(v) => set("sort", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Сортировка" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
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
            type="number"
            placeholder="От"
            value={filters.yearFrom}
            onChange={(e) => set("yearFrom", e.target.value)}
          />
          <Input
            type="number"
            placeholder="До"
            value={filters.yearTo}
            onChange={(e) => set("yearTo", e.target.value)}
          />
        </div>
      </div>

      {/* Тип */}
      <div className="space-y-2">
        <Label>Тип</Label>
        <div className="space-y-2">
          {TYPE_OPTIONS.map((o) => (
            <div key={o.value} className="flex items-center space-x-2">
              <Checkbox
                id={o.value}
                checked={(filters.type ?? []).includes(o.value)}
                onCheckedChange={() => toggleType(o.value)}
              />
              <Label htmlFor={o.value} className="cursor-pointer">
                {o.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Button className="w-full" onClick={onApply}>
        Применить фильтры
      </Button>
    </aside>
  )
}
