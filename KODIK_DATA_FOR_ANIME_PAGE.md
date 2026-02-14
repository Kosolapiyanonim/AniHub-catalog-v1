# Детальный разбор данных из KODIK API для «полной» страницы аниме

Ниже — не «в общем», а конкретно по полям и как их применять на странице `/anime/[id]`.

## 1) Что реально приходит из KODIK `/list`

В проекте парсер ходит в:

- `https://kodikapi.com/list`
- `types=anime,anime-serial`
- `with_material_data=true`
- `limit=100`

Это видно в парсере (`full-parser`) и ручном парсере (`manual-parser`).

### Базовые поля материала (верхний уровень объекта)

По документации KODIK и типам проекта доступны:

- `id` — внутренний Kodik ID материала.
- `title` — название.
- `title_orig` — оригинальное название.
- `other_title` — альтернативное/другое название (часто полезно для аниме).
- `link` — ссылка на плеер.
- `year`.
- `kinopoisk_id`, `imdb_id`, `mdl_id`, `worldart_link`, `shikimori_id`.
- `type` — тип (`anime`, `anime-serial`, и др.).
- `quality` — качество видео (`720p`, `1080p`, ...).
- `camrip`.
- `lgbt`.
- `translation` — `{ id, title, type }`.
- `created_at`, `updated_at`.
- `blocked_countries`.
- Для сериалов: `last_season`, `last_episode`, `episodes_count`, `blocked_seasons`.
- `screenshots`.
- Опционально: `seasons` (если включить параметры сезонов/эпизодов).

### Что добавляет `with_material_data=true`

`material_data` даёт обогащение метаданными (из внешних источников, в т.ч. Shikimori/Кинопоиск). В текущих типах проекта уже описаны поля:

- Названия/тексты:
  - `title`, `anime_title`, `title_orig`
  - `description`, `anime_description`
- Изображения:
  - `poster_url`, `anime_poster_url`
- Рейтинги и голоса:
  - `kinopoisk_rating`, `imdb_rating`, `shikimori_rating`
  - `kinopoisk_votes`, `shikimori_votes`
- Категоризация:
  - `anime_genres[]`, `anime_studios[]`, `countries[]`
- Статусы/типы:
  - `anime_status` (`anons/ongoing/released`)
  - `anime_kind` (`tv/movie/ova/ona/special/...`)
- Эпизоды:
  - `episodes_count`, `episodes_total`
- Ограничения:
  - `duration`, `rating_mpaa`

## 2) Что уже сохраняем в БД из KODIK

### В `animes`

Сейчас маппятся и сохраняются:

- ID и идентификаторы: `shikimori_id`, `kinopoisk_id`
- Основные карточки: `title`, `title_orig`, `year`, `poster_url`, `description`
- Классификация: `type`, `anime_kind`, `status`
- Эпизоды: `episodes_count`, `episodes_total`, `episodes_aired` (из `last_episode`)
- Рейтинги/голоса: `rating_mpaa`, `kinopoisk_rating`, `imdb_rating`, `shikimori_rating`, `kinopoisk_votes`, `shikimori_votes`
- Медиа: `screenshots`
- Служебное: `updated_at_kodik`

### В связи/справочники

Из `material_data`:

- `anime_genres[]` → `genres` + `anime_genres`
- `anime_studios[]` → `studios` + `anime_studios`
- `countries[]` → `countries` + `anime_countries`

### В `translations`

На каждый вариант озвучки/субтитров:

- `kodik_translation_id` (`translation.id`)
- `title` (`translation.title`)
- `type` (`translation.type`)
- `quality`
- `player_link` (`link`)

## 3) Какие данные вы можете вынести на страницу аниме, чтобы она была «наполненной»

Ниже — структура блоков страницы и поля, которые уже есть/доступны.

### A. Hero + быстрые факты (верх экрана)

- Постер: `poster_url`
- Названия: `title`, `title_orig`, + (если начнёте хранить) `other_title`
- Бейджи: `year`, `type`, `anime_kind`, `status`
- «Свежесть»: `updated_at_kodik`
- Возраст: `rating_mpaa`

### B. Блок рейтингов

- `shikimori_rating` + `shikimori_votes`
- `kinopoisk_rating` + `kinopoisk_votes`
- `imdb_rating`

Плюс можно показать «сводный» рейтинг на фронте (например, взвешенное среднее, если есть голоса).

### C. Сюжет + метаданные

- Описание: `description`
- Страны: `countries`
- Жанры: `genres`
- Студии: `studios`
- Длительность серии/фильма: `duration` (нужно добавить в БД, сейчас не сохраняется)

### D. Прогресс тайтла (очень важно для ongoing)

- Вышло серий: `episodes_aired` (`last_episode`)
- Всего серий: `episodes_total` (или `episodes_count`)
- Визуал: прогресс-бар `episodes_aired / episodes_total`

### E. Просмотр

- Список озвучек/сабов из `translations`:
  - название (`title`), тип (`type`), качество (`quality`)
- Смена плеера по `player_link`

### F. Галерея

- `screenshots[]` как горизонтальный слайдер/лайтбокс.

### G. Внешние ссылки и ID (мини-блок «подробнее»)

- `shikimori_id`, `kinopoisk_id`, `imdb_id`, `worldart_link`, `mdl_id`
- Это полезно для SEO и «гиковского» блока с источниками.

## 4) Что вы пока теряете (но стоит добавить)

Если цель — максимально насыщенная страница, добавьте в схему/парсинг:

1. `other_title` — альтернативные названия.
2. `duration` и `minimal_age` (если есть в `material_data`/API-ответе).
3. `imdb_id`, `mdl_id`, `worldart_link` как отдельные колонки.
4. `blocked_countries`, `blocked_seasons` (для UI предупреждений о доступности).
5. `seasons` + `with_episodes_data=true` для:
   - списка сезонов/эпизодов,
   - названий эпизодов,
   - кадров по каждой серии.

## 5) Набор KODIK-параметров для «богатой» карточки тайтла

Для максимально полного ответа по одному аниме можно использовать запрос формата:

- `types=anime,anime-serial`
- `with_material_data=true`
- `with_episodes_data=true` (если нужен UX по сериям)
- `shikimori_id=<id>` (или `id=<kodik_id>`)
- `limit=1`

Это позволит получить не только базу + рейтинги/жанры/студии, но и структуру сезонов/эпизодов для полноценной watch-страницы.

## 6) Приоритет внедрения (быстрый план)

1. **Сразу (высокий эффект):**
   - вывести на странице все уже сохранённые поля: рейтинги+голоса, статусы, эпизоды, страны/жанры/студии, скриншоты, озвучки.
2. **Следом:**
   - начать сохранять `other_title`, `imdb_id`, `worldart_link`, `duration`.
3. **Максимум «вау» на watch-странице:**
   - включить `with_episodes_data` и построить UX сезонов/серий/превью.

