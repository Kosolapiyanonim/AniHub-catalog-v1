import React from 'react';

export default function TikTokPage() {
  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <h1 className="text-3xl font-bold mb-4">Наш TikTok</h1>
      <p className="text-lg text-gray-400">
        Смотрите наши короткие видео и мемы в TikTok!
      </p>
      <div className="mt-8 p-6 bg-slate-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-2">Ссылка на TikTok</h2>
        <a href="https://www.tiktok.com/@your_tiktok_account" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
          Перейти в TikTok
        </a>
      </div>
    </div>
  );
}
