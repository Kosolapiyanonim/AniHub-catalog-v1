'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ParseRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/admin/parser');
  }, [router]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Перенаправление на /admin/parser...</p>
    </div>
  );
}

