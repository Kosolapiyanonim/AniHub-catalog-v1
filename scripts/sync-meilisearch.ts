// scripts/sync-meilisearch.ts
import { createClient } from '@supabase/supabase-js'
import { animeIndex } from '../lib/meilisearch-client'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function syncAnimes() {
  console.log('🚀 Fetching animes from Supabase...')
  
  const { data, error } = await supabase
    .from('animes')
    .select('id, title, poster_url, year, shikimori_id, type, status, description')

  if (error) {
    console.error('❌ Supabase error:', error)
    return
  }

  console.log(`📦 Found ${data.length} animes. Uploading to Meilisearch...`)
  
  const result = await animeIndex.addDocuments(data, { primaryKey: 'id' })
  console.log('✅ Sync completed!', result)
}

syncAnimes()