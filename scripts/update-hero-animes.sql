-- ============================================================================
-- Скрипт для обновления аниме в Hero-секции
-- Выполнить в Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ============================================================================
--
-- ИНСТРУКЦИЯ:
-- 1. Выберите аниме, которые хотите показать в Hero-секции
-- 2. Обновите shikimori_id в запросах ниже
-- 3. Или используйте другие критерии (например, по рейтингу, году и т.д.)
-- ============================================================================

-- Вариант 1: Отметить конкретные аниме по shikimori_id
-- Замените '12345', '67890' на реальные shikimori_id ваших аниме
UPDATE animes 
SET is_featured_in_hero = true 
WHERE shikimori_id IN ('12345', '67890', '11111');

-- Вариант 2: Отметить топ аниме по рейтингу (например, топ 10)
UPDATE animes 
SET is_featured_in_hero = true 
WHERE id IN (
  SELECT id 
  FROM animes 
  WHERE shikimori_rating IS NOT NULL 
    AND shikimori_rating >= 8.0
    AND poster_url IS NOT NULL
    AND screenshots IS NOT NULL
    AND jsonb_array_length(COALESCE(screenshots, '[]'::jsonb)) > 0
  ORDER BY shikimori_rating DESC, shikimori_votes DESC 
  LIMIT 10
);

-- Вариант 3: Отметить популярные аниме (по количеству голосов)
UPDATE animes 
SET is_featured_in_hero = true 
WHERE id IN (
  SELECT id 
  FROM animes 
  WHERE shikimori_votes IS NOT NULL 
    AND shikimori_votes >= 10000
    AND poster_url IS NOT NULL
    AND screenshots IS NOT NULL
    AND jsonb_array_length(COALESCE(screenshots, '[]'::jsonb)) > 0
  ORDER BY shikimori_votes DESC 
  LIMIT 10
);

-- Вариант 4: Сбросить все отметки (если нужно начать заново)
-- UPDATE animes SET is_featured_in_hero = false;

-- Проверка: посмотреть, какие аниме отмечены для Hero-секции
SELECT 
  id, 
  shikimori_id, 
  title, 
  shikimori_rating, 
  shikimori_votes,
  is_featured_in_hero
FROM animes 
WHERE is_featured_in_hero = true
ORDER BY shikimori_rating DESC NULLS LAST;

-- ============================================================================
-- ПРИМЕЧАНИЕ:
-- Рекомендуется отмечать аниме, у которых есть:
-- - poster_url (постер)
-- - screenshots (скриншоты для фона)
-- - shikimori_id (для корректной работы ссылок)
-- - shikimori_rating (для отображения рейтинга)
-- ============================================================================
