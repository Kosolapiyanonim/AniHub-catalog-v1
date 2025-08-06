import React from 'react'

export default function TikTokPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-4">Наш TikTok</h1>
      <p className="text-lg text-center max-w-prose">
        Смотрите наши короткие видео и присоединяйтесь к сообществу на TikTok!
      </p>
      <img
        src="/icons/tiktok.png"
        alt="TikTok icon"
        className="mt-8 w-24 h-24"
      />
      <a href="https://www.tiktok.com/@your_tiktok_account" target="_blank" rel="noopener noreferrer" className="mt-4 text-blue-400 hover:underline">
        Перейти в TikTok
      </a>
    </div>
  )
}
