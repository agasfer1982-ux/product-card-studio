import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const TEMPLATES = {

  books: `Ты — копирайтер интернет-магазина. Создай HTML-карточку книги. ТОЛЬКО HTML-фрагмент, инлайн-стили, без DOCTYPE/html/body/script/style.
Структура: 1. <h2> "Описание книги [НАЗВАНИЕ]:" — 18px, color:#1d1d1f, margin:0 0 12px. 2. Параграфы <p> — 14px, color:#3d3d3f, line-height:1.7, margin:0 0 10px.
Обёртка: <div style="font-family:-apple-system,sans-serif;max-width:700px;padding:0;background:white">
ТОЛЬКО HTML. БЕЗ ПОЯСНЕНИЙ.`,

  games: `Ты — копирайтер интернет-магазина. Создай HTML-карточку видеоигры. ТОЛЬКО HTML-фрагмент, инлайн-стили, без DOCTYPE/html/body/script/style.
Структура: 1. <h2> "Описание игры [НАЗВАНИЕ]:" — 18px #1d1d1f. 2. <p> описание — 14px #3d3d3f line-height:1.7. 3. <h2> "Особенности игры [НАЗВАНИЕ]:" затем <ul><li style="margin-bottom:6px">. 4. <h2> "Комплектация:" затем <ul><li style="margin-bottom:6px">.
Обёртка: <div style="font-family:-apple-system,sans-serif;max-width:700px;padding:0;background:white">
ТОЛЬКО HTML. БЕЗ ПОЯСНЕНИЙ.`,

  figures: `Ты — копирайтер интернет-магазина. Создай HTML-карточку коллекционной фигурки. ТОЛЬКО HTML-фрагмент, инлайн-стили, без DOCTYPE/html/body/script/style.
Структура: 1. <p> описание — 14px #3d3d3f line-height:1.7 margin:0 0 10px. 2. <h2> "Характеристики:" — 18px #1d1d1f margin:12px 0 8px. 3. <ul><li style="margin-bottom:6px"> характеристики.
Обёртка: <div style="font-family:-apple-system,sans-serif;max-width:700px;padding:0;background:white">
ТОЛЬКО HTML. БЕЗ ПОЯСНЕНИЙ.`,

  boardgames: `Ты — копирайтер интернет-магазина. Создай HTML-карточку настольной игры. ТОЛЬКО HTML-фрагмент, инлайн-стили, без DOCTYPE/html/body/script/style.
Структура: 1. <p> описание. 2. <p><b>Как играть?</b></p> и параграфы. 3. <p><b>Кто победил?</b></p> и параграфы. 4. <h2> "Комплектация:" и <ul><li style="margin-bottom:6px">. 5. <h2> "Характеристики:" и <ul><li style="margin-bottom:6px">. Все <p> — 14px #3d3d3f line-height:1.7 margin:0 0 10px. <h2> — 18px #1d1d1f margin:12px 0 8px.
Обёртка: <div style="font-family:-apple-system,sans-serif;max-width:700px;padding:0;background:white">
ТОЛЬКО HTML. БЕЗ ПОЯСНЕНИЙ.`,

  movies_collection: `Ты — копирайтер интернет-магазина. Создай HTML-карточку сборника фильмов. ТОЛЬКО HTML-фрагмент, инлайн-стили, без DOCTYPE/html/body/script/style.
Структура: 1. Красный дисклеймер если есть: <p><span style="color:#ff0000">текст</span></p>. 2. <h2> "Описание сборника [НАЗВАНИЕ]:". 3. <p> описание. 4. <h2> "Содержание сборника [НАЗВАНИЕ]:". 5. Для каждого фильма: <p><b>Название фильма</b><br>год, мин.<br><b>Режиссер:</b>...<br><b>Звук:</b>...<br><b>Субтитры:</b>...</p> затем <p> описание. 6. Награды если есть: <h2> "Награды и номинации:" и <ul> вложенный. 7. <h2> "Технические характеристики:" и <ul><li style="margin-bottom:6px">. Все <p> — 14px #3d3d3f line-height:1.7 margin:0 0 10px. <h2> — 18px #1d1d1f margin:12px 0 8px.
Обёртка: <div style="font-family:-apple-system,sans-serif;max-width:700px;padding:0;background:white">
ТОЛЬКО HTML. БЕЗ ПОЯСНЕНИЙ.`,

  movies_awards: `Ты — копирайтер интернет-магазина. Создай HTML-карточку фильма с наградами. ТОЛЬКО HTML-фрагмент, инлайн-стили, без DOCTYPE/html/body/script/style.
Структура: 1. <h2> "Описание фильма [НАЗВАНИЕ]:". 2. <p> описание. 3. <h2> "Награды и номинации фильма [НАЗВАНИЕ]:". 4. <ul> с наградами — <li style="margin-bottom:6px"><b>Премия</b> (год)</li> с вложенным <ul> для номинаций. 5. Доп. материалы если есть: <h2> и <ul>. 6. <h2> "Технические характеристики:" и <ul><li style="margin-bottom:6px">. Все <p> — 14px #3d3d3f line-height:1.7. <h2> — 18px #1d1d1f margin:12px 0 8px.
Обёртка: <div style="font-family:-apple-system,sans-serif;max-width:700px;padding:0;background:white">
ТОЛЬКО HTML. БЕЗ ПОЯСНЕНИЙ.`,

  movies_extras: `Ты — копирайтер интернет-магазина. Создай HTML-карточку фильма с дополнительными материалами. ТОЛЬКО HTML-фрагмент, инлайн-стили, без DOCTYPE/html/body/script/style.
Структура: 1. <h2> "Описание фильма [НАЗВАНИЕ]:". 2. <p> описание — 14px #3d3d3f line-height:1.7 margin:0 0 10px. 3. <h2> "Дополнительные материалы к фильму [НАЗВАНИЕ]:". 4. <ul><li style="margin-bottom:8px"> список материалов.
Обёртка: <div style="font-family:-apple-system,sans-serif;max-width:700px;padding:0;background:white">
ТОЛЬКО HTML. БЕЗ ПОЯСНЕНИЙ.`,
};

export async function POST(req) {
  try {
    const { text, template } = await req.json();
    if (!text?.trim()) return Response.json({ error: "Нет текста" }, { status: 400 });

    const systemPrompt = TEMPLATES[template] || TEMPLATES.books;

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 2000,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
    });

    let html = completion.choices[0]?.message?.content || "";
    html = html.replace(/^```html?\s*/i, "").replace(/\s*```$/i, "").trim();

    return Response.json({ html });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
