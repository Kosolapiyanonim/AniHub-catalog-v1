import React from 'react';

export default function InstagramPage() {
  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <h1 className="text-3xl font-bold mb-4">Наш Instagram</h1>
      <p className="text-lg text-gray-400">
        Подписывайтесь на наш Instagram, чтобы видеть красивые арты и новости!
      </p>
      <div className="mt-8 p-6 bg-slate-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-2">Ссылка на Instagram</h2>
        <a href="https://www.instagram.com/your_instagram_account" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
          Перейти в Instagram
        </a>
      </div>
    </div>
  );
}
