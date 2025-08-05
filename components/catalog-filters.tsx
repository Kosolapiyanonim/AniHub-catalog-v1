"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Search, Filter, ChevronDown } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useDebounce } from "@/hooks/use-debounce"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { getGenres, getYears, getStatuses, getTypes, getStudios, getTags } from "@/lib/data-fetchers"

interface CatalogFiltersProps {
  currentFilters: {
    genres: string[]
    years: string[]
    statuses: string[]
    types: string[]
    studios: string[]
    tags: string[]
    search: string
    sort: string
    order: string
    anime_kind: string // New filter
  }
}

export function CatalogFilters({ currentFilters }: CatalogFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [genres, setGenres] = useState<string[]>([])
  const [years, setYears] = useState<string[]>([])
  const [statuses, setStatuses] = useState<string[]>([])
  const [types, setTypes] = useState<string[]>([])
  const [studios, setStudios] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])

  const [selectedGenres, setSelectedGenres] = useState<string[]>(currentFilters.genres)
  const [selectedYears, setSelectedYears] = useState<string[]>(currentFilters.years)
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(currentFilters.statuses)
  const [selectedTypes, setSelectedTypes] = useState<string[]>(currentFilters.types)
  const [selectedStudios, setSelectedStudios] = useState<string[]>(currentFilters.studios)
  const [selectedTags, setSelectedTags] = useState<string[]>(currentFilters.tags)
  const [searchTerm, setSearchTerm] = useState(currentFilters.search)
  const [sortBy, setSortBy] = useState(currentFilters.sort || "shikimori_rating") // Default value set
  const [sortOrder, setSortOrder] = useState(currentFilters.order || "desc") // Default value set
  const [selectedAnimeKind, setSelectedAnimeKind] = useState<string>(currentFilters.anime_kind) // State for new filter

  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  useEffect(() => {
    const fetchFilterOptions = async () => {
      setGenres(await getGenres())
      setYears(await getYears())
      setStatuses(await getStatuses())
      setTypes(await getTypes())
      setStudios(await getStudios())
      setTags(await getTags())
    }
    fetchFilterOptions()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [
    debouncedSearchTerm,
    selectedGenres,
    selectedYears,
    selectedStatuses,
    selectedTypes,
    selectedStudios,
    selectedTags,
    sortBy,
    sortOrder,
    selectedAnimeKind,
  ]) // Add new filter to dependencies

  const createQueryString = useCallback(
    (name: string, value: string | string[]) => {
      const params = new URLSearchParams(searchParams.toString())
      if (Array.isArray(value)) {
        if (value.length > 0) {
          params.set(name, value.join(","))
        } else {
          params.delete(name)
        }
      } else {
        if (value) {
          params.set(name, value)
        } else {
          params.delete(name)
        }
      }
      params.set("page", "1") // Reset to first page on filter change
      return params.toString()
    },
    [searchParams],
  )

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams()
    if (debouncedSearchTerm) params.set("search", debouncedSearchTerm)
    if (selectedGenres.length > 0) params.set("genres", selectedGenres.join(","))
    if (selectedYears.length > 0) params.set("years", selectedYears.join(","))
    if (selectedStatuses.length > 0) params.set("statuses", selectedStatuses.join(","))
    if (selectedTypes.length > 0) params.set("types", selectedTypes.join(","))
    if (selectedStudios.length > 0) params.set("studios", selectedStudios.join(","))
    if (selectedTags.length > 0) params.set("tags", selectedTags.join(","))
    if (sortBy) params.set("sort", sortBy)
    if (sortOrder) params.set("order", sortOrder)
    if (selectedAnimeKind) params.set("anime_kind", selectedAnimeKind) // Apply new filter

    params.set("page", "1") // Always reset to page 1 when filters change
    params.set("limit", currentFilters.limit || "24") // Keep current limit

    router.push(`${pathname}?${params.toString()}`)
  }, [
    debouncedSearchTerm,
    selectedGenres,
    selectedYears,
    selectedStatuses,
    selectedTypes,
    selectedStudios,
    selectedTags,
    sortBy,
    sortOrder,
    selectedAnimeKind, // Add new filter to dependencies
    router,
    pathname,
    currentFilters.limit,
  ])

  const toggleFilter = (filterType: string, value: string) => {
    let newSelection: string[]
    switch (filterType) {
      case "genres":
        newSelection = selectedGenres.includes(value)
          ? selectedGenres.filter((item) => item !== value)
          : [...selectedGenres, value]
        setSelectedGenres(newSelection)
        break
      case "years":
        newSelection = selectedYears.includes(value)
          ? selectedYears.filter((item) => item !== value)
          : [...selectedYears, value]
        setSelectedYears(newSelection)
        break
      case "statuses":
        newSelection = selectedStatuses.includes(value)
          ? selectedStatuses.filter((item) => item !== value)
          : [...selectedStatuses, value]
        setSelectedStatuses(newSelection)
        break
      case "types":
        newSelection = selectedTypes.includes(value)
          ? selectedTypes.filter((item) => item !== value)
          : [...selectedTypes, value]
        setSelectedTypes(newSelection)
        break
      case "studios":
        newSelection = selectedStudios.includes(value)
          ? selectedStudios.filter((item) => item !== value)
          : [...selectedStudios, value]
        setSelectedStudios(newSelection)
        break
      case "tags":
        newSelection = selectedTags.includes(value)
          ? selectedTags.filter((item) => item !== value)
          : [...selectedTags, value]
        setSelectedTags(newSelection)
        break
    }
  }

  const clearAllFilters = () => {
    setSelectedGenres([])
    setSelectedYears([])
    setSelectedStatuses([])
    setSelectedTypes([])
    setSelectedStudios([])
    setSelectedTags([])
    setSearchTerm("")
    setSortBy("shikimori_rating")
    setSortOrder("desc")
    setSelectedAnimeKind("") // Clear new filter
    router.push(pathname)
  }

  const activeFiltersCount =
    selectedGenres.length +
    selectedYears.length +
    selectedStatuses.length +
    selectedTypes.length +
    selectedStudios.length +
    selectedTags.length +
    (searchTerm ? 1 : 0) +
    (sortBy !== "shikimori_rating" || sortOrder !== "desc" ? 1 : 0) +
    (selectedAnimeKind ? 1 : 0) // Count new filter

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по названию..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 w-full"
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <Filter className="h-4 w-4" />
              Фильтры
              {activeFiltersCount > 0 && <Badge className="ml-1">{activeFiltersCount}</Badge>}
              <ChevronDown className="h-4 w-4 ml-auto" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="end">
            <ScrollArea className="h-[400px]">
              <div className="p-4">
                <h4 className="font-medium text-sm mb-3">Сортировка</h4>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Сортировать по" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shikimori_rating">Рейтинг</SelectItem>
                      <SelectItem value="episodes">Эпизоды</SelectItem>
                      <SelectItem value="aired_on">Дата выхода</SelectItem>
                      <SelectItem value="title">Название</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Порядок" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">По убыванию</SelectItem>
                      <SelectItem value="asc">По возрастанию</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <h4 className="font-medium text-sm mb-3">Тип аниме</h4>
                <Select value={selectedAnimeKind} onValueChange={setSelectedAnimeKind}>
                  <SelectTrigger className="w-full mb-4">
                    <SelectValue placeholder="Выберите тип" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все</SelectItem>
                    <SelectItem value="tv">TV</SelectItem>
                    <SelectItem value="movie">Фильм</SelectItem>
                    <SelectItem value="ova">OVA</SelectItem>
                    <SelectItem value="ona">ONA</SelectItem>
                    <SelectItem value="special">Спешл</SelectItem>
                    <SelectItem value="music">Музыка</SelectItem>
                  </SelectContent>
                </Select>

                <Accordion type="multiple" className="w-full">
                  <AccordionItem value="genres">
                    <AccordionTrigger className="text-sm font-medium">Жанры</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2">
                        {genres.map((genre) => (
                          <div key={genre} className="flex items-center space-x-2">
                            <Checkbox
                              id={`genre-${genre}`}
                              checked={selectedGenres.includes(genre)}
                              onCheckedChange={() => toggleFilter("genres", genre)}
                            />
                            <Label htmlFor={`genre-${genre}`}>{genre}</Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="years">
                    <AccordionTrigger className="text-sm font-medium">Годы</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2">
                        {years.map((year) => (
                          <div key={year} className="flex items-center space-x-2">
                            <Checkbox
                              id={`year-${year}`}
                              checked={selectedYears.includes(year)}
                              onCheckedChange={() => toggleFilter("years", year)}
                            />
                            <Label htmlFor={`year-${year}`}>{year}</Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="statuses">
                    <AccordionTrigger className="text-sm font-medium">Статусы</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2">
                        {statuses.map((status) => (
                          <div key={status} className="flex items-center space-x-2">
                            <Checkbox
                              id={`status-${status}`}
                              checked={selectedStatuses.includes(status)}
                              onCheckedChange={() => toggleFilter("statuses", status)}
                            />
                            <Label htmlFor={`status-${status}`}>{status}</Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="types">
                    <AccordionTrigger className="text-sm font-medium">Типы</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2">
                        {types.map((type) => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox
                              id={`type-${type}`}
                              checked={selectedTypes.includes(type)}
                              onCheckedChange={() => toggleFilter("types", type)}
                            />
                            <Label htmlFor={`type-${type}`}>{type}</Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="studios">
                    <AccordionTrigger className="text-sm font-medium">Студии</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2">
                        {studios.map((studio) => (
                          <div key={studio} className="flex items-center space-x-2">
                            <Checkbox
                              id={`studio-${studio}`}
                              checked={selectedStudios.includes(studio)}
                              onCheckedChange={() => toggleFilter("studios", studio)}
                            />
                            <Label htmlFor={`studio-${studio}`}>{studio}</Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="tags">
                    <AccordionTrigger className="text-sm font-medium">Теги</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2">
                        {tags.map((tag) => (
                          <div key={tag} className="flex items-center space-x-2">
                            <Checkbox
                              id={`tag-${tag}`}
                              checked={selectedTags.includes(tag)}
                              onCheckedChange={() => toggleFilter("tags", tag)}
                            />
                            <Label htmlFor={`tag-${tag}`}>{tag}</Label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="mt-4">
                  <Button variant="outline" className="w-full bg-transparent" onClick={clearAllFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Сбросить все
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>
      </div>

      {(selectedGenres.length > 0 ||
        selectedYears.length > 0 ||
        selectedStatuses.length > 0 ||
        selectedTypes.length > 0 ||
        selectedStudios.length > 0 ||
        selectedTags.length > 0 ||
        searchTerm ||
        selectedAnimeKind) && ( // Display new filter in active badges
        <div className="flex flex-wrap gap-2 mt-4">
          {searchTerm && (
            <Badge variant="secondary">
              Поиск: {searchTerm}
              <Button variant="ghost" size="icon" className="h-4 w-4 ml-1" onClick={() => setSearchTerm("")}>
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {selectedAnimeKind && (
            <Badge variant="secondary">
              Тип: {selectedAnimeKind}
              <Button variant="ghost" size="icon" className="h-4 w-4 ml-1" onClick={() => setSelectedAnimeKind("")}>
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {selectedGenres.map((genre) => (
            <Badge key={genre} variant="secondary">
              {genre}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1"
                onClick={() => toggleFilter("genres", genre)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {selectedYears.map((year) => (
            <Badge key={year} variant="secondary">
              {year}
              <Button variant="ghost" size="icon" className="h-4 w-4 ml-1" onClick={() => toggleFilter("years", year)}>
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {selectedStatuses.map((status) => (
            <Badge key={status} variant="secondary">
              {status}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1"
                onClick={() => toggleFilter("statuses", status)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {selectedTypes.map((type) => (
            <Badge key={type} variant="secondary">
              {type}
              <Button variant="ghost" size="icon" className="h-4 w-4 ml-1" onClick={() => toggleFilter("types", type)}>
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {selectedStudios.map((studio) => (
            <Badge key={studio} variant="secondary">
              {studio}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1"
                onClick={() => toggleFilter("studios", studio)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
              <Button variant="ghost" size="icon" className="h-4 w-4 ml-1" onClick={() => toggleFilter("tags", tag)}>
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {(sortBy !== "shikimori_rating" || sortOrder !== "desc") && (
            <Badge variant="secondary">
              Сортировка: {sortBy} ({sortOrder === "asc" ? "возр." : "убыв."})
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1"
                onClick={() => {
                  setSortBy("shikimori_rating")
                  setSortOrder("desc")
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
