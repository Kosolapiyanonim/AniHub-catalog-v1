import React from 'react'

export default function EnglishVersionPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-4">English Version</h1>
      <p className="text-lg text-center max-w-prose">
        This page will contain the English version of the website.
        Stay tuned for updates!
      </p>
      <img
        src="/placeholder.svg?height=200&width=300"
        alt="English version illustration"
        className="mt-8 rounded-lg shadow-lg"
      />
    </div>
  )
}
