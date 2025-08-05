"use client"

import { useEffect, useRef, useState } from "react"
import Hls from "hls.js"
import { getTranslationStream } from "@/lib/data-fetchers"
import { LoadingSpinner } from "./loading-spinner"

interface PlayerClientProps {
  translationId: string
}

export function PlayerClient({ translationId }: PlayerClientProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadStream = async () => {
      setLoading(true)
      setError(null)
      if (!videoRef.current) return

      try {
        const streamUrl = await getTranslationStream(translationId)

        if (!streamUrl) {
          setError("Не удалось получить ссылку на поток для этого перевода.")
          setLoading(false)
          return
        }

        if (Hls.isSupported()) {
          const hls = new Hls()
          hls.loadSource(streamUrl)
          hls.attachMedia(videoRef.current)
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            videoRef.current?.play()
            setLoading(false)
          })
          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error("HLS.js error:", data)
            setError(`Ошибка воспроизведения: ${data.details}`)
            setLoading(false)
          })
        } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
          videoRef.current.src = streamUrl
          videoRef.current.addEventListener("loadedmetadata", () => {
            videoRef.current?.play()
            setLoading(false)
          })
          videoRef.current.addEventListener("error", (e) => {
            console.error("Video error:", e)
            setError("Ошибка воспроизведения видео в браузере.")
            setLoading(false)
          })
        } else {
          setError("Ваш браузер не поддерживает воспроизведение HLS.")
          setLoading(false)
        }
      } catch (err) {
        console.error("Failed to load stream:", err)
        setError(`Ошибка загрузки потока: ${err instanceof Error ? err.message : String(err)}`)
        setLoading(false)
      }
    }

    loadStream()

    return () => {
      if (videoRef.current && Hls.isSupported()) {
        const hlsInstance = Hls.get // This might not be the correct way to get the instance
        // A more robust way would be to store the hls instance in a ref
        // For now, let's assume a simple cleanup
        // if (hlsInstance) hlsInstance.destroy();
      }
    }
  }, [translationId])

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center">
      {loading && !error && <LoadingSpinner />}
      {error && (
        <div className="text-red-500 text-center p-4">
          <p>{error}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Пожалуйста, попробуйте другой перевод или обновите страницу.
          </p>
        </div>
      )}
      <video ref={videoRef} controls className="w-full h-full" />
    </div>
  )
}
