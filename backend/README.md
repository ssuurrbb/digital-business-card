# Digital business card — backend

GraphQL API визитки: NestJS, Prisma, PostgreSQL, Apollo Sandbox.

Публичные запросы читают карточку. Мутации закрыты заголовком `x-admin-key` — ими будет пользоваться админка.

## Архитектура

Слои разделены так, чтобы GraphQL не ходил в Prisma напрямую, а бизнес-логика не знала про HTTP.

```
Resolver  →  Service  →  Prisma
(API)        (правила)   (данные)
```

- `profile` — агрегат визитки и публичный `query { profile }`
- `skill` — справочник технологий
- `experience` — места работы и достижения
- `project` — проекты и их стек
- `prisma` — единственная точка доступа к БД
- `common` — guard админки, парсер selection set, формат периода

### Почему такая схема БД

Визитка однопользовательская (`Profile.slug = me`), но данные нормализованы.

- `Skill` — справочник уникальных имён. TypeScript не копируется строкой в трёх местах.
- `ProfileSkill` / `ProjectSkill` — связи. Один навык может быть и в профиле, и у проекта.
- `Achievement` — отдельные строки, не `String[]`. У текущей работы 12 буллетов, их удобно отдавать вложенным GraphQL и править по одному.
- Даты хранятся как `Date`, строка «Апрель 2024 — настоящее время» собирается в сервисе (`period`).
- Телефон в БД нет: публичный playground не должен его светить.

Seed идемпотентный: если профиль уже есть, повторный запуск его не затирает. Админские правки переживают рестарт контейнера. Чтобы наполнить БД заново: `npx prisma migrate reset`.

### GraphQL и запросы к БД

`query profile` смотрит на selection set и собирает Prisma `include` только для запрошенных веток.

Запрос без `projects` не джойнит проекты. Запрос без `achievements` не тянет буллеты. Для карточки это один SQL с джойнами, без N+1.

Связки `ProfileSkill` / `ProjectSkill` наружу не торчат: клиент видит `skills { name }`, как в задании.

### Мутации

Все `mutation *` требуют заголовок:

```
x-admin-key: <ADMIN_API_KEY>
```

Публичный Sandbox остаётся безопасным: прочитать визитку можно, переписать — нет.

## Запуск

Нужны Node 20+ и Docker (для Postgres).

Postgres в Docker слушает **55432** на хосте, чтобы не пересечься с локальным PostgreSQL на 5432/5433.

```bash
cp .env.example .env
docker compose up -d postgres
npx prisma migrate deploy
npx prisma db seed
npm run start:dev
```

- API: http://localhost:3000/graphql — Apollo Sandbox
- Health: http://localhost:3000/health

Весь стек контейнерами:

```bash
docker compose up --build
```

При старте контейнера: `prisma migrate deploy`, затем seed, затем Nest.

## Пример запроса

```graphql
query {
  profile {
    name
    headline
    description
    skills {
      name
    }
    experience {
      company
      position
      period
      achievements {
        text
      }
    }
    projects {
      name
      description
      skills {
        name
      }
    }
  }
}
```

## Скрипты

| Команда | Что делает |
|---|---|
| `npm run start:dev` | Nest в watch-режиме |
| `npm run db:migrate` | Prisma migrate dev |
| `npm run db:seed` | Наполнить БД, если профиля ещё нет |
| `npm run db:studio` | Prisma Studio |

Ссылки GitHub/LinkedIn и URL проектов в seed не выдуманы — их нет в резюме. Добавятся через админку или правкой seed.
