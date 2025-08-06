import React from 'react'

export default function NewsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-4">Новости</h1>
      <p className="text-lg text-center max-w-prose">
        Будьте в курсе последних событий и анонсов в мире аниме.
        Следите за обновлениями!
      </p>
      <img
        src="/placeholder.svg?height=200&width=300"
        alt="News illustration"
        className="mt-8 rounded-lg shadow-lg"
      />
    </div>
  )
}
