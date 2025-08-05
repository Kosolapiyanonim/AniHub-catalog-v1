"use client"

import { useState, useEffect, useRef } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { AspectRatio } from "@/components/ui/aspect-ratio"

interface Translation {
  id: string
  title: string
  player_url: string
  episodes_count: number
}

interface PlayerClientProps {
  translations: Translation[]
  initialTranslationId?: string
}

export function PlayerClient({ translations, initialTranslationId }: PlayerClientProps) {
  const [selectedTranslation, setSelectedTranslation] = useState<Translation | undefined>(undefined)
  const [selectedEpisode, setSelectedEpisode] = useState<number>(1)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (translations && translations.length > 0) {
      const initial = initialTranslationId ? translations.find((t) => t.id === initialTranslationId) : translations[0]
      setSelectedTranslation(initial)
    }
  }, [translations, initialTranslationId])

  useEffect(() => {
    // Reset episode to 1 when translation changes
    setSelectedEpisode(1)
  }, [selectedTranslation])

  const getPlayerUrl = () => {
    if (!selectedTranslation) return ""
    const url = new URL(selectedTranslation.player_url)
    url.searchParams.set("episode", selectedEpisode.toString())
    return url.toString()
  }

  if (!selectedTranslation && translations.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p>Нет доступных переводов для этого аниме.</p>
      </div>
    )
  }

  if (!selectedTranslation) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p>Загрузка плеера...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <AspectRatio ratio={16 / 9}>
        <iframe
          ref={iframeRef}
          src={getPlayerUrl()}
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen
          className="rounded-lg"
        ></iframe>
      </AspectRatio>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="translation-select">Перевод</Label>
          <Select
            value={selectedTranslation.id}
            onValueChange={(value) => setSelectedTranslation(translations.find((t) => t.id === value))}
          >
            <SelectTrigger id="translation-select">
              <SelectValue placeholder="Выберите перевод" />
            </SelectTrigger>
            <SelectContent>
              {translations.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.title} ({t.episodes_count} эп.)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="episode-select">Эпизод</Label>
          <Select
            value={selectedEpisode.toString()}
            onValueChange={(value) => setSelectedEpisode(Number.parseInt(value))}
            disabled={!selectedTranslation || selectedTranslation.episodes_count === 0}
          >
            <SelectTrigger id="episode-select">
              <SelectValue placeholder="Выберите эпизод" />
            </SelectTrigger>
            <SelectContent>
              {selectedTranslation &&
                Array.from({ length: selectedTranslation.episodes_count }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    Эпизод {i + 1}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
