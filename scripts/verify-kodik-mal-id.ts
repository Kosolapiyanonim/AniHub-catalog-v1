/*
 * Verify mapping: shikimori_id == MAL anime id (and disproves kodik_id mapping)
 *
 * Usage:
 *   KODIK_API_TOKEN=xxx npx tsx scripts/verify-kodik-mal-id.ts --limit 20 --sample 10 --out logs/kodik-mal-report.json
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { config as loadEnv } from 'dotenv'

// Fallback for shells where variables from `.env.local` are not exported
// (common in Git Bash when using `source .env.local` with plain KEY=VALUE lines).
loadEnv({ path: '.env.local' })

type KodikItem = {
  id: string
  title?: string
  title_orig?: string
  shikimori_id?: string
  material_data?: {
    anime_title?: string
  }
}

type JikanAnime = {
  mal_id: number
  title?: string
  title_english?: string
  title_japanese?: string
  title_synonyms?: string[]
}

function getArg(name: string): string | null {
  const idx = process.argv.indexOf(`--${name}`)
  if (idx >= 0 && process.argv[idx + 1]) {
    return process.argv[idx + 1]
  }
  return null
}

function getNumberArg(name: string, defaultValue: number) {
  const raw = getArg(name)
  if (!raw) return defaultValue
  const val = Number(raw)
  return Number.isFinite(val) && val > 0 ? val : defaultValue
}

const limit = getNumberArg('limit', 30)
const sample = getNumberArg('sample', 10)
const outPath = getArg('out')

const token = process.env.KODIK_API_TOKEN
if (!token) {
  console.error('❌ Missing KODIK_API_TOKEN in environment.')
  console.error('   1) Create .env.local in repo root')
  console.error('   2) Add: KODIK_API_TOKEN=your_token')
  console.error('   3) Run: source .env.local')
  process.exit(1)
}

const normalize = (value?: string | null) =>
  (value || '')
    .toLowerCase()
    .replace(/[^a-zа-я0-9]+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

function titleMatch(kodik: KodikItem, mal?: JikanAnime | null) {
  if (!mal) return false

  const kodikTitles = [kodik.title, kodik.title_orig, kodik.material_data?.anime_title].map(normalize).filter(Boolean)
  const malTitles = [mal.title, mal.title_english, mal.title_japanese, ...(mal.title_synonyms || [])]
    .map(normalize)
    .filter(Boolean)

  return kodikTitles.some((k) => malTitles.some((m) => k === m || k.includes(m) || m.includes(k)))
}

async function getJikanAnimeById(id: string): Promise<JikanAnime | null> {
  if (!/^\d+$/.test(id)) return null

  const resp = await fetch(`https://api.jikan.moe/v4/anime/${id}`)
  if (!resp.ok) return null

  const data = (await resp.json()) as { data?: JikanAnime }
  return data.data || null
}

async function writeJsonReport(path: string, payload: unknown) {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, JSON.stringify(payload, null, 2), 'utf8')
}

async function main() {
  const url = new URL('https://kodikapi.com/list')
  url.searchParams.set('token', token)
  url.searchParams.set('types', 'anime,anime-serial')
  url.searchParams.set('with_material_data', 'true')
  url.searchParams.set('sort', 'updated_at')
  url.searchParams.set('order', 'desc')
  url.searchParams.set('limit', String(limit))

  console.log('🔎 Step 1/4: Requesting Kodik list...')
  const resp = await fetch(url)
  if (!resp.ok) {
    throw new Error(`Kodik API error: ${resp.status}`)
  }

  const body = (await resp.json()) as { results?: KodikItem[] }
  const results = (body.results || []).slice(0, sample)

  console.log(`✅ Step 1/4 done. Received ${body.results?.length || 0} items, sample=${results.length}.`)

  if (results.length === 0) {
    console.log('⚠️ Kodik returned no results for this query.')
    return
  }

  let sidMatches = 0
  let kidMatches = 0

  const report: Array<Record<string, string | boolean | null>> = []

  console.log('🔎 Step 2/4: Checking each sample item against Jikan/MAL IDs...')
  for (let i = 0; i < results.length; i += 1) {
    const item = results[i]
    console.log(`   • Item ${i + 1}/${results.length}: kodik_id=${item.id}, shikimori_id=${item.shikimori_id || 'null'}`)

    const malByShikimori = item.shikimori_id ? await getJikanAnimeById(item.shikimori_id) : null
    const malByKodik = await getJikanAnimeById(item.id)

    // Jikan rate-limit friendly delay
    await new Promise((r) => setTimeout(r, 350))

    const sidOk = titleMatch(item, malByShikimori)
    const kidOk = titleMatch(item, malByKodik)

    if (sidOk) sidMatches += 1
    if (kidOk) kidMatches += 1

    report.push({
      kodik_id: item.id,
      shikimori_id: item.shikimori_id || null,
      kodik_title: item.title || item.material_data?.anime_title || null,
      mal_title_by_shikimori_id: malByShikimori?.title || null,
      shikimori_id_matches_mal_title: sidOk,
      mal_title_by_kodik_id: malByKodik?.title || null,
      kodik_id_matches_mal_title: kidOk,
    })
  }

  console.log('✅ Step 2/4 done.')

  const summary = {
    sample_size: results.length,
    matches_by_shikimori_id: sidMatches,
    matches_by_kodik_id: kidMatches,
    interpretation:
      sidMatches > kidMatches
        ? 'shikimori_id is the correct MAL mapping candidate; kodik_id is not'
        : sidMatches === kidMatches
          ? 'inconclusive, increase sample'
          : 'unexpected: kodik_id looked better on this sample',
  }

  console.log('🧮 Step 3/4: Building summary...')
  console.log('\n=== Mapping Check: shikimori_id == MAL anime_id ===')
  console.log(`Sample size: ${results.length}`)
  console.log(`Matches by shikimori_id -> MAL: ${sidMatches}/${results.length}`)
  console.log(`Matches by kodik_id     -> MAL: ${kidMatches}/${results.length}`)
  console.log('\nInterpretation:')
  if (sidMatches > kidMatches) {
    console.log('✅ Data supports that shikimori_id corresponds to MAL anime id much better than kodik_id.')
  } else if (sidMatches === kidMatches) {
    console.log('⚠️ Inconclusive on this sample. Increase --sample and retry.')
  } else {
    console.log('⚠️ Unexpected result: kodik_id appeared to match better. Re-check with larger sample.')
  }

  console.log('\nDetailed rows:')
  console.log(JSON.stringify(report, null, 2))

  if (outPath) {
    console.log(`💾 Step 4/4: Writing JSON report to ${outPath} ...`)
    await writeJsonReport(outPath, {
      generated_at: new Date().toISOString(),
      summary,
      rows: report,
    })
    console.log('✅ Report written.')
  } else {
    console.log('ℹ️ Step 4/4 skipped. Use --out <path> to save JSON report.')
  }
}

main().catch((e) => {
  console.error('❌ Verification failed:', e)
  process.exit(1)
})
