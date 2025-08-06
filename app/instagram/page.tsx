import React from 'react';

export default function InstagramPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white">
      <h1 className="text-4xl font-bold mb-4">Наш Instagram</h1>
      <p className="text-lg text-slate-400">Подписывайтесь на нас в Instagram!</p>
      <a href="https://www.instagram.com/your_instagram_account" target="_blank" rel="noopener noreferrer" className="mt-4 text-blue-400 hover:underline">
        Перейти в Instagram
      </a>
    </div>
  );
}
