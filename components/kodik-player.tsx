"use client"

import { useEffect, useRef } from "react"

interface KodikPlayerProps {
  src: string
  width?: number | string
  height?: number | string
  allowFullscreen?: boolean
}

export default function KodikPlayer({ src, width = "100%", height = undefined, allowFullscreen = true }: KodikPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    function handleMessage(message: MessageEvent) {
      const data = message.data as { key?: string; value?: unknown }
      if (!data || typeof data !== "object") return
      // You can handle Kodik events here if needed
    }
    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  // Normalize protocol-less links from Kodik (e.g., //kodik.cc/....)
  const normalizedSrc = typeof src === "string" && src.startsWith("//") ? `https:${src}` : src

  if (!normalizedSrc) {
    return (
      <div className="w-full aspect-video bg-slate-900 text-slate-300 flex items-center justify-center rounded-lg">
        Плеер недоступен
      </div>
    )
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      <iframe
        ref={iframeRef}
        id="kodik-player"
        src={normalizedSrc}
        width={typeof width === "number" ? String(width) : width}
        height={typeof height === "number" ? String(height) : undefined}
        className="w-full h-full"
        frameBorder={0}
        allow={"autoplay; fullscreen; encrypted-media; picture-in-picture"}
        allowFullScreen={allowFullscreen}
      />
    </div>
  )
}

// moved to KodikPlayer.tsx
export {}

