import { JSDOM } from 'jsdom';

export async function parseKodikPage(url: string) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const playerScript = document.querySelector('script[src*="kodik.info/player/"]');
    if (playerScript) {
      const playerUrl = playerScript.getAttribute('src');
      return playerUrl;
    }
    return null;
  } catch (error) {
    console.error('Error parsing Kodik page:', error);
    return null;
  }
}

export async function parseLatestUpdates(url: string) {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const items = Array.from(document.querySelectorAll('.anime-item')).map(item => {
      const titleElement = item.querySelector('.anime-title');
      const linkElement = item.querySelector('a');
      const posterElement = item.querySelector('.anime-poster img');

      return {
        title: titleElement?.textContent?.trim() || 'No Title',
        link: linkElement?.href || '#',
        poster: posterElement?.getAttribute('src') || '/placeholder.jpg',
      };
    });
    return items;
  } catch (error) {
    console.error('Error parsing latest updates:', error);
    return [];
  }
}
