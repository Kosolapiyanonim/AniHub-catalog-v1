import React from 'react';

export default function TikTokPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white">
      <h1 className="text-4xl font-bold mb-4">Наш TikTok</h1>
      <p className="text-lg text-slate-400">Смотрите наши видео в TikTok!</p>
      <a href="https://www.tiktok.com/@your_tiktok_account" target="_blank" rel="noopener noreferrer" className="mt-4 text-blue-400 hover:underline">
        Перейти в TikTok
      </a>
    </div>
  );
}
