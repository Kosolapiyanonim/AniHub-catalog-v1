-- Добавляет настройки Hero-слайдов: порядок и кастомный URL фона
ALTER TABLE animes
  ADD COLUMN IF NOT EXISTS hero_position INTEGER,
  ADD COLUMN IF NOT EXISTS hero_custom_image_url TEXT;

CREATE INDEX IF NOT EXISTS idx_animes_hero_position ON animes(hero_position);
