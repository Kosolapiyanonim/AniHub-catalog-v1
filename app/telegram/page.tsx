import React from 'react';

export default function TelegramPage() {
  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <h1 className="text-3xl font-bold mb-4">Наш Telegram</h1>
      <p className="text-lg text-gray-400">
        Присоединяйтесь к нашему Telegram-каналу, чтобы быть в курсе всех новостей!
      </p>
      <div className="mt-8 p-6 bg-slate-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-2">Ссылка на Telegram</h2>
        <a href="https://t.me/your_telegram_channel" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
          Перейти в Telegram
        </a>
      </div>
    </div>
  );
}
