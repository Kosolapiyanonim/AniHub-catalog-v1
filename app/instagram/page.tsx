import React from 'react'

export default function InstagramPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-4">Наш Instagram</h1>
      <p className="text-lg text-center max-w-prose">
        Подписывайтесь на наш Instagram, чтобы не пропустить красивые арты и анонсы!
      </p>
      <img
        src="/icons/instagram.png"
        alt="Instagram icon"
        className="mt-8 w-24 h-24"
      />
      <a href="https://www.instagram.com/your_instagram_account" target="_blank" rel="noopener noreferrer" className="mt-4 text-blue-400 hover:underline">
        Перейти в Instagram
      </a>
    </div>
  )
}
