# Архитектура AniHub - Документация

## Обзор системы

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js 14)                       │
├─────────────────────────────────────────────────────────────────────┤
│  Страницы (/app)          │  Компоненты (/components)               │
│  - page.tsx (главная)     │  - AnimeCard, AnimeCarousel             │
│  - /catalog               │  - HeroSlider                           │
│  - /anime/[id]            │  - CatalogFilters                       │
│  - /anime/[id]/watch      │  - Comments, SubscribeButton            │
│  - /login, /register      │  - supabase-provider (auth context)     │
│  - /admin/parser          │                                         │
├─────────────────────────────────────────────────────────────────────┤
│                         API ROUTES (/app/api)                       │
│  - /api/catalog           - Каталог с фильтрами                     │
│  - /api/anime/[id]        - Детальная информация                    │
│  - /api/search            - Полнотекстовый поиск                    │
│  - /api/lists             - Списки пользователя                     │
│  - /api/comments          - Комментарии                             │
│  - /api/subscriptions     - Подписки на уведомления                 │
│  - /api/parser            - Парсинг из Kodik API                    │
├─────────────────────────────────────────────────────────────────────┤
│                         SUPABASE (Backend)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐  │
│  │   Auth      │  │  Database   │  │  RLS Policies               │  │
│  │  - Email    │  │  - animes   │  │  - Public read              │  │
│  │  - Google   │  │  - genres   │  │  - Auth user write (lists)  │  │
│  │  - Spotify  │  │  - studios  │  │  - Service role (parser)    │  │
│  └─────────────┘  │  - user_*   │  └─────────────────────────────┘  │
│                   └─────────────┘                                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Страницы и их источники данных

### 1. Главная страница (`/`)
**Файл:** `app/page.tsx`

| Секция | Источник | Таблица Supabase | Сортировка |
|--------|----------|------------------|------------|
| Hero Slider | `getHomepageSections()` | `animes` | `is_featured_in_hero = true` |
| Популярное | `getHomepageSections()` | `animes` | `shikimori_votes DESC` |
| В тренде | `getHomepageSections()` | `animes` | `shikimori_rating DESC` |
| Последние обновления | `getHomepageSections()` | `animes` | `updated_at_kodik DESC` |

**Поток данных:**
```
app/page.tsx 
  └─> lib/data-fetchers.ts::getHomepageSections()
      └─> Supabase: SELECT * FROM animes + anime_genres JOIN
          └─> enrichWithUserStatus() добавляет user_list_status
```

---

### 2. Каталог (`/catalog`)
**Файл:** `app/catalog/page.tsx`

| Функция | API | Параметры |
|---------|-----|-----------|
| Список аниме | `GET /api/catalog` | page, limit, sort, order |
| Фильтрация | `GET /api/catalog` | genres, studios, year_from, year_to, statuses, kinds |
| Поиск по названию | `GET /api/catalog` | title |
| Фильтр по списку пользователя | `GET /api/catalog` | user_list_status (watching, completed, etc.) |

**Поток данных:**
```
app/catalog/page.tsx (client component)
  └─> fetch("/api/catalog?...")
      └─> app/api/catalog/route.ts
          ├─> Supabase: SELECT FROM animes_with_details
          ├─> JOIN anime_genres, anime_studios
          └─> Если авторизован: JOIN user_lists для user_list_status
```

**Используемые таблицы:**
- `animes` / `animes_with_details` (view)
- `anime_genres` → `genres`
- `anime_studios` → `studios`
- `user_lists` (если пользователь авторизован)

---

### 3. Страница аниме (`/anime/[id]`)
**Файл:** `app/anime/[id]/page.tsx`

| Данные | API | Описание |
|--------|-----|----------|
| Основная информация | `GET /api/anime/{shikimori_id}` | Название, постер, описание, рейтинг |
| Жанры и теги | `GET /api/anime/{shikimori_id}` | Через JOIN |
| Связанные аниме | `GET /api/anime/{shikimori_id}` | Из `anime_relations` |
| Статус в списке | `GET /api/anime/{shikimori_id}` | Из `user_lists` |
| Комментарии | `GET /api/comments?animeId=X` | Отдельный запрос |

**Поток данных:**
```
app/anime/[id]/page.tsx (client component)
  └─> fetch("/api/anime/{id}")
      └─> app/api/anime/[id]/route.ts
          ├─> Supabase: SELECT FROM animes WHERE shikimori_id = ?
          ├─> JOIN anime_genres → genres
          ├─> JOIN anime_studios → studios  
          ├─> JOIN anime_tags → tags
          ├─> SELECT FROM anime_relations → animes (related)
          └─> SELECT FROM user_lists (если авторизован)
```

---

### 4. Страница просмотра (`/anime/[id]/watch`)
**Файл:** `app/anime/[id]/watch/page.tsx`

| Данные | Источник | Описание |
|--------|----------|----------|
| Информация об аниме | Supabase (server) | Через `createClient()` |
| Список озвучек | Supabase (server) | Таблица `translations` |
| Плеер | Kodik iframe | URL из `translations.player_link` |
| Комментарии | `Comments` компонент | API `/api/comments` |

**Поток данных:**
```
app/anime/[id]/watch/page.tsx (Server Component)
  └─> lib/supabase/server.ts::createClient()
      ├─> SELECT FROM animes WHERE shikimori_id = ?
      └─> SELECT FROM translations WHERE anime_id = ?
          └─> KodikPlayer получает player_link
```

---

### 5. Популярное (`/popular`)
**Файл:** `app/popular/page.tsx`

| Вкладка | API запрос | Сортировка |
|---------|------------|------------|
| Топ рейтинг | `/api/catalog?sort=shikimori_rating` | По рейтингу Shikimori |
| Новинки | `/api/catalog?sort=year` | По году выпуска |
| В тренде | `/api/catalog?sort=shikimori_votes` | По количеству голосов |

---

### 6. Авторизация (`/login`, `/register`)
**Файлы:** `app/login/page.tsx`, `app/register/page.tsx`

| Метод | Функция Supabase | Провайдер |
|-------|------------------|-----------|
| Email/Password | `signInWithPassword()` / `signUp()` | Email |
| Google | `signInWithOAuth({ provider: 'google' })` | OAuth |
| Spotify | `signInWithOAuth({ provider: 'spotify' })` | OAuth |

**Callback:** `app/auth/callback/route.ts` - обмен кода на сессию

---

### 7. Админ: Парсер (`/admin/parser`)
**Файл:** `app/admin/parser/page.tsx`

| Действие | API | Описание |
|----------|-----|----------|
| Запуск парсинга | `POST /api/parse-single-page` | Парсит одну страницу Kodik |
| Полный парсинг | `POST /api/parser` | Парсит несколько страниц |

**Поток данных парсинга:**
```
/admin/parser → POST /api/parse-single-page
  └─> fetch("https://kodikapi.com/list?...")
      └─> Обработка результатов:
          ├─> UPSERT INTO animes (основные данные)
          ├─> UPSERT INTO genres + anime_genres
          ├─> UPSERT INTO studios + anime_studios
          └─> UPSERT INTO countries + anime_countries
```

---

## Схема базы данных

### Основные таблицы

| Таблица | Описание | Ключевые поля |
|---------|----------|---------------|
| `animes` | Каталог аниме | id, shikimori_id, title, poster_url, shikimori_rating |
| `genres` | Справочник жанров | id, name, slug |
| `studios` | Справочник студий | id, name, slug |
| `tags` | Справочник тегов | id, name, slug |
| `countries` | Справочник стран | id, name |
| `translations` | Озвучки/плееры | id, anime_id, title, player_link |

### Связующие таблицы

| Таблица | Связь |
|---------|-------|
| `anime_genres` | animes ↔ genres |
| `anime_studios` | animes ↔ studios |
| `anime_tags` | animes ↔ tags |
| `anime_countries` | animes ↔ countries |
| `anime_relations` | animes ↔ animes (связанные) |

### Пользовательские таблицы

| Таблица | Описание | RLS |
|---------|----------|-----|
| `user_lists` | Списки пользователя (watching, completed, dropped...) | Только владелец |
| `user_subscriptions` | Подписки на уведомления | Только владелец |
| `comments` | Комментарии к аниме | Читают все, пишут авторизованные |

---

## API Endpoints

### Публичные (без авторизации)

| Endpoint | Метод | Описание |
|----------|-------|----------|
| `/api/catalog` | GET | Каталог с фильтрами и пагинацией |
| `/api/anime/[id]` | GET | Детальная информация об аниме |
| `/api/search` | GET | Полнотекстовый поиск |
| `/api/genres` | GET | Список жанров |
| `/api/studios` | GET | Список студий |
| `/api/years` | GET | Список годов |
| `/api/comments` | GET | Комментарии к аниме |

### Требуют авторизации

| Endpoint | Метод | Описание |
|----------|-------|----------|
| `/api/lists` | POST | Добавить/обновить аниме в список |
| `/api/subscriptions` | POST/GET | Управление подписками |
| `/api/comments` | POST | Добавить комментарий |

### Административные (service_role)

| Endpoint | Метод | Описание |
|----------|-------|----------|
| `/api/parser` | POST | Запуск парсера Kodik |
| `/api/parse-single-page` | POST | Парсинг одной страницы |
| `/api/full-parser` | POST | Полный парсинг |

---

## Контекст авторизации

**Провайдер:** `components/supabase-provider.tsx`

```tsx
// Доступ к сессии в клиентских компонентах:
const { supabase, session } = useSupabase();

// session содержит:
// - session.user.id (UUID пользователя)
// - session.user.email
// - session.user.user_metadata.full_name
```

**Серверная авторизация:**
```tsx
// В API routes:
const { data: { session } } = await supabase.auth.getSession();

// В Server Components:
const supabase = await createClient(); // из lib/supabase/server.ts
```

---

## Внешние API

### Kodik API
- **Назначение:** Источник данных об аниме и плееров
- **Используется в:** `/api/parser`, `/api/parse-single-page`
- **Документация:** `document api kodik.txt`

### Shikimori GraphQL (опционально)
- **Назначение:** Обогащение данных (связи, теги)
- **Используется в:** `scripts/enrich-animes-from-shikimori-graphql.ts`
