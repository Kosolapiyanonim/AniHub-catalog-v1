# Пошагово: как проверить гипотезу `kodik_id == MAL anime_id`

Этот гайд — «с нуля», если ты только зарегистрировался в Kodik API.

## 1) Где взять токен Kodik

1. Открой кабинет API Kodik (`kodikapi.com`) под своим аккаунтом.
2. Перейди в раздел API / профиль API-ключа.
3. Скопируй значение токена (обычно подписано как `token` / `API token`).
4. Сохрани токен в `.env.local` в корне проекта:

```bash
KODIK_API_TOKEN=вставь_сюда_токен
```

> Важно: не коммить `.env.local` в git.

## 2) Подготовка окружения

В корне репозитория:

```bash
npm install
source .env.local
```

Проверка, что токен виден в shell:

```bash
echo "$KODIK_API_TOKEN"
```

Если видишь пусто — `source .env.local` не применился.

## 3) Запуск проверки

Быстрый запуск на маленькой выборке:

```bash
npm run verify:kodik-mal-id -- --limit 20 --sample 5
```

Полезный запуск с сохранением отчёта в файл:

```bash
npm run verify:kodik-mal-id -- --limit 50 --sample 20 --out logs/kodik-mal-report.json
```

## 4) Что ты увидишь в логах

Скрипт выводит шаги:

- `Step 1/4` — запрос в Kodik `/list`.
- `Step 2/4` — по каждому тайтлу проверка соответствия через Jikan/MAL:
  - `shikimori_id` как MAL ID,
  - `kodik_id` как MAL ID.
- `Step 3/4` — итоговые счётчики совпадений.
- `Step 4/4` — сохранение JSON-отчёта (если указал `--out`).

Главные строки результата:

- `Matches by shikimori_id -> MAL: X/Y`
- `Matches by kodik_id     -> MAL: X/Y`

Если первая строка сильно выше второй — гипотеза про `kodik_id == MAL anime_id` скорее **неверная**, а `shikimori_id` лучше подходит как MAL id-связка.

## 5) Как интерпретировать JSON-отчёт

Файл `logs/kodik-mal-report.json` содержит:

- `summary` — сводка по выборке,
- `rows[]` — детально по каждому аниме:
  - `kodik_id`, `shikimori_id`,
  - `kodik_title`,
  - `mal_title_by_shikimori_id`, `shikimori_id_matches_mal_title`,
  - `mal_title_by_kodik_id`, `kodik_id_matches_mal_title`.

Это удобно, чтобы глазами проверить спорные случаи.

## 6) Что делать, если что-то не работает

- Ошибка `Missing KODIK_API_TOKEN`:
  - проверь `.env.local`,
  - заново выполни `source .env.local`.
- `Kodik API error: 401/403`:
  - токен неверный или ограничен.
- Много `null` от Jikan:
  - иногда нет записи или временный rate-limit; увеличь задержку/уменьши `--sample`.

## 7) Рекомендуемый «рабочий» сценарий

1. Прогоняешь `--sample 5` (быстро проверить, что всё живое).
2. Прогоняешь `--sample 30 --out logs/kodik-mal-report.json`.
3. Смотришь summary + 5-10 строк из `rows`.
4. Фиксируешь правило маппинга в проекте (обычно: `shikimori_id` приоритетнее для MAL-связки).

