import React from 'react'

export default function FavoritesPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-4">Избранное</h1>
      <p className="text-lg text-center max-w-prose">
        Здесь будут отображаться аниме, которые вы добавили в избранное.
      </p>
      <img
        src="/placeholder.svg?height=200&width=300"
        alt="Favorites illustration"
        className="mt-8 rounded-lg shadow-lg"
      />
    </div>
  )
}
