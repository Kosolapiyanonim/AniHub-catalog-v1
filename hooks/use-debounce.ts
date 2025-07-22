import { useState, useEffect } from 'react';

// [ИСПРАВЛЕНИЕ] Добавлена запятая после <T>, чтобы помочь парсеру TypeScript
export function useDebounce<T,>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
