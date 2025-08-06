import { Anime, AnimeDetails, HomepageSections } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_KODIK_API_TOKEN
  ? 'https://kodikapi.com'
  : 'http://localhost:3000/api'; // Fallback to local API if token is not set

const KODIK_TOKEN = process.env.NEXT_PUBLIC_KODIK_API_TOKEN;

async function fetchFromKodik(endpoint: string, params: Record<string, any>): Promise<any> {
  if (!KODIK_TOKEN) {
    throw new Error('KODIK_API_TOKEN is not set. Cannot fetch from Kodik.');
  }

  const url = new URL(`${API_BASE_URL}${endpoint}`);
  url.searchParams.append('token', KODIK_TOKEN);
  for (const key in params) {
    if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.append(key, String(params[key]));
    }
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Kodik API error: ${response.statusText}`);
  }
  const data = await response.json();
  if (data.error) {
    throw new Error(`Kodik API error: ${data.error}`);
  }
  return data;
}

async function fetchFromLocalApi(endpoint: string, params: Record<string, any>): Promise<any> {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  for (const key in params) {
    if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.append(key, String(params[key]));
    }
  }
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Local API error: ${response.statusText}`);
  }
  return response.json();
}

const apiFetcher = KODIK_TOKEN ? fetchFromKodik : fetchFromLocalApi;

export async function getAnimeList(
  limit: number = 20,
  offset: number = 0,
  filters: Record<string, any> = {}
): Promise<{ animes: Anime[]; total: number }> {
  try {
    const data = await apiFetcher('/v1/list', {
      limit,
      offset,
      with_material_data: true,
      ...filters,
    });
    return {
      animes: data.results.map((item: any) => ({
        id: item.id,
        title: {
          ru: item.title,
          en: item.material_data?.title_en || item.title,
        },
        poster: item.material_data?.poster_url || item.screenshots?.[0] || '/placeholder.jpg',
        description: item.material_data?.description || 'Описание отсутствует.',
        genres: item.material_data?.genres || [],
        year: item.material_data?.year || null,
        rating: item.material_data?.shikimori_rating || null,
        episodes: item.material_data?.episodes_total || null,
        status: item.material_data?.anime_status || null,
        type: item.material_data?.anime_type || null,
        minimal_age: item.material_data?.minimal_age || null,
        shikimori_id: item.material_data?.shikimori_id || null,
        screenshots: item.screenshots || [],
      })),
      total: data.total,
    };
  } catch (error) {
    console.error('Error fetching anime list:', error);
    return { animes: [], total: 0 };
  }
}

export async function getAnimeDetails(id: string): Promise<AnimeDetails | null> {
  try {
    const data = await apiFetcher('/v1/list', {
      id,
      with_material_data: true,
      with_seasons: true,
      with_episodes: true,
    });

    if (!data.results || data.results.length === 0) {
      return null;
    }

    const item = data.results[0];

    return {
      id: item.id,
      title: {
        ru: item.title,
        en: item.material_data?.title_en || item.title,
      },
      poster: item.material_data?.poster_url || item.screenshots?.[0] || '/placeholder.jpg',
      description: item.material_data?.description || 'Описание отсутствует.',
      genres: item.material_data?.genres || [],
      year: item.material_data?.year || null,
      rating: item.material_data?.shikimori_rating || null,
      episodes: item.material_data?.episodes_total || null,
      status: item.material_data?.anime_status || null,
      type: item.material_data?.anime_type || null,
      minimal_age: item.material_data?.minimal_age || null,
      shikimori_id: item.material_data?.shikimori_id || null,
      screenshots: item.screenshots || [],
      seasons: item.seasons || {},
      player_link: item.link,
    };
  } catch (error) {
    console.error(`Error fetching anime details for ID ${id}:`, error);
    return null;
  }
}

export async function searchAnime(query: string, limit: number = 10): Promise<Anime[]> {
  if (!query) return [];
  try {
    const data = await apiFetcher('/v1/search', {
      title: query,
      limit,
      with_material_data: true,
    });
    return data.results.map((item: any) => ({
      id: item.id,
      title: {
        ru: item.title,
        en: item.material_data?.title_en || item.title,
      },
      poster: item.material_data?.poster_url || item.screenshots?.[0] || '/placeholder.jpg',
      description: item.material_data?.description || 'Описание отсутствует.',
      genres: item.material_data?.genres || [],
      year: item.material_data?.year || null,
      rating: item.material_data?.shikimori_rating || null,
      episodes: item.material_data?.episodes_total || null,
      status: item.material_data?.anime_status || null,
      type: item.material_data?.anime_type || null,
      minimal_age: item.material_data?.minimal_age || null,
      shikimori_id: item.material_data?.shikimori_id || null,
      screenshots: item.screenshots || [],
    }));
  } catch (error) {
    console.error(`Error searching anime for query "${query}":`, error);
    return [];
  }
}

export async function getHomepageSectionsData(): Promise<HomepageSections> {
  try {
    const [hero, trending, popular, latestUpdates] = await Promise.all([
      getAnimeList(5, 0, { 'shikimori_rating': '7-10', 'anime_status': 'ongoing' }), // Example filter for hero
      getAnimeList(10, 0, { 'shikimori_rating': '7-10', 'sort': 'shikimori_rating' }),
      getAnimeList(10, 0, { 'sort': 'views' }),
      getAnimeList(10, 0, { 'sort': 'updated' }),
    ]);

    return {
      hero: hero.animes,
      trending: trending.animes,
      popular: popular.animes,
      latestUpdates: latestUpdates.animes,
    };
  } catch (error) {
    console.error('Error fetching homepage sections:', error);
    return {
      hero: [],
      trending: [],
      popular: [],
      latestUpdates: [],
    };
  }
}

export async function getGenresList(): Promise<string[]> {
  try {
    const data = await apiFetcher('/v1/genres');
    return data.results.map((g: any) => g.title);
  } catch (error) {
    console.error('Error fetching genres:', error);
    return [];
  }
}

export async function getStatusesList(): Promise<string[]> {
  try {
    const data = await apiFetcher('/v1/anime_statuses');
    return data.results.map((s: any) => s.title);
  } catch (error) {
    console.error('Error fetching statuses:', error);
    return [];
  }
}

export async function getStudiosList(): Promise<string[]> {
  try {
    const data = await apiFetcher('/v1/studios');
    return data.results.map((s: any) => s.title);
  } catch (error) {
    console.error('Error fetching studios:', error);
    return [];
  }
}

export async function getTypesList(): Promise<string[]> {
  try {
    const data = await apiFetcher('/v1/anime_types');
    return data.results.map((t: any) => t.title);
  } catch (error) {
    console.error('Error fetching types:', error);
    return [];
  }
}

export async function getYearsList(): Promise<number[]> {
  try {
    const data = await apiFetcher('/v1/years');
    return data.results.map((y: any) => y.year).sort((a: number, b: number) => b - a);
  } catch (error) {
    console.error('Error fetching years:', error);
    return [];
  }
}
