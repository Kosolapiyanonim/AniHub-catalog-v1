/**
 * Нормализует URL изображений Shikimori, приводя все поддомены к основному домену shikimori.one
 * 
 * Правила нормализации:
 * - trim входной строки
 * - если начинается с "/" => добавляет "https://shikimori.one"
 * - если начинается с "//" => добавляет "https:"
 * - если hostname оканчивается на ".shikimori.one" и не равен "shikimori.one" => заменяет на "shikimori.one"
 * - сохраняет путь и query параметры как есть
 * - если URL невалиден => возвращает null
 * 
 * @param url - URL для нормализации (может быть string, null или undefined)
 * @returns Нормализованный URL или null если URL невалиден
 * 
 * @example
 * normalizeShikimoriImageUrl("https://nyaa.shikimori.one/uploads/poster/animes/11757/x.jpeg")
 * // => "https://shikimori.one/uploads/poster/animes/11757/x.jpeg"
 * 
 * normalizeShikimoriImageUrl("/uploads/poster/animes/199/x.jpeg")
 * // => "https://shikimori.one/uploads/poster/animes/199/x.jpeg"
 */
export function normalizeShikimoriImageUrl(url: string | null | undefined): string | null {
  // Если вход null/undefined, возвращаем null
  if (url === null || url === undefined) {
    return null;
  }

  // trim
  const trimmed = url.trim();

  // Если пустая строка после trim, возвращаем null
  if (trimmed === '') {
    return null;
  }

  try {
    let urlToNormalize = trimmed;

    // Если начинается с "//", добавляем "https:"
    if (trimmed.startsWith('//')) {
      urlToNormalize = `https:${trimmed}`;
    }
    // Если начинается с "/", добавляем "https://shikimori.one"
    else if (trimmed.startsWith('/')) {
      urlToNormalize = `https://shikimori.one${trimmed}`;
    }

    // Парсим URL
    const parsedUrl = new URL(urlToNormalize);

    // Проверяем, является ли hostname поддоменом shikimori.one
    const hostname = parsedUrl.hostname.toLowerCase();
    
    if (hostname.endsWith('.shikimori.one') && hostname !== 'shikimori.one') {
      // Заменяем hostname на shikimori.one, сохраняя путь и query
      parsedUrl.hostname = 'shikimori.one';
      return parsedUrl.toString();
    }

    // Если это уже shikimori.one или другой домен, возвращаем как есть
    return parsedUrl.toString();

  } catch (error) {
    // Если URL невалиден, возвращаем null
    return null;
  }
}

