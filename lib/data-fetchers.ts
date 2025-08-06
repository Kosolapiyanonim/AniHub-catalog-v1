import {
  getAnimeList,
  getAnimeDetails,
  searchAnime,
  getHomepageSectionsData,
  getGenresList,
  getStatusesList,
  getStudiosList,
  getTypesList,
  getYearsList,
} from './anime-api';
import type { Anime, AnimeDetails, HomepageSections } from './types';

export async function getCatalogAnime(
  searchParams: { [key: string]: string | string[] | undefined }
): Promise<{ animes: Anime[]; totalPages: number }> {
  const page = parseInt(searchParams.page as string || '1');
  const limit = 20;
  const offset = (page - 1) * limit;

  const filters: Record<string, any> = {};
  if (searchParams.genre) filters.genres = searchParams.genre;
  if (searchParams.status) filters.anime_status = searchParams.status;
  if (searchParams.studio) filters.studios = searchParams.studio;
  if (searchParams.type) filters.anime_type = searchParams.type;
  if (searchParams.year) filters.years = searchParams.year;
  if (searchParams.sort) filters.sort = searchParams.sort;
  if (searchParams.search) filters.title = searchParams.search;

  const { animes, total } = await getAnimeList(limit, offset, filters);
  const totalPages = Math.ceil(total / limit);

  return { animes, totalPages };
}

export async function getAnimeById(id: string): Promise<AnimeDetails | null> {
  return getAnimeDetails(id);
}

export async function getSearchResults(query: string): Promise<Anime[]> {
  return searchAnime(query);
}

export async function getHomepageSections(): Promise<HomepageSections> {
  return getHomepageSectionsData();
}

export async function getPopularAnime(): Promise<Anime[]> {
  const { animes } = await getAnimeList(20, 0, { sort: 'views' });
  return animes;
}

export async function getGenres(): Promise<string[]> {
  return getGenresList();
}

export async function getStatuses(): Promise<string[]> {
  return getStatusesList();
}

export async function getStudios(): Promise<string[]> {
  return getStudiosList();
}

export async function getTypes(): Promise<string[]> {
  return getTypesList();
}

export async function getYears(): Promise<number[]> {
  return getYearsList();
}
