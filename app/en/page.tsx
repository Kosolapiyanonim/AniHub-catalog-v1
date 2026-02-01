import React from 'react';

export default function EnglishVersionPage() {
  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <h1 className="text-3xl font-bold mb-4 text-foreground">English Version</h1>
      <p className="text-lg text-muted-foreground">
        This page will contain the English version of the website.
      </p>
      <div className="mt-8 p-6 bg-card dark:bg-slate-800 rounded-lg shadow-md border border-border dark:border-slate-700">
        <h2 className="text-2xl font-semibold mb-2 text-foreground">Coming Soon!</h2>
        <p className="text-muted-foreground">
          Stay tuned for the English localization.
        </p>
      </div>
    </div>
  );
}
