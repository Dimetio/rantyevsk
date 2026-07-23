# Rantyevsk — Цифровая платформа управления арендной недвижимостью

## Архитектура

Одно Next.js приложение в корне проекта:
```
rantyevsk/
├── src/
│   ├── app/
│   │   ├── api/            — API маршруты (auth, properties)
│   │   ├── auth/           — Страницы входа и регистрации
│   │   ├── owner/          — Портал собственника
│   │   ├── tenant/         — Портал арендатора
│   │   ├── layout.tsx      — Корневой layout
│   │   └── page.tsx        — Главная страница
│   ├── components/
│   │   ├── ui/             — Общие UI-компоненты (Button, Card, Input, Label, Badge)
│   │   └── compound/       — Составные компоненты
│   ├── hooks/              — Пользовательские хуки
│   ├── lib/                — Клиент Prisma, NextAuth конфигурация
│   ├── styles/             — Глобальные стили (Tailwind)
│   ├── types/              — TypeScript типы
│   ├── utils/              — Утилиты (cn)
│   └── validations/        — Zod-схемы валидации
├── prisma/
│   └── schema.prisma       — Схема БД
├── middleware.ts            — Проверка ролей (в src/)
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── AGENTS.md
```

## Стек

| Компонент | Технология |
|-----------|-----------|
| Framework | Next.js 14 (App Router) |
| Язык | TypeScript (строго) |
| ORM | Prisma |
| БД | PostgreSQL |
| Auth | NextAuth.js v5 (роли: OWNER, TENANT) |
| UI | shadcn/ui-стиль + Tailwind CSS |
| Forms | React Hook Form + Zod |
| Toasts | Sonner |
| Деплой | Vercel |

## Структура компонентов

### Простой компонент
```
Button/
  index.tsx     — компонент + export default
```

### Составной компонент (Compound Component)
```
RegisterCard/
  index.tsx              — Главный компонент (импортирует из ./components)
  components/
    Header.tsx           — Саб-компонент (export default)
    List.tsx             — Саб-компонент (export default)
    index.tsx            — Barrel: export { Header, List }
```

Правила:
- `index.tsx` — это сам компонент, не просто ре-экспорт
- Саб-компоненты living в `components/` подпапке
- Barrel `components/index.tsx` собирает саб-компоненты
- Вне компонента видно только основной `index.tsx`
- Саб-компоненты инкапсулированы, не экспортируются наружу

### Именование файлов

| Тип | Структура |
|-----|-----------|
| Компоненты | `ComponentName/index.tsx` |
| Хуки | `useHookName.ts` + `index.ts` barrel |
| Утилиты | `funcName.ts` + `index.ts` barrel |
| Типы | `typeName.ts` + `index.ts` barrel |

### Экспорт
- Везде `export default` для компонентов, хуков, утилит

## Комментарии и JSDoc

- Все комментарии и TODO пишутся **на русском языке**
- JSDoc добавляется к экспортным функциям, компонентам и хукам
- TODO пишутся как: `// TODO: описание на русском`
- FIXME пишутся как: `// FIXME: описание проблемы на русском`

## Импорты

Порядок импортов (каждая группа через пустую строку):
1. React / Next.js
2. Сторонние библиотеки
3. Компоненты (`@/components`)
4. Хуки (`@/hooks`)
5. Утилиты (`@/utils`)
6. Типы (`@/types`)

## Паттерны

### Авторизация
NextAuth.js v5 с Credentials провайдером + JWT сессия + middleware проверки ролей

### Модальные окна
Одна `Modal`-компонент + `useModal()` хук

### Zustand
Отдельные сторы по доменам:
- `usePropertyStore` — объекты недвижимости
- `useUIStore` — модалки, sidebar, toasts

### Формы
React Hook Form + Zod валидация + Server Actions для отправки

### БД (Prisma)
- Все денежные значения: `Decimal` (не Float!)
- Server-side: прямой Prisma клиент
- Client-side: Server Actions или API routes

## MVP Модули (порядок разработки)

0. Инфраструктура (Next.js, Prisma, shadcn) ✅
1. Auth (NextAuth, роли OWNER/TENANT, middleware) ✅
2. Объекты (CRUD квартир) ✅
3. Арендаторы (CRUD, Tenant Portal) — в процессе
4. Финансы (платежи, расходы, дашборд)
5. Заявки (система обращений)
6. Задачи + Документы
7. Аналитика + Финализация
