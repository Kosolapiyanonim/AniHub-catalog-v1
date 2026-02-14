// /components/catalog-filters.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SlidersHorizontal } from "lucide-react"
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
  tags: string[]
  tags_exclude: string[]
  kinds: string[] // <-- ИЗМЕНЕНИЕ: types заменен на kinds
  statuses: string[]
  user_list_status: string
}

export const DEFAULT_FILTERS: FiltersState = {
  title: "",
  sort: "shikimori_votes", // <-- ИЗМЕНЕНИЕ: Установлено значение по умолчанию
  year_from: "",
  year_to: "",
  genres: [],
  genres_exclude: [],
  studios: [],
  studios_exclude: [],
  tags: [],
  tags_exclude: [],
  kinds: [], // <-- ИЗМЕНЕНИЕ
  statuses: [],
  user_list_status: "", // <-- ИЗМЕНЕНИЕ: Установлено значение по умолчанию
}

// Список возможных типов, которые приходят от Kodik
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

  // Вспомогательный компонент для группы чекбо��сов
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
      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => (
          <div key={item} className="flex items-center space-x-2">
            <Checkbox
              id={`filter-${item}`}
              checked={selected.includes(item)}
              onCheckedChange={(checked) => handleCheckboxChange(item, !!checked)}
            />
            <Label htmlFor={`filter-${item}`} className="capitalize text-gray-300">
              {item}
            </Label>
          </div>
        ))}
      </div>
    )
  }

  // Вспомогательный компонент для секции фильтра
  const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <AccordionItem value={title.toLowerCase().replace(/\s/g, "-")}>
      <AccordionTrigger className="text-white hover:no-underline">{title}</AccordionTrigger>
      <AccordionContent className="pt-2">{children}</AccordionContent>
    </AccordionItem>
  )

  return (
    <Card className="sticky top-20 bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-white">
            <SlidersHorizontal className="w-5 h-5" />
            Фильтры
          </CardTitle>
          <Button onClick={handleReset} variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            Сбросить
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Поиск по названию */}
        <div>
          <Label htmlFor="title-search" className="sr-only">
            Поиск по названию
          </Label>
          <Input
            id="title-search"
            placeholder="Название аниме..."
            value={filters.title}
            onChange={(e) => setFilters((prev) => ({ ...prev, title: e.target.value }))}
            className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
          />
        </div>

        {/* Сортировка */}
        <div className="space-y-2">
          <Label htmlFor="sort-by" className="text-gray-300">
            Сортировать по
          </Label>
          <Select value={filters.sort} onValueChange={(val) => setFilters((prev) => ({ ...prev, sort: val }))}>
            <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white">
              <SelectValue placeholder="Выберите опцию" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-white">
              <SelectItem value="shikimori_votes">Популярности</SelectItem>
              <SelectItem value="year">Году выпуска</SelectItem>
              <SelectItem value="shikimori_rating">Рейтингу</SelectItem>
              <SelectItem value="title">Названию</SelectItem>
              {session ? <SelectItem value="user_rating">Моей оценке</SelectItem> : null}
              <SelectItem value="updated_at_kodik">Обновлению</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleApply} className="w-full bg-primary hover:bg-primary/90 text-white">
          Применить
        </Button>

        <Accordion type="multiple" className="w-full" defaultValue={["user_list_status", "genres"]}>
          {/* Фильтр по типу (anime_kind) */}
          <FilterSection title="Тип">
            <CheckboxGroup
              items={animeKinds}
              selected={filters.kinds}
              onChange={(val) => setFilters((prev) => ({ ...prev, kinds: val }))}
            />
          </FilterSection>

          {/* Фильтр по статусу */}
          <FilterSection title="Статус">
            <CheckboxGroup
              items={animeStatuses}
              selected={filters.statuses}
              onChange={(val) => setFilters((prev) => ({ ...prev, statuses: val }))}
            />
          </FilterSection>

          {/* Фильтр по годам */}
          <FilterSection title="Год">
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="От"
                value={filters.year_from}
                onChange={(e) => setFilters((prev) => ({ ...prev, year_from: e.target.value }))}
                className="w-1/2 bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
              />
              <Input
                type="number"
                placeholder="До"
                value={filters.year_to}
                onChange={(e) => setFilters((prev) => ({ ...prev, year_to: e.target.value }))}
                className="w-1/2 bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
              />
            </div>
          </FilterSection>

          {/* Фильтр по жанрам */}
          <FilterSection title="Жанры">
            <ScrollArea className="h-[200px] pr-4">
              <CheckboxGroup
                items={genres.map((g) => g.name)}
                selected={filters.genres}
                onChange={(val) => setFilters((prev) => ({ ...prev, genres: val }))}
              />
            </ScrollArea>
          </FilterSection>

          {/* Фильтр по студиям */}
          <FilterSection title="Студии">
            <ScrollArea className="h-[200px] pr-4">
              <CheckboxGroup
                items={studios.map((s) => s.name)}
                selected={filters.studios}
                onChange={(val) => setFilters((prev) => ({ ...prev, studios: val }))}
              />
            </ScrollArea>
          </FilterSection>

          {/* Фильтр по тегам (если применимо) */}
          {/* <FilterSection title="Теги">
            <ScrollArea className="h-[200px] pr-4">
              <CheckboxGroup
                items={tags.map(t => t.name)}
                selected={filters.tags}
                onChange={val => setFilters(prev => ({ ...prev, tags: val }))}
              />
            </ScrollArea>
          </FilterSection> */}

          {session && (
            <FilterSection title="Мой список">
              <Select
                value={filters.user_list_status}
                onValueChange={(val) => setFilters((prev) => ({ ...prev, user_list_status: val }))}
              >
                <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Выберите статус" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  <SelectItem value="all">Все</SelectItem> {/* <-- ИЗМЕНЕНИЕ: Значение не пустое */}
                  <SelectItem value="watching">Смотрю</SelectItem>
                  <SelectItem value="planned">Запланировано</SelectItem>
                  <SelectItem value="completed">Просмотрено</SelectItem>
                  <SelectItem value="dropped">Брошено</SelectItem>
                  <SelectItem value="on_hold">Отложено</SelectItem>
                </SelectContent>
              </Select>
            </FilterSection>
          )}
        </Accordion>
      </CardContent>
    </Card>
  )
}
