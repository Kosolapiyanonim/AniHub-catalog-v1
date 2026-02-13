/**
 * Нормализует URL изображений Shikimori/Shiki, приводя все поддомены к основному домену shiki.one
 * 
 * Правила нормализации:
 * - trim входной строки
 * - если начинается с "/" => добавляет "https://shiki.one"
 * - если начинается с "//" => добавляет "https:"
 * - если hostname равен shikimori.one или оканчивается на ".shikimori.one" => заменяет на "shiki.one"
 * - если hostname оканчивается на ".shiki.one" => заменяет на "shiki.one"
 * - сохраняет путь и query параметры как есть
 * - если URL невалиден => возвращает null
 * 
 * @param url - URL для нормализации (может быть string, null или undefined)
 * @returns Нормализованный URL или null если URL невалиден
 * 
 * @example
 * normalizeShikimoriImageUrl("https://nyaa.shikimori.one/uploads/poster/animes/11757/x.jpeg")
 * // => "https://shiki.one/uploads/poster/animes/11757/x.jpeg"
 * 
 * normalizeShikimoriImageUrl("/uploads/poster/animes/199/x.jpeg")
 * // => "https://shiki.one/uploads/poster/animes/199/x.jpeg"
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
    // Если начинается с "/", добавляем "https://shiki.one"
    else if (trimmed.startsWith('/')) {
      urlToNormalize = `https://shiki.one${trimmed}`;
    }

    // Парсим URL
    const parsedUrl = new URL(urlToNormalize);

    // Нормализуем старые/поддоменные варианты домена к shiki.one
    const hostname = parsedUrl.hostname.toLowerCase();

    const isShikimoriDomain = hostname === 'shikimori.one' || hostname.endsWith('.shikimori.one');
    const isShikiSubdomain = hostname.endsWith('.shiki.one') && hostname !== 'shiki.one';

    if (isShikimoriDomain || isShikiSubdomain) {
      // Заменяем hostname на shiki.one, сохраняя путь и query
      parsedUrl.hostname = 'shiki.one';
      return parsedUrl.toString();
    }

    // Если это уже shiki.one или другой домен, возвращаем как есть
    return parsedUrl.toString();

  } catch (error) {
    // Если URL невалиден, возвращаем null
    return null;
  }
}
