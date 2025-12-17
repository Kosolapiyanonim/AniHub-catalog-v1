"use client"

import { useEffect, useRef, useState } from "react"

interface KodikPlayerProps {
  src: string
  width?: number | string
  height?: number | string
  allowFullscreen?: boolean
}

export default function KodikPlayer({ src, width = "100%", height = undefined, allowFullscreen = true }: KodikPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [currentSrc, setCurrentSrc] = useState<string>(src)

  // Listen to postMessage events from Kodik
  useEffect(() => {
    function handleMessage(message: MessageEvent) {
      const data = message.data as { key?: string; value?: unknown }
      if (!data || typeof data !== "object") return
      // You can handle Kodik events here if needed
    }
    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  // Sync prop changes into state
  useEffect(() => {
    setCurrentSrc(src)
  }, [src])

  // Listen for global src change events
  useEffect(() => {
    const handler = (e: Event) => {
      const custom = e as CustomEvent<string>
      if (typeof custom.detail === "string" && custom.detail.length > 0) {
        setCurrentSrc(custom.detail)
      }
    }
    window.addEventListener("anihub:kodik:setSrc", handler as EventListener)
    return () => window.removeEventListener("anihub:kodik:setSrc", handler as EventListener)
  }, [])

  // Normalize protocol-less links from Kodik (e.g., //kodik.cc/....)
  const normalizedSrc = typeof currentSrc === "string" && currentSrc.startsWith("//") ? `https:${currentSrc}` : currentSrc

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      {normalizedSrc ? (
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
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-300">Плеер недоступен</div>
      )}
    </div>
  )
}

// moved to KodikPlayer.tsx
export {}
