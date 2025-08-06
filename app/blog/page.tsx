import React from 'react';

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <h1 className="text-3xl font-bold mb-4">Наш Блог</h1>
      <p className="text-lg text-gray-400">
        Здесь будут публиковаться интересные статьи и новости из мира аниме.
      </p>
      <div className="mt-8 p-6 bg-slate-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-2">Скоро здесь появятся новые посты!</h2>
        <p className="text-gray-300">
          Следите за обновлениями.
        </p>
      </div>
    </div>
  );
}
