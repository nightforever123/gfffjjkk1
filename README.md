# Secure Notes (Next.js + PostgreSQL + Drizzle)

Функции:
- Регистрация: email, никнейм, пароль, подтверждение пароля
- Подтверждение email через 4-значный код (5 минут)
- Повторная отправка кода через 60 секунд
- Вход по email + пароль
- Dashboard: создание/редактирование/удаление заметок
- Admin `/admin`: статистика, пользователи, раскрытие заметок по клику, удаление пользователей/заметок
- Developer-аккаунт создаётся автоматически

## Переменные окружения

Обязательные:
- `DATABASE_URL=postgresql://...`

Для отправки email (SMTP, не Resend):
- `SMTP_HOST`
- `SMTP_PORT` (обычно 587)
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM` (опционально)

Developer аккаунт (опционально):
- `DEV_EMAIL` (default: `developer@site.local`)
- `DEV_PASSWORD` (default: `Dev12345!`)
- `DEV_NICKNAME` (default: `Developer`)

## Локальный запуск

```bash
npm install
npx drizzle-kit push
npm run dev
```

## Деплой на Netlify

Добавьте в Netlify:
- `DATABASE_URL`
- SMTP переменные

Важно: если `DATABASE_URL` не задан, сборка/рантайм API с БД работать не будут.

## “Чтобы сайт работал всегда”

Это зависит от хостинга, а не только от кода.
Используйте always-on хостинг (VPS, Render paid, Railway paid, Fly.io, etc.),
или отключите авто-sleep в настройках тарифа.
