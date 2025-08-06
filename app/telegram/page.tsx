import React from 'react';

export default function TelegramPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white">
      <h1 className="text-4xl font-bold mb-4">Наш Telegram</h1>
      <p className="text-lg text-slate-400">Присоединяйтесь к нашему каналу в Telegram!</p>
      <a href="https://t.me/your_telegram_channel" target="_blank" rel="noopener noreferrer" className="mt-4 text-blue-400 hover:underline">
        Перейти в Telegram
      </a>
    </div>
  );
}
