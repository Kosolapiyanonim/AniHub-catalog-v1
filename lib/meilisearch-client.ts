// lib/meilisearch-client.ts
import { MeiliSearch } from 'meilisearch'

export const meiliClient = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST!,
  apiKey: process.env.MEILISEARCH_API_KEY,
})

export const animeIndex = meiliClient.index(process.env.MEILISEARCH_INDEX || 'animes')