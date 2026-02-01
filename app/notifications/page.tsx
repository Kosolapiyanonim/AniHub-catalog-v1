import React from 'react';

export default function NotificationsPage() {
  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <h1 className="text-3xl font-bold mb-4 text-foreground">Уведомления</h1>
      <p className="text-lg text-muted-foreground">
        Здесь будут отображаться ваши уведомления.
      </p>
      <div className="mt-8 p-6 bg-card dark:bg-slate-800 rounded-lg shadow-md border border-border dark:border-slate-700">
        <h2 className="text-2xl font-semibold mb-2 text-foreground">Нет новых уведомлений</h2>
        <p className="text-muted-foreground">
          Все уведомления прочитаны.
        </p>
      </div>
    </div>
  );
}
