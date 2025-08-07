"use client"

import { useEffect, useRef, useState } from "react"
import Hls from "hls.js"

interface PlayerClientProps {
  src: string
  poster?: string
}

export function PlayerClient({ src, poster }: PlayerClientProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    setError(null) // Reset error on new src

    if (Hls.isSupported()) {
      const hls = new Hls()
      hls.loadSource(src)
      hls.attachMedia(video)
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError("Ошибка сети при загрузке видео. Попробуйте обновить страницу.")
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError("Ошибка медиа-плеера. Возможно, видео повреждено или не поддерживается.")
              break
            default:
              setError("Произошла неизвестная ошибка при воспроизведении видео.")
              break
          }
          console.error("HLS fatal error:", data)
        }
      })
      return () => {
        hls.destroy()
      }
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src
    } else {
      setError("Ваш браузер не поддерживает воспроизведение этого видео формата.")
    }
  }, [src])

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 text-white text-center p-4 z-10">
          <p>{error}</p>
        </div>
      )}
      <video ref={videoRef} className="w-full h-full object-contain" controls poster={poster} autoPlay playsInline>
        Ваш браузер не поддерживает тег video.
      </video>
    </div>
  )
}
