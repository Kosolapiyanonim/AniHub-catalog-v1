# Архитектура AniHub - Документация

## Обзор системы

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js 14)                       │
├─────────────────────────────────────────────────────────────────────┤
│  Страницы (/app)          │  Компоненты (/components)               │
│  - page.tsx (главная)     │  - AnimeCard, AnimeCarousel             │
│  - /catalog               │  - HeroSlider, HeroSection               │
│  - /anime/[id]            │  - CatalogFilters                       │
│  - /anime/[id]/watch      │  - Comments (с replies), SubscribeButton│
│  - /login, /register      │  - supabase-provider (auth context)     │
│  - /admin/parser          │  - CommandPalette, SearchDialog         │
│  - /admin/users           │                                         │
│  - /admin/hero            │                                         │
├─────────────────────────────────────────────────────────────────────┤
│                         API ROUTES (/app/api)                       │
│  - /api/catalog           - Каталог с фильтрами                     │
│  - /api/anime/[id]        - Детальная информация                    │
│  - /api/search            - Полнотекстовый поиск                    │
│  - /api/lists             - Списки пользователя                     │
│  - /api/comments          - Комментарии (с replies, soft delete)    │
│  - /api/subscriptions     - Подписки на уведомления                 │
│  - /api/parser            - Парсинг из Kodik API                    │
│  - /api/admin/users       - Управление ролями пользователей        │
│  - /api/admin/hero        - Управление Hero-секцией                 │
│  - /api/auth/sync         - Синхронизация сессии                    │
├─────────────────────────────────────────────────────────────────────┤
│                         SUPABASE (Backend)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐  │
│  │   Auth      │  │  Database   │  │  RLS Policies               │  │
│  │  - Email    │  │  - animes   │  │  - Public read              │  │
│  │  - Google   │  │  - genres   │  │  - Auth user write (lists)  │  │
│  │  - Spotify  │  │  - studios  │  │  - Service role (parser)    │  │
│  │  - Auto     │  │  - profiles │  │  - Role-based access (admin) │  │
│  │    refresh  │  │    (roles)  │  └─────────────────────────────┘  │
│  └─────────────┘  │  - user_*   │                                   │
│                   └─────────────┘                                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Страницы и их источники данных

### 1. Главная страница (`/`)
**Файл:** `app/page.tsx`

| Секция | Источник | Таблица Supabase | Сортировка |
|--------|----------|------------------|------------|
| Hero Slider | `getHomepageSections()` | `animes` | `is_featured_in_hero = true` (управляется через `/admin/hero`) |
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

### 8. Админ: Управление пользователями (`/admin/users`)
**Файл:** `app/admin/users/page.tsx`

| Функция | API | Описание |
|---------|-----|----------|
| Просмотр пользователей | `GET /api/admin/users` | Список всех пользователей с ролями |
| Поиск пользователей | `GET /api/admin/users?search=...` | Поиск по имени или ID |
| Изменение роли | `PATCH /api/admin/users` | Обновление роли пользователя |

**Требования:** Роль `admin`

**Поток данных:**
```
/admin/users (client component)
  └─> fetch("/api/admin/users")
      └─> app/api/admin/users/route.ts
          ├─> Проверка роли (isAdmin)
          ├─> SELECT FROM profiles
          └─> Возврат списка с ролями
```

**Роли пользователей:**
- `admin` - Полный доступ, может удалять любые комментарии, управлять ролями
- `manager` - Зарезервировано для будущего использования
- `viewer` - Обычный пользователь (роль по умолчанию)

---

### 9. Админ: Управление Hero-секцией (`/admin/hero`)
**Файл:** `app/admin/hero/page.tsx`

| Действие | API | Описание |
|----------|-----|----------|
| Просмотр текущих | `GET /api/admin/hero` | Список аниме в Hero-секции |
| Добавить аниме | `POST /api/admin/hero` | Добавить аниме в Hero (action: "add") |
| Удалить аниме | `POST /api/admin/hero` | Удалить из Hero (action: "remove") |
| Установить список | `POST /api/admin/hero` | Заменить весь список (action: "set") |

**Поток данных:**
```
/admin/hero → POST /api/admin/hero
  └─> app/api/admin/hero/route.ts
      ├─> Использует service_role для обхода RLS
      └─> UPDATE animes SET is_featured_in_hero = true/false
```

**Особенности:**
- Hero-секция отображает аниме с `is_featured_in_hero = true`
- Управление через веб-интерфейс для администраторов
- Поддержка скриншотов для фона Hero-слайдера

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
| `profiles` | Профили пользователей | Только владелец |
| `user_lists` | Списки пользователя (watching, completed, dropped...) | Только владелец |
| `user_subscriptions` | Подписки на уведомления | Только владелец |
| `comments` | Комментарии к аниме (с поддержкой replies) | Читают все, пишут авторизованные |

### Дополнительные поля

| Таблица | Новое поле | Описание |
|---------|------------|----------|
| `profiles` | `role` | Роль пользователя: `admin`, `manager`, `viewer` |
| `animes` | `is_featured_in_hero` | Флаг для Hero-секции на главной странице |
| `comments` | `parent_id` | ID родительского комментария (для replies) |
| `comments` | `deleted_at` | Мягкое удаление (soft delete) |

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
| `/api/comments` | GET | Комментарии к аниме (с replies, фильтрация deleted_at) |

### Требуют авторизации

| Endpoint | Метод | Описание |
|----------|-------|----------|
| `/api/lists` | POST | Добавить/обновить аниме в список |
| `/api/subscriptions` | POST/GET | Управление подписками |
| `/api/comments` | POST | Добавить комментарий (с поддержкой parentId для replies) |
| `/api/comments` | DELETE | Удалить комментарий (soft delete если есть replies, иначе физическое удаление) |
| `/api/profile` | GET/PATCH | Получить/обновить профиль пользователя (включая роль) |

### Административные (требуют роль admin)

| Endpoint | Метод | Описание |
|----------|-------|----------|
| `/api/admin/users` | GET | Получить список пользователей с ролями |
| `/api/admin/users` | PATCH | Обновить роль пользователя |
| `/api/admin/hero` | GET | Получить список аниме для Hero-секции |
| `/api/admin/hero` | POST | Управление Hero-секцией (add/remove/set) |

### Административные (service_role для парсинга)

| Endpoint | Метод | Описание |
|----------|-------|----------|
| `/api/parser` | POST | Запуск парсера Kodik |
| `/api/parse-single-page` | POST | Парсинг одной страницы |
| `/api/full-parser` | POST | Полный парсинг |
| `/api/auth/sync` | POST | Синхронизация сессии после клиентской авторизации |

---

## Контекст авторизации

### Клиентская авторизация

**Провайдер:** `components/supabase-provider.tsx`

```tsx
// Доступ к сессии в клиентских компонентах:
const { supabase, session } = useSupabase();

// session содержит:
// - session.user.id (UUID пользователя)
// - session.user.email
// - session.user.user_metadata.full_name
```

**Автоматическое обновление токенов:**
- Провайдер автоматически обновляет JWT токены каждые 50 минут
- Обновление при возврате фокуса на вкладку
- Слушатель изменений состояния авторизации (`onAuthStateChange`)

### Серверная авторизация

**В API routes (Route Handlers):**
```tsx
import { createClientForRouteHandler, getAuthenticatedUser } from "@/lib/supabase/server"

const response = new NextResponse()
const supabase = await createClientForRouteHandler(response)
const user = await getAuthenticatedUser(supabase) // Гибридный подход: getUser + getSession

if (!user) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: response.headers })
}
```

**В Server Components:**
```tsx
import createClient from "@/lib/supabase/server"

const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
```

### Middleware для обновления сессий

**Файл:** `middleware.ts`

- Автоматически обновляет JWT токены на каждом запросе
- Использует `getSession()` для автоматического обновления истекших токенов
- Обрабатывает все маршруты кроме статических файлов и API routes

### Система ролей

**Утилиты:** `lib/role-utils.ts`

```tsx
import { getUserRole, isAdmin, canDeleteAnyComment } from "@/lib/role-utils"

const userRole = await getUserRole(supabase, userId)
if (isAdmin(userRole)) {
  // Пользователь - администратор
}

if (canDeleteAnyComment(userRole)) {
  // Может удалять любые комментарии
}
```

**Роли:**
- `admin` - Полный доступ, управление пользователями, удаление любых комментариев
- `manager` - Зарезервировано для будущего использования
- `viewer` - Обычный пользователь (по умолчанию)

---

## Внешние API

### Kodik API
- **Назначение:** Источник данных об аниме и плееров
- **Используется в:** `/api/parser`, `/api/parse-single-page`
- **Документация:** `document api kodik.txt`

### Shikimori GraphQL (опционально)
- **Назначение:** Обогащение данных (связи, теги)
- **Используется в:** `scripts/enrich-animes-from-shikimori-graphql.ts`

---

## Новые функции и улучшения

### 1. Система комментариев с ответами (Replies)

**Файлы:** `app/api/comments/route.ts`, `components/Comments.tsx`

**Особенности:**
- Поддержка вложенных комментариев (replies) через поле `parent_id`
- Мягкое удаление (soft delete): комментарии с ответами помечаются `deleted_at` вместо физического удаления
- Физическое удаление: комментарии без ответов удаляются полностью
- Rate limiting: максимум 5 комментариев в минуту с cooldown 30 секунд
- Права доступа на основе ролей:
  - Обычные пользователи могут удалять только свои комментарии
  - Администраторы могут удалять любые комментарии

**Поток данных:**
```
GET /api/comments?animeId=X
  └─> SELECT FROM comments WHERE anime_id = X AND deleted_at IS NULL
      ├─> Группировка по parent_id
      └─> Возврат иерархической структуры (comments с replies)

POST /api/comments
  └─> Проверка rate limit
      └─> INSERT INTO comments (anime_id, user_id, content, parent_id)

DELETE /api/comments?id=X
  └─> Проверка прав (владелец или admin)
      ├─> Если есть replies → UPDATE SET deleted_at
      └─> Если нет replies → DELETE
```

### 2. Управление Hero-секцией

**Файлы:** `app/admin/hero/page.tsx`, `app/api/admin/hero/route.ts`

**Функции:**
- Визуальный интерфейс для управления аниме в Hero-секции
- Добавление/удаление аниме из Hero
- Замена всего списка одной операцией
- Использование скриншотов для фона слайдера
- Сортировка по рейтингу Shikimori

**Поток данных:**
```
GET /api/admin/hero
  └─> SELECT FROM animes WHERE is_featured_in_hero = true
      └─> Возврат текущих + список популярных для выбора

POST /api/admin/hero
  └─> Использует service_role для обхода RLS
      └─> UPDATE animes SET is_featured_in_hero = true/false
```

### 3. Управление ролями пользователей

**Файлы:** `app/admin/users/page.tsx`, `app/api/admin/users/route.ts`, `lib/role-utils.ts`

**Функции:**
- Веб-интерфейс для управления ролями
- Поиск пользователей по имени или ID
- Изменение роли через выпадающий список
- Защита от изменения собственной роли администратором
- Визуальные индикаторы ролей (badges)

**Поток данных:**
```
GET /api/admin/users
  └─> Проверка роли (isAdmin)
      └─> SELECT FROM profiles ORDER BY created_at DESC

PATCH /api/admin/users
  └─> Проверка роли (isAdmin)
      ├─> Валидация роли
      ├─> Защита от самоизменения роли
      └─> UPDATE profiles SET role = ?
```

### 4. Улучшенная система аутентификации

**Файлы:** `lib/supabase/server.ts`, `middleware.ts`, `components/supabase-provider.tsx`

**Улучшения:**
- **Гибридный подход к аутентификации:**
  - `getAuthenticatedUser()` сначала использует `getUser()` для проверки подлинности
  - При истечении токена автоматически переключается на `getSession()` для обновления
  - Устраняет предупреждения Supabase о безопасности

- **Автоматическое обновление токенов:**
  - Middleware обновляет токены на каждом запросе
  - Клиентский провайдер обновляет каждые 50 минут
  - Обновление при возврате фокуса на вкладку

- **Синхронизация сессий:**
  - API endpoint `/api/auth/sync` для синхронизации после клиентской авторизации
  - Обеспечивает корректную работу серверных компонентов после входа

**Поток данных:**
```
Клиентская авторизация (Email/Password)
  └─> supabase.auth.signInWithPassword()
      └─> POST /api/auth/sync (синхронизация с сервером)
          └─> Установка cookies для серверных компонентов

OAuth авторизация (Google/Spotify)
  └─> supabase.auth.signInWithOAuth()
      └─> /auth/callback
          └─> Обмен кода на сессию
              └─> Редирект на главную
```

### 5. Обогащение данных главной страницы

**Файлы:** `lib/data-fetchers.ts`, `app/api/homepage-sections/route.ts`

**Улучшения:**
- Использование поля `is_featured_in_hero` для Hero-секции
- Поддержка скриншотов для фона Hero-слайдера
- Параллельная загрузка всех секций через `Promise.all`
- Обогащение данных статусом пользователя (`user_list_status`)

**Поток данных:**
```
getHomepageSections()
  └─> Promise.all([
        SELECT FROM animes WHERE is_featured_in_hero = true,
        SELECT FROM animes ORDER BY shikimori_rating DESC,
        SELECT FROM animes ORDER BY shikimori_votes DESC,
        SELECT FROM animes ORDER BY updated_at_kodik DESC
      ])
      └─> enrichWithUserStatus() добавляет user_list_status
```

---

## Документация

Дополнительная документация находится в папке `docs/`:
- `USER_ROLES.md` - Подробное описание системы ролей
- `AUTH_TOKEN_REFRESH.md` - Руководство по обновлению JWT токенов
- `TESTING_TOKEN_REFRESH.md` - Тестирование обновления токенов
