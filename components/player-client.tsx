'use client'

import * as React from 'react'

interface PlayerClientProps {
  playerLink: string
}

export function PlayerClient({ playerLink }: PlayerClientProps) {
  return (
    <iframe
      src={playerLink}
      width="100%"
      height="100%"
      frameBorder="0"
      allowFullScreen
      allow="autoplay; encrypted-media"
      className="rounded-lg"
    ></iframe>
  )
}
