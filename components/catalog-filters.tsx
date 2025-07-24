"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SlidersHorizontal, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "./ui/checkbox"
import { Label } from "./ui/label"
import { useSupabase } from "@/components/supabase-provider"

type FilterItem = { id: number; name: string; slug: string }

export interface FiltersState {
  title: string
  sort: string
  year_from: string
  year_to: string
  genres: string[]
  genres_exclude: string[]
  studios: string[]
  studios_exclude: string[]
  kinds: string[]
  statuses: string[]
  user_list_status: string
}

export const DEFAULT_FILTERS: FiltersState = {
  title: "",
  sort: "shikimori_votes",
  year_from: "",
  year_to: "",
  genres: [],
  genres_exclude: [],
  studios: [],
  studios_exclude: [],
  kinds: [],
  statuses: [],
  user_list_status: "",
}

const animeKinds = ["tv", "movie", "ova", "ona", "special"]
const animeStatuses = ["released", "ongoing", "anons"]

interface CatalogFiltersProps {
  initialFilters: FiltersState
  onApply: (filters: FiltersState) => void
}

export function CatalogFilters({ initialFilters, onApply }: CatalogFiltersProps) {
  const { session } = useSupabase()
  const [filters, setFilters] = useState(initialFilters)
  const [genres, setGenres] = useState<FilterItem[]>([])
  const [studios, setStudios] = useState<FilterItem[]>([])
  const [tags, setTags] = useState<FilterItem[]>([])

  useEffect(() => {
    setFilters(initialFilters)
  }, [initialFilters])

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [genresRes, studiosRes, tagsRes] = await Promise.all([
          fetch("/api/genres"),
          fetch("/api/studios"),
          fetch("/api/tags"),
        ])
        if (genresRes.ok) setGenres(await genresRes.json())
        if (studiosRes.ok) setStudios(await studiosRes.json())
        if (tagsRes.ok) setTags(await tagsRes.json())
      } catch (error) {
        console.error("Failed to fetch filter data", error)
      }
    }
    fetchFilterData()
  }, [])

  const handleApply = () => onApply(filters)
  const handleReset = () => onApply(DEFAULT_FILTERS)

  const CheckboxGroup = ({
    items,
    selected,
    onChange,
  }: { items: string[]; selected: string[]; onChange: (newSelected: string[]) => void }) => {
    const handleCheckboxChange = (item: string, isChecked: boolean) => {
      if (isChecked) {
        onChange([...selected, item])
      } else {
        onChange(selected.filter((s) => s !== item))
      }
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((item) => (
          <div key={item} className="flex items-center space-x-2">
            <Checkbox
              id={`filter-${item}`}
              checked={selected.includes(item)}
              onCheckedChange={(checked) => handleCheckboxChange(item, !!checked)}
            />
            <Label htmlFor={`filter-${item}`} className="capitalize text-gray-300 text-sm">
              {item}
            </Label>
          </div>
        ))}
      </div>
    )
  }

  const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <AccordionItem value={title.toLowerCase().replace(/\s/g, "-")}>
      <AccordionTrigger className="text-white hover:no-underline text-sm py-3">{title}</AccordionTrigger>
      <AccordionContent className="pt-2 pb-4">{children}</AccordionContent>
    </AccordionItem>
  )

  return (
    <Card className="bg-slate-800 border-slate-700 w-full">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-white text-lg">
            <SlidersHorizontal className="w-5 h-5" />
            Фильтры
          </CardTitle>
          <Button onClick={handleReset} variant="ghost" size="sm" className="text-gray-400 hover:text-white h-8 px-2">
            <X className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Сбросить</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-4 sm:px-6">
        {/* Search */}
        <div>
          <Label htmlFor="title-search" className="sr-only">
            Поиск по названию
          </Label>
          <Input
            id="title-search"
            placeholder="Название аниме..."
            value={filters.title}
            onChange={(e) => setFilters((prev) => ({ ...prev, title: e.target.value }))}
            className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 h-10"
          />
        </div>

        {/* Sort */}
        <div className="space-y-2">
          <Label htmlFor="sort-by" className="text-gray-300 text-sm">
            Сортировать по
          </Label>
          <Select value={filters.sort} onValueChange={(val) => setFilters((prev) => ({ ...prev, sort: val }))}>
            <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white h-10">
              <SelectValue placeholder="Выберите опцию" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-white">
              <SelectItem value="shikimori_votes">Популярности</SelectItem>
              <SelectItem value="year">Году выпуска</SelectItem>
              <SelectItem value="shikimori_rating">Рейтингу</SelectItem>
              <SelectItem value="title">Названию</SelectItem>
              <SelectItem value="updated_at_kodik">Обновлению</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleApply} className="w-full bg-purple-600 hover:bg-purple-700 text-white h-10">
          Применить
        </Button>

        <Accordion
          type="multiple"
          className="w-full"
          defaultValue={session ? ["user_list_status", "genres"] : ["genres"]}
        >
          {/* User List Status */}
          {session && (
            <FilterSection title="Мой список">
              <Select
                value={filters.user_list_status}
                onValueChange={(val) => setFilters((prev) => ({ ...prev, user_list_status: val }))}
              >
                <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white h-10">
                  <SelectValue placeholder="Выберите статус" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  <SelectItem value="all">Все</SelectItem>
                  <SelectItem value="watching">Смотрю</SelectItem>
                  <SelectItem value="planned">Запланировано</SelectItem>
                  <SelectItem value="completed">Просмотрено</SelectItem>
                  <SelectItem value="dropped">Брошено</SelectItem>
                  <SelectItem value="on_hold">Отложено</SelectItem>
                </SelectContent>
              </Select>
            </FilterSection>
          )}

          {/* Type */}
          <FilterSection title="Тип">
            <CheckboxGroup
              items={animeKinds}
              selected={filters.kinds}
              onChange={(val) => setFilters((prev) => ({ ...prev, kinds: val }))}
            />
          </FilterSection>

          {/* Status */}
          <FilterSection title="Статус">
            <CheckboxGroup
              items={animeStatuses}
              selected={filters.statuses}
              onChange={(val) => setFilters((prev) => ({ ...prev, statuses: val }))}
            />
          </FilterSection>

          {/* Year */}
          <FilterSection title="Год">
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="От"
                value={filters.year_from}
                onChange={(e) => setFilters((prev) => ({ ...prev, year_from: e.target.value }))}
                className="w-1/2 bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 h-10"
              />
              <Input
                type="number"
                placeholder="До"
                value={filters.year_to}
                onChange={(e) => setFilters((prev) => ({ ...prev, year_to: e.target.value }))}
                className="w-1/2 bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 h-10"
              />
            </div>
          </FilterSection>

          {/* Genres */}
          <FilterSection title="Жанры">
            <ScrollArea className="h-[200px] pr-2">
              <CheckboxGroup
                items={genres.map((g) => g.name)}
                selected={filters.genres}
                onChange={(val) => setFilters((prev) => ({ ...prev, genres: val }))}
              />
            </ScrollArea>
          </FilterSection>

          {/* Studios */}
          <FilterSection title="Студии">
            <ScrollArea className="h-[200px] pr-2">
              <CheckboxGroup
                items={studios.map((s) => s.name)}
                selected={filters.studios}
                onChange={(val) => setFilters((prev) => ({ ...prev, studios: val }))}
              />
            </ScrollArea>
          </FilterSection>
        </Accordion>
      </CardContent>
    </Card>
  )
}
