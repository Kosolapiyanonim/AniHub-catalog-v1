import React from 'react';

export default function NewsPage() {
  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <h1 className="text-3xl font-bold mb-4">Новости</h1>
      <p className="text-lg text-gray-400">
        Будьте в курсе последних событий и анонсов.
      </p>
      <div className="mt-8 p-6 bg-slate-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-2">Последние новости</h2>
        <p className="text-gray-300">
          Пока новостей нет, но мы работаем над этим!
        </p>
      </div>
    </div>
  );
}
