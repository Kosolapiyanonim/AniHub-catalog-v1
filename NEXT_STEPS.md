# AniHub - План действий

## Текущее состояние

- [x] Supabase проект создан
- [x] Таблицы созданы (полная схема)
- [x] RLS политики настроены
- [x] `.env.local` настроен
- [ ] База данных пуста — нужно наполнить

---

## Шаг 1: Проверить парсер

Парсер находится в `/api/parser` и `/api/parse-single-page`. Нужно убедиться, что он работает с новой схемой.

### Что проверить:

1. **Таблица `translations`** — парсер должен сохранять озвучки:
   ```
   anime_id, kodik_translation_id, title, type, player_link
   ```

2. **Связующие таблицы** — парсер должен использовать:
   - `anime_genres` (не `anime_relations` с типом)
   - `anime_studios`
   - `anime_countries`

### Действие:

```bash
# Открыть в браузере или через curl
GET http://localhost:3000/api/parser
# Должен вернуть: {"status": "ok", "message": "Parser API is online."}
```

---

## Шаг 2: Обновить парсер (если нужно)

Файлы для проверки/обновления:

| Файл | Что делает |
|------|------------|
| `app/api/parser/route.ts` | Основной парсер (POST) |
| `app/api/parse-single-page/route.ts` | Парсинг одной страницы |
| `lib/parser-utils.ts` | Вспомогательные функции |

### Ключевые изменения:

1. **Сохранение озвучек** — добавить INSERT в `translations`:
   ```ts
   await supabase.from('translations').upsert({
     anime_id: animeId,
     kodik_translation_id: item.translation.id,
     title: item.translation.title,
     type: item.translation.type,
     player_link: item.link,
   }, { onConflict: 'anime_id,kodik_translation_id' });
   ```

2. **Связи через отдельные таблицы**:
   ```ts
   // anime_genres
   await supabase.from('anime_genres').upsert({
     anime_id: animeId,
     genre_id: genreId,
   }, { onConflict: 'anime_id,genre_id' });
   ```

---

## Шаг 3: Запустить парсинг

### Через админку:

1. Открыть `http://localhost:3000/admin/parser`
2. Нажать "Начать парсинг"
3. Дождаться завершения (следить за логами)

### Через API напрямую:

```bash
curl -X POST http://localhost:3000/api/parser \
  -H "Content-Type: application/json" \
  -d '{"pagesToParse": 5}'
```

### Ожидаемый результат:

- Таблица `animes` заполнена
- Таблицы `genres`, `studios` заполнены
- Связи в `anime_genres`, `anime_studios` созданы
- Озвучки в `translations` сохранены

---

## Шаг 4: Проверить данные

### В Supabase Dashboard:

1. **Table Editor** → `animes` — должны быть записи
2. **Table Editor** → `translations` — должны быть озвучки
3. **Table Editor** → `anime_genres` — должны быть связи

### Через API:

```bash
# Каталог
GET http://localhost:3000/api/catalog

# Детальная страница
GET http://localhost:3000/api/anime/1  # shikimori_id
```

---

## Шаг 5: Настроить OAuth (опционально)

### В Supabase Dashboard:

1. **Authentication** → **Providers** → **Google**:
   - Включить
   - Добавить Client ID и Secret из Google Cloud Console
   - Redirect URL: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`

2. **Authentication** → **URL Configuration**:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

### В Google Cloud Console:

1. Создать OAuth 2.0 Client ID
2. Добавить Authorized redirect URI:
   ```
   https://YOUR_PROJECT.supabase.co/auth/v1/callback
   ```

---

## Шаг 6: Тестирование страниц

| Страница | URL | Что проверить |
|----------|-----|---------------|
| Главная | `/` | Hero-слайдер, карусели |
| Каталог | `/catalog` | Фильтры, карточки, пагинация |
| Аниме | `/anime/{id}` | Детали, жанры, теги |
| Просмотр | `/anime/{id}/watch` | Плеер Kodik, выбор озвучки |
| Логин | `/login` | Авторизация Email/Google |

---

## Шаг 7: Деплой на Vercel

1. Подключить репозиторий к Vercel
2. Добавить переменные окружения:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   KODIK_API_TOKEN
   ```
3. Обновить URL в Supabase:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/auth/callback`

---

## Чеклист

- [ ] Парсер работает с новой схемой
- [ ] База наполнена данными (animes, translations, связи)
- [ ] `/api/catalog` возвращает данные
- [ ] `/api/anime/[id]` возвращает детали с жанрами
- [ ] Страница `/anime/[id]/watch` показывает плеер
- [ ] Авторизация работает
- [ ] Списки пользователя работают (`user_lists`)
- [ ] Комментарии работают
- [ ] Деплой на Vercel

---

## Возможные проблемы

### Парсер не сохраняет озвучки

**Причина:** Код парсера не обновлён под таблицу `translations`.

**Решение:** Добавить INSERT в `translations` после сохранения аниме.

### Каталог пустой

**Причина:** View `animes_with_details` не создан или запрос идёт к нему.

**Решение:** Проверить, что View создан в Supabase, или изменить запрос на прямой SELECT из `animes`.

### Страница просмотра не работает

**Причина:** Таблица `translations` пуста.

**Решение:** Обновить парсер и перезапустить парсинг.

### Ошибка RLS

**Причина:** Политики не созданы.

**Решение:** Выполнить SQL с политиками из схемы.
