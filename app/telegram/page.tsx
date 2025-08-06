import React from 'react'

export default function TelegramPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-4">Наш Telegram</h1>
      <p className="text-lg text-center max-w-prose">
        Присоединяйтесь к нашему Telegram-каналу, чтобы быть в курсе всех новостей и обсуждений!
      </p>
      <img
        src="/icons/telegram.png"
        alt="Telegram icon"
        className="mt-8 w-24 h-24"
      />
      <a href="https://t.me/your_telegram_channel" target="_blank" rel="noopener noreferrer" className="mt-4 text-blue-400 hover:underline">
        Перейти в Telegram
      </a>
    </div>
  )
}
