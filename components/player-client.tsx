"use client";

import React from "react";

interface PlayerClientProps {
  src: string;
  poster?: string;
}

export function PlayerClient({ src }: PlayerClientProps) {
  if (!src) {
    return <div className="text-center text-red-500">Плеер недоступен</div>;
  }

  return (
    <div className="w-full aspect-video">
      <iframe
        src={src}
        width="100%"
        height="100%"
        allowFullScreen
        allow="autoplay; fullscreen"
        frameBorder="0"
      />
    </div>
  );
}
