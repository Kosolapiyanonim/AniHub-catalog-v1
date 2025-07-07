"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ChevronRight } from "lucide-react"

interface CatalogFiltersProps {
  onFiltersChange: (filters: any) => void
  onApplyFilters: () => void
  onResetFilters: () => void
}

export function CatalogFilters({ onFiltersChange, onApplyFilters, onResetFilters }: CatalogFiltersProps) {
  const [filters, setFilters] = useState({
    genres: "any",
    tags: "any",
    episodesFrom: "",
    episodesTo: "",
    yearFrom: "",
    yearTo: "",
    ratingFrom: "",
    ratingTo: "",
    votesFrom: "",
    votesTo: "",
    ageRating: [] as string[],
    type: [] as string[],
    status: "any",
  })

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleCheckboxChange = (category: "ageRating" | "type", value: string, checked: boolean) => {
    const currentValues = filters[category]
    const newValues = checked ? [...currentValues, value] : currentValues.filter((v) => v !== value)

    handleFilterChange(category, newValues)
  }

  const handleReset = () => {
    const resetFilters = {
      genres: "any",
      tags: "any",
      episodesFrom: "",
      episodesTo: "",
      yearFrom: "",
      yearTo: "",
      ratingFrom: "",
      ratingTo: "",
      votesFrom: "",
      votesTo: "",
      ageRating: [],
      type: [],
      status: "any",
    }
    setFilters(resetFilters)
    onFiltersChange(resetFilters)
    onResetFilters()
  }

  return (
    <div className="w-80 bg-card border-l border-border p-4 space-y-4 h-screen overflow-y-auto sticky top-0 flex-shrink-0">
      <div className="pb-2">
        <h2 className="text-lg font-semibold">Фильтры</h2>
      </div>

      {/* Жанры */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Жанры</Label>
        <Select value={filters.genres} onValueChange={(value) => handleFilterChange("genres", value)}>
          <SelectTrigger className="w-full h-9">
            <SelectValue />
            <ChevronRight className="h-4 w-4 ml-auto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Любые</SelectItem>
            <SelectItem value="action">Экшен</SelectItem>
            <SelectItem value="adventure">Приключения</SelectItem>
            <SelectItem value="comedy">Комедия</SelectItem>
            <SelectItem value="drama">Драма</SelectItem>
            <SelectItem value="fantasy">Фэнтези</SelectItem>
            <SelectItem value="romance">Романтика</SelectItem>
            <SelectItem value="sci-fi">Научная фантастика</SelectItem>
            <SelectItem value="slice-of-life">Повседневность</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Теги */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Теги</Label>
        <Select value={filters.tags} onValueChange={(value) => handleFilterChange("tags", value)}>
          <SelectTrigger className="w-full h-9">
            <SelectValue />
            <ChevronRight className="h-4 w-4 ml-auto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Любые</SelectItem>
            <SelectItem value="school">Школа</SelectItem>
            <SelectItem value="magic">Магия</SelectItem>
            <SelectItem value="supernatural">Сверхъестественное</SelectItem>
            <SelectItem value="military">Военное</SelectItem>
            <SelectItem value="historical">Историческое</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Количество эпизодов */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Количество эпизодов</Label>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="От"
            value={filters.episodesFrom}
            onChange={(e) => handleFilterChange("episodesFrom", e.target.value)}
            className="flex-1 h-9"
          />
          <span className="text-muted-foreground text-sm">—</span>
          <Input
            placeholder="До"
            value={filters.episodesTo}
            onChange={(e) => handleFilterChange("episodesTo", e.target.value)}
            className="flex-1 h-9"
          />
        </div>
      </div>

      {/* Год релиза */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Год релиза</Label>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="От"
            value={filters.yearFrom}
            onChange={(e) => handleFilterChange("yearFrom", e.target.value)}
            className="flex-1 h-9"
          />
          <span className="text-muted-foreground text-sm">—</span>
          <Input
            placeholder="До"
            value={filters.yearTo}
            onChange={(e) => handleFilterChange("yearTo", e.target.value)}
            className="flex-1 h-9"
          />
        </div>
      </div>

      {/* Оценка */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Оценка</Label>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="От"
            value={filters.ratingFrom}
            onChange={(e) => handleFilterChange("ratingFrom", e.target.value)}
            className="flex-1 h-9"
          />
          <span className="text-muted-foreground text-sm">—</span>
          <Input
            placeholder="До"
            value={filters.ratingTo}
            onChange={(e) => handleFilterChange("ratingTo", e.target.value)}
            className="flex-1 h-9"
          />
        </div>
      </div>

      {/* Количество оценок */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Количество оценок</Label>
        <div className="flex items-center space-x-2">
          <Input
            placeholder="От"
            value={filters.votesFrom}
            onChange={(e) => handleFilterChange("votesFrom", e.target.value)}
            className="flex-1 h-9"
          />
          <span className="text-muted-foreground text-sm">—</span>
          <Input
            placeholder="До"
            value={filters.votesTo}
            onChange={(e) => handleFilterChange("votesTo", e.target.value)}
            className="flex-1 h-9"
          />
        </div>
      </div>

      <Separator />

      {/* Возрастной рейтинг */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Возрастной рейтинг</Label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: "none", label: "Нет" },
            { value: "6+", label: "6+" },
            { value: "12+", label: "12+" },
            { value: "16+", label: "16+" },
            { value: "18+", label: "18+" },
            { value: "18+ (RX)", label: "18+ (RX)" },
          ].map((item) => (
            <div key={item.value} className="flex items-center space-x-2">
              <Checkbox
                id={`age-${item.value}`}
                checked={filters.ageRating.includes(item.value)}
                onCheckedChange={(checked) => handleCheckboxChange("ageRating", item.value, checked as boolean)}
              />
              <Label htmlFor={`age-${item.value}`} className="text-xs font-normal">
                {item.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Тип */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Тип</Label>
        <div className="space-y-2">
          {[
            { value: "tv", label: "TV Сериал" },
            { value: "movie", label: "Фильм" },
            { value: "short", label: "Короткометражка" },
            { value: "ova", label: "OVA" },
            { value: "special", label: "Спешл" },
            { value: "ona", label: "ONA" },
            { value: "music", label: "Клип" },
          ].map((item) => (
            <div key={item.value} className="flex items-center space-x-2">
              <Checkbox
                id={`type-${item.value}`}
                checked={filters.type.includes(item.value)}
                onCheckedChange={(checked) => handleCheckboxChange("type", item.value, checked as boolean)}
              />
              <Label htmlFor={`type-${item.value}`} className="text-xs font-normal">
                {item.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Статус тайтла */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Статус тайтла</Label>
        <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
          <SelectTrigger className="w-full h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Любой</SelectItem>
            <SelectItem value="ongoing">Онгоинг</SelectItem>
            <SelectItem value="released">Вышел</SelectItem>
            <SelectItem value="announced">Анонс</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Кнопки */}
      <div className="flex space-x-2 pt-4 sticky bottom-0 bg-card pb-4">
        <Button variant="outline" onClick={handleReset} className="flex-1 h-9 bg-transparent">
          Сбросить
        </Button>
        <Button onClick={onApplyFilters} className="flex-1 h-9 bg-purple-600 hover:bg-purple-700">
          Применить
        </Button>
      </div>
    </div>
  )
}
