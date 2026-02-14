"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Star } from "lucide-react"

type Translation = {
  id: string | number
  title: string
  type?: string | null
  quality?: string | null
  player_link?: string | null
}

type EpisodeRating = { episode_number: number; rating: number; is_favorite: boolean }

export default function WatchControls({
  translations,
  episodesAired,
  episodesTotal,
  animeId,
}: {
  translations: Translation[]
  episodesAired: number | null
  episodesTotal: number | null
  animeId: number
}) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [selectedEpisode, setSelectedEpisode] = useState(1)
  const [ratings, setRatings] = useState<Record<number, EpisodeRating>>({})
  const [saving, setSaving] = useState(false)
  const selectedLink = translations[selectedIndex]?.player_link || ""

  const maxEpisodes = useMemo(() => {
    const aired = typeof episodesAired === "number" && episodesAired > 0 ? episodesAired : 1
    return Math.min(aired, 50)
  }, [episodesAired])

  useEffect(() => {
    fetch(`/api/ratings/episodes?anime_id=${animeId}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data) => {
        const map: Record<number, EpisodeRating> = {}
        for (const item of data.items ?? []) map[item.episode_number] = item
        setRatings(map)
      })
      .catch(() => undefined)
  }, [animeId])

  useEffect(() => {
    if (!selectedLink) return
    const link = selectedLink.startsWith("//") ? `https:${selectedLink}` : selectedLink
    window.dispatchEvent(new CustomEvent("anihub:kodik:setSrc", { detail: link }))
  }, [selectedLink])

  const setEpisode = (episodeNum: number) => {
    setSelectedEpisode(episodeNum)
    if (!selectedLink) return
    try {
      const base = selectedLink.startsWith("//") ? `https:${selectedLink}` : selectedLink
      const url = new URL(base)
      url.searchParams.set("episode", String(episodeNum))
      window.dispatchEvent(new CustomEvent("anihub:kodik:setSrc", { detail: url.toString() }))
    } catch {
      window.dispatchEvent(new CustomEvent("anihub:kodik:setSrc", { detail: selectedLink }))
    }
  }

  const saveEpisodeRating = async (value: number | null, favorite = ratings[selectedEpisode]?.is_favorite ?? false) => {
    setSaving(true)
    try {
      const res = await fetch("/api/ratings/episodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anime_id: animeId,
          episode_number: selectedEpisode,
          rating: value,
          is_favorite: favorite,
        }),
      })

      if (!res.ok) return

      setRatings((prev) => {
        const next = { ...prev }
        if (value == null && !favorite) {
          delete next[selectedEpisode]
        } else {
          next[selectedEpisode] = {
            episode_number: selectedEpisode,
            rating: value ?? prev[selectedEpisode]?.rating ?? 1,
            is_favorite: favorite,
          }
        }
        return next
      })
    } finally {
      setSaving(false)
    }
  }

  const selectedEpisodeRating = ratings[selectedEpisode]

  return (
    <>
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Оценка серии {selectedEpisode}</h3>
            {selectedEpisodeRating?.rating ? <span className="text-amber-300 text-sm">{selectedEpisodeRating.rating}/10</span> : null}
          </div>
          <div className="grid grid-cols-5 gap-1">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
              <Button
                key={value}
                type="button"
                size="sm"
                variant={selectedEpisodeRating?.rating === value ? "default" : "outline"}
                className={selectedEpisodeRating?.rating === value ? "bg-amber-500 hover:bg-amber-600 text-black" : "text-slate-200"}
                disabled={saving}
                onClick={() => saveEpisodeRating(selectedEpisodeRating?.rating === value ? null : value)}
              >
                <Star className="w-3 h-3 mr-1" />
                {value}
              </Button>
            ))}
          </div>
          <Button
            type="button"
            variant={selectedEpisodeRating?.is_favorite ? "default" : "outline"}
            className={selectedEpisodeRating?.is_favorite ? "bg-rose-500 hover:bg-rose-600" : "text-slate-200"}
            onClick={() => saveEpisodeRating(selectedEpisodeRating?.rating ?? null, !selectedEpisodeRating?.is_favorite)}
            disabled={saving}
          >
            <Heart className="w-4 h-4 mr-2" />
            {selectedEpisodeRating?.is_favorite ? "Любимая серия" : "Добавить в любимые серии"}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="p-4 border-b border-slate-700">
            <h3 className="font-semibold text-white">Эпизоды</h3>
            <p className="text-sm text-slate-400">
              {episodesAired ?? 0} из {episodesTotal ?? "??"}
            </p>
          </div>
          <ScrollArea className="h-64">
            <div className="p-2">
              {Array.from({ length: maxEpisodes }, (_, i) => (
                <button
                  key={i}
                  className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
                    i + 1 === selectedEpisode
                      ? "bg-purple-600/20 border border-purple-500/30 text-purple-300"
                      : "hover:bg-slate-700/50 text-slate-300"
                  }`}
                  onClick={() => setEpisode(i + 1)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Эпизод {i + 1}</span>
                    <span className="text-xs text-slate-500">24:00</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Серия {i + 1}</p>
                  {ratings[i + 1]?.rating ? (
                    <div className="mt-1 text-xs text-amber-300 flex items-center gap-1">
                      <Star className="w-3 h-3" /> {ratings[i + 1].rating}/10 {ratings[i + 1].is_favorite ? "• ❤" : ""}
                    </div>
                  ) : null}
                </button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="p-4 border-b border-slate-700">
            <h3 className="font-semibold text-white">Озвучки</h3>
            <p className="text-sm text-slate-400">{translations.length} доступно</p>
          </div>
          <ScrollArea className="h-48">
            <div className="p-2">
              {translations.slice(0, 50).map((translation, index) => (
                <button
                  key={String(translation.id)}
                  className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
                    index === selectedIndex
                      ? "bg-blue-600/20 border border-blue-500/30 text-blue-300"
                      : "hover:bg-slate-700/50 text-slate-300"
                  }`}
                  onClick={() => setSelectedIndex(index)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{translation.title}</span>
                    <Badge variant="secondary" className="text-xs">
                      {translation.quality || translation.type || "—"}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{translation.type || "voice"}</p>
                </button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </>
  )
}
