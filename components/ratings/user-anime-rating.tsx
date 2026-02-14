"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"

type Props = {
  animeId: number
  initialRating?: number | null
  compact?: boolean
}

export function UserAnimeRating({ animeId, initialRating = null, compact = false }: Props) {
  const [rating, setRating] = useState<number | null>(initialRating)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (initialRating !== null) return
    fetch(`/api/ratings/anime?anime_id=${animeId}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setRating(data?.rating ?? null))
      .catch(() => undefined)
  }, [animeId, initialRating])

  const save = async (value: number | null) => {
    setSaving(true)
    try {
      const res = await fetch("/api/ratings/anime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anime_id: animeId, rating: value }),
      })
      if (res.ok) setRating(value)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-300">Моя оценка</p>
        {rating && <p className="text-sm font-semibold text-amber-300">{rating}/10</p>}
      </div>
      <div className="grid grid-cols-5 gap-1">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
          <Button
            key={value}
            type="button"
            variant={rating === value ? "default" : "outline"}
            size={compact ? "sm" : "default"}
            className={rating === value ? "bg-amber-500 hover:bg-amber-600 text-black" : "text-slate-200"}
            disabled={saving}
            onClick={() => save(value === rating ? null : value)}
          >
            <Star className="w-3.5 h-3.5 mr-1" />
            {value}
          </Button>
        ))}
      </div>
    </div>
  )
}
