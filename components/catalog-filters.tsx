'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, Filter, X } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useDebounce } from '@/hooks/use-debounce'

interface CatalogFiltersProps {
  initialSearch?: string
  initialGenres?: string[]
  initialYears?: number[]
  initialStatuses?: string[]
  initialTypes?: string[]
  initialStudios?: string[]
  initialSort?: string
  availableGenres: string[]
  availableStudios: string[]
  availableYears: number[]
  availableStatuses: string[]
  availableTypes: string[]
}

export function CatalogFilters({
  initialSearch = '',
  initialGenres = [],
  initialYears = [],
  initialStatuses = [],
  initialTypes = [],
  initialStudios = [],
  initialSort = 'shikimori_rating.desc',
  availableGenres,
  availableStudios,
  availableYears,
  availableStatuses,
  availableTypes,
}: CatalogFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(initialSearch)
  const [selectedGenres, setSelectedGenres] = useState<string[]>(initialGenres)
  const [selectedYears, setSelectedYears] = useState<number[]>(initialYears)
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(initialStatuses)
  const [selectedTypes, setSelectedTypes] = useState<string[]>(initialTypes)
  const [selectedStudios, setSelectedStudios] = useState<string[]>(initialStudios)
  const [sort, setSort] = useState(initialSort)

  const debouncedSearch = useDebounce(search, 500)

  // Sync state with URL params on initial load and param changes
  useEffect(() => {
    setSearch(searchParams.get('search') || '')
    setSelectedGenres(searchParams.get('genres')?.split(',').filter(Boolean) || [])
    setSelectedYears(searchParams.get('years')?.split(',').map(Number).filter(Boolean) || [])
    setSelectedStatuses(searchParams.get('statuses')?.split(',').filter(Boolean) || [])
    setSelectedTypes(searchParams.get('types')?.split(',').filter(Boolean) || [])
    setSelectedStudios(searchParams.get('studios')?.split(',').filter(Boolean) || [])
    setSort(searchParams.get('sort') || 'shikimori_rating.desc')
  }, [searchParams])

  const createQueryString = useCallback(
    (paramsToUpdate: Record<string, string | string[] | number[] | undefined>) => {
      const params = new URLSearchParams(searchParams.toString())

      Object.entries(paramsToUpdate).forEach(([name, value]) => {
        if (value === undefined || value.length === 0) {
          params.delete(name)
        } else if (Array.isArray(value)) {
          params.set(name, value.join(','))
        } else {
          params.set(name, String(value))
        }
      })
      params.set('page', '1') // Reset to first page on filter change
      return params.toString()
    },
    [searchParams]
  )

  useEffect(() => {
    const newQueryString = createQueryString({ search: debouncedSearch })
    router.push(`?${newQueryString}`, { scroll: false })
  }, [debouncedSearch, createQueryString, router])

  const applyFilters = useCallback(() => {
    const newQueryString = createQueryString({
      genres: selectedGenres,
      years: selectedYears,
      statuses: selectedStatuses,
      types: selectedTypes,
      studios: selectedStudios,
      sort,
    })
    router.push(`?${newQueryString}`, { scroll: false })
  }, [selectedGenres, selectedYears, selectedStatuses, selectedTypes, selectedStudios, sort, createQueryString, router])

  const resetFilters = useCallback(() => {
    setSearch('')
    setSelectedGenres([])
    setSelectedYears([])
    setSelectedStatuses([])
    setSelectedTypes([])
    setSelectedStudios([])
    setSort('shikimori_rating.desc')
    router.push('/catalog', { scroll: false })
  }, [router])

  const handleGenreChange = (genre: string, checked: boolean) => {
    setSelectedGenres((prev) =>
      checked ? [...prev, genre] : prev.filter((g) => g !== genre)
    )
  }

  const handleYearChange = (year: number, checked: boolean) => {
    setSelectedYears((prev) =>
      checked ? [...prev, year] : prev.filter((y) => y !== year)
    )
  }

  const handleStatusChange = (status: string, checked: boolean) => {
    setSelectedStatuses((prev) =>
      checked ? [...prev, status] : prev.filter((s) => s !== status)
    )
  }

  const handleTypeChange = (type: string, checked: boolean) => {
    setSelectedTypes((prev) =>
      checked ? [...prev, type] : prev.filter((t) => t !== type)
    )
  }

  const handleStudioChange = (studio: string, checked: boolean) => {
    setSelectedStudios((prev) =>
      checked ? [...prev, studio] : prev.filter((s) => s !== studio)
    )
  }

  return (
    <div className="bg-card p-6 rounded-lg shadow-md sticky top-20">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Filter className="h-6 w-6" />
        Фильтры
      </h2>

      <div className="space-y-6">
        {/* Search */}
        <div>
          <Label htmlFor="search">Поиск по названию</Label>
          <Input
            id="search"
            type="text"
            placeholder="Найти аниме..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Sort */}
        <div>
          <Label htmlFor="sort">Сортировка</Label>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-full mt-1">
              <SelectValue placeholder="Выберите сортировку" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="shikimori_rating.desc">Рейтинг Shikimori (убыв.)</SelectItem>
              <SelectItem value="shikimori_rating.asc">Рейтинг Shikimori (возр.)</SelectItem>
              <SelectItem value="year.desc">Год выпуска (убыв.)</SelectItem>
              <SelectItem value="year.asc">Год выпуска (возр.)</SelectItem>
              <SelectItem value="title.asc">Название (А-Я)</SelectItem>
              <SelectItem value="title.desc">Название (Я-А)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Genres */}
        <Collapsible>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-semibold text-lg [&[data-state=open]>svg]:rotate-180">
            Жанры
            <ChevronDown className="h-5 w-5 transition-transform duration-200" />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {availableGenres.map((genre) => (
              <div key={genre} className="flex items-center space-x-2">
                <Checkbox
                  id={`genre-${genre}`}
                  checked={selectedGenres.includes(genre)}
                  onCheckedChange={(checked) => handleGenreChange(genre, checked as boolean)}
                />
                <Label htmlFor={`genre-${genre}`}>{genre}</Label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Years */}
        <Collapsible>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-semibold text-lg [&[data-state=open]>svg]:rotate-180">
            Годы выпуска
            <ChevronDown className="h-5 w-5 transition-transform duration-200" />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {availableYears.map((year) => (
              <div key={year} className="flex items-center space-x-2">
                <Checkbox
                  id={`year-${year}`}
                  checked={selectedYears.includes(year)}
                  onCheckedChange={(checked) => handleYearChange(year, checked as boolean)}
                />
                <Label htmlFor={`year-${year}`}>{year}</Label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Statuses */}
        <Collapsible>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-semibold text-lg [&[data-state=open]>svg]:rotate-180">
            Статусы
            <ChevronDown className="h-5 w-5 transition-transform duration-200" />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {availableStatuses.map((status) => (
              <div key={status} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${status}`}
                  checked={selectedStatuses.includes(status)}
                  onCheckedChange={(checked) => handleStatusChange(status, checked as boolean)}
                />
                <Label htmlFor={`status-${status}`}>{status}</Label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Types */}
        <Collapsible>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-semibold text-lg [&[data-state=open]>svg]:rotate-180">
            Типы
            <ChevronDown className="h-5 w-5 transition-transform duration-200" />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {availableTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type}`}
                  checked={selectedTypes.includes(type)}
                  onCheckedChange={(checked) => handleTypeChange(type, checked as boolean)}
                />
                <Label htmlFor={`type-${type}`}>{type}</Label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Studios */}
        <Collapsible>
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-semibold text-lg [&[data-state=open]>svg]:rotate-180">
            Студии
            <ChevronDown className="h-5 w-5 transition-transform duration-200" />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {availableStudios.map((studio) => (
              <div key={studio} className="flex items-center space-x-2">
                <Checkbox
                  id={`studio-${studio}`}
                  checked={selectedStudios.includes(studio)}
                  onCheckedChange={(checked) => handleStudioChange(studio, checked as boolean)}
                />
                <Label htmlFor={`studio-${studio}`}>{studio}</Label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        <div className="flex gap-2 mt-6">
          <Button onClick={applyFilters} className="flex-1">Применить</Button>
          <Button onClick={resetFilters} variant="outline" className="flex-1">
            <X className="h-4 w-4 mr-2" />
            Сбросить
          </Button>
        </div>
      </div>
    </div>
  )
}
