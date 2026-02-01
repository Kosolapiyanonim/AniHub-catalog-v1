"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

type Translation = {
  id: string | number
  title: string
  type?: string | null
  quality?: string | null
  player_link?: string | null
}

export default function WatchControls({
  translations,
  episodesAired,
  episodesTotal,
}: {
  translations: Translation[]
  episodesAired: number | null
  episodesTotal: number | null
}) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selectedLink = translations[selectedIndex]?.player_link || ""

  const maxEpisodes = useMemo(() => {
    const aired = typeof episodesAired === "number" && episodesAired > 0 ? episodesAired : 1
    return Math.min(aired, 50)
  }, [episodesAired])

  useEffect(() => {
    // On mount or translation change, set base src
    if (!selectedLink) return
    const link = selectedLink.startsWith("//") ? `https:${selectedLink}` : selectedLink
    window.dispatchEvent(new CustomEvent("anihub:kodik:setSrc", { detail: link }))
  }, [selectedLink])

  const setEpisode = (episodeNum: number) => {
    if (!selectedLink) return
    try {
      const base = selectedLink.startsWith("//") ? `https:${selectedLink}` : selectedLink
      const url = new URL(base)
      // Best-effort: if Kodik supports episode param on this link
      url.searchParams.set("episode", String(episodeNum))
      window.dispatchEvent(new CustomEvent("anihub:kodik:setSrc", { detail: url.toString() }))
    } catch {
      // Fallback: just re-dispatch base link
      window.dispatchEvent(new CustomEvent("anihub:kodik:setSrc", { detail: selectedLink }))
    }
  }

  return (
    <>
      {/* Episodes */}
      <Card className="bg-card/50 dark:bg-slate-800/50 border-border dark:border-slate-700 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="p-4 border-b border-border dark:border-slate-700">
            <h3 className="font-semibold text-foreground">Эпизоды</h3>
            <p className="text-sm text-muted-foreground">
              {episodesAired ?? 0} из {episodesTotal ?? "??"}
            </p>
          </div>
          <ScrollArea className="h-64">
            <div className="p-2">
              {Array.from({ length: maxEpisodes }, (_, i) => (
                <button
                  key={i}
                  className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
                    i === 0
                      ? "bg-primary/15 dark:bg-purple-600/20 border border-primary/30 dark:border-purple-500/30 text-primary dark:text-purple-300"
                      : "hover:bg-secondary dark:hover:bg-slate-700/50 text-foreground dark:text-slate-300"
                  }`}
                  onClick={() => setEpisode(i + 1)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Эпизод {i + 1}</span>
                    <span className="text-xs text-muted-foreground dark:text-slate-500">24:00</span>
                  </div>
                  <p className="text-xs text-muted-foreground dark:text-slate-400 mt-1">Серия {i + 1}</p>
                </button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Translations */}
      <Card className="bg-card/50 dark:bg-slate-800/50 border-border dark:border-slate-700 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="p-4 border-b border-border dark:border-slate-700">
            <h3 className="font-semibold text-foreground">Озвучки</h3>
            <p className="text-sm text-muted-foreground">{translations.length} доступно</p>
          </div>
          <ScrollArea className="h-48">
            <div className="p-2">
              {translations.slice(0, 50).map((translation, index) => (
                <button
                  key={String(translation.id)}
                  className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
                    index === selectedIndex
                      ? "bg-primary/15 dark:bg-blue-600/20 border border-primary/30 dark:border-blue-500/30 text-primary dark:text-blue-300"
                      : "hover:bg-secondary dark:hover:bg-slate-700/50 text-foreground dark:text-slate-300"
                  }`}
                  onClick={() => setSelectedIndex(index)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{translation.title}</span>
                    <Badge variant="secondary" className="text-xs">
                      {translation.quality || translation.type || "—"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground dark:text-slate-400 mt-1">{translation.type || "voice"}</p>
                </button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </>
  )
}
