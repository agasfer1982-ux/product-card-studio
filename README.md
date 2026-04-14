# Product Card Studio

Веб-приложение для генерации HTML-карточек товаров через Claude AI.

## Деплой на Vercel (5 минут)

### 1. Загрузи проект на GitHub
- Зайди на github.com → New repository → назови `product-card-studio`
- Загрузи все файлы этой папки

### 2. Задеплой на Vercel
- Зайди на vercel.com → Add New Project
- Выбери свой репозиторий с GitHub
- Нажми Deploy (настройки менять не нужно)

### 3. Добавь API ключ
- В Vercel → Settings → Environment Variables
- Добавь: `ANTHROPIC_API_KEY` = твой ключ `sk-ant-api03-...`
- Нажми Redeploy

Готово! Получишь ссылку вида `product-card-studio.vercel.app` — её можно давать всем.

## Локальный запуск

```bash
npm install
cp .env.local.example .env.local
# вставь свой ключ в .env.local
npm run dev
```

Открой http://localhost:3000

## Как добавить свои шаблоны

Открой `app/api/generate/route.js` и добавь в объект `TEMPLATES`:

```js
мой_шаблон: `Ты копирайтер. Создай карточку... ТОЛЬКО HTML. Категория: {CAT}. ...`
```

Затем в `app/page.js` добавь в массив `TEMPLATES`:
```js
{ id: "мой_шаблон", label: "Мой шаблон" }
```
