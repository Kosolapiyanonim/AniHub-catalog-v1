# Stub аккаунт пользователя (черновая версия)

Этот модуль нужен как **временная заглушка** для будущей интеграции полноценного аккаунта в сервис.

## Что реализовано

- `POST /api/stub-account` — регистрация чернового пользователя.
- `POST /api/stub-account/login` — логин чернового пользователя.
- `GET /api/stub-account?id=<userId>` — получить профиль по `id`.

Все данные хранятся in-memory в `Map` (файл `lib/stub-account-store.ts`). После рестарта сервера данные очищаются.


## Быстрый ручной тест через UI

Откройте страницу `http://localhost:3000/stub-account` и протестируйте:

1. Регистрацию пользователя.
2. Логин теми же данными.
3. Получение профиля по `id` (подставляется автоматически после регистрации/логина).

## Пример регистрации

```bash
curl -X POST http://localhost:3000/api/stub-account \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@anihub.local","password":"strongpass1","displayName":"Demo User"}'
```

## Пример логина

```bash
curl -X POST http://localhost:3000/api/stub-account/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@anihub.local","password":"strongpass1"}'
```

## Ограничения заглушки

- Нет персистентного хранилища.
- Нет refresh-токенов и настоящей сессии.
- Нет email-верификации, восстановления пароля и MFA.

## Что можно подключать дальше

1. Подменить `stub-account-store` на реальный `Supabase/Auth` слой.
2. Сохранить те же контрактные ответы API, чтобы UI мигрировал без боли.
3. Добавить middleware-проверку `accessToken` и ролевую модель.
