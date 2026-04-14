import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const TEMPLATES = {

  books: `Ты — копирайтер интернет-магазина. Оформи текст о книге в HTML. ТОЛЬКО чистые теги без div и классов: h2, p, ul, li. Никаких инлайн-стилей кроме style="margin-bottom:6px" у li.
Структура: <h2>Описание книги НАЗВАНИЕ:</h2> затем <p> параграфы.
ТОЛЬКО HTML-теги. БЕЗ ПОЯСНЕНИЙ.`,

  games: `Ты — копирайтер интернет-магазина. Оформи текст об игре в HTML. ТОЛЬКО чистые теги без div и классов: h2, p, ul, li. Никаких инлайн-стилей кроме style="margin-bottom:6px" у li.
Структура: <h2>Описание игры НАЗВАНИЕ:</h2> затем <p>, если есть особенности — <h2>Особенности игры НАЗВАНИЕ:</h2> и <ul><li style="margin-bottom:6px">, если есть комплектация — <h2>Комплектация:</h2> и <ul><li style="margin-bottom:6px">.
ТОЛЬКО HTML-теги. БЕЗ ПОЯСНЕНИЙ.`,

  figures: `Ты — копирайтер интернет-магазина. Оформи текст о фигурке в HTML. ТОЛЬКО чистые теги без div и классов: h2, p, ul, li. Никаких инлайн-стилей кроме style="margin-bottom:6px" у li.
Структура: <p> параграфы описания, затем <h2>Характеристики:</h2> и <ul><li style="margin-bottom:6px">.
ТОЛЬКО HTML-теги. БЕЗ ПОЯСНЕНИЙ.`,

  boardgames: `Ты — копирайтер интернет-магазина. Оформи текст о настольной игре в HTML. ТОЛЬКО чистые теги без div и классов: h2, p, ul, li, b. Никаких инлайн-стилей кроме style="margin-bottom:6px" у li.
Структура: <p> описание, <p><b>Как играть?</b></p> и параграфы, <p><b>Кто победил?</b></p> и параграфы, <h2>Комплектация:</h2> и <ul><li style="margin-bottom:6px">, <h2>Характеристики:</h2> и <ul><li style="margin-bottom:6px">.
ТОЛЬКО HTML-теги. БЕЗ ПОЯСНЕНИЙ.`,

  movies_collection: `Ты — копирайтер интернет-магазина. Оформи текст о сборнике фильмов в HTML. ТОЛЬКО чистые теги без div и классов: h2, p, ul, li, b, span. Никаких инлайн-стилей кроме style="margin-bottom:6px" у li и color:#ff0000 для дисклеймера.
Структура: если есть дисклеймер — <p><span style="color:#ff0000">текст</span></p>, затем <h2>Описание сборника НАЗВАНИЕ:</h2> и <p>, затем <h2>Содержание сборника НАЗВАНИЕ:</h2>, для каждого фильма <p><b>Название</b><br>год, мин.<br><b>Режиссер:</b>...<br><b>Звук:</b>...<br><b>Субтитры:</b>...</p> и <p> описание, если есть награды — <h2>Награды и номинации НАЗВАНИЕ:</h2> и вложенные <ul><li style="margin-bottom:6px">, затем <h2>Технические характеристики:</h2> и <ul><li style="margin-bottom:6px">.
ТОЛЬКО HTML-теги. БЕЗ ПОЯСНЕНИЙ.`,

  movies_awards: `Ты — копирайтер интернет-магазина. Оформи текст о фильме в HTML. ТОЛЬКО чистые теги без div и классов: h2, p, ul, li, b. Никаких инлайн-стилей кроме style="margin-bottom:6px" у li.
Структура: <h2>Описание фильма НАЗВАНИЕ:</h2> и <p>, затем <h2>Награды и номинации фильма НАЗВАНИЕ:</h2> и <ul><li style="margin-bottom:6px"><b>Премия</b> (год)</li> с вложенным <ul> для номинаций, если есть доп. материалы — <h2>Дополнительные материалы:</h2> и <ul><li style="margin-bottom:6px">, затем <h2>Технические характеристики:</h2> и <ul><li style="margin-bottom:6px">.
ТОЛЬКО HTML-теги. БЕЗ ПОЯСНЕНИЙ.`,

  movies_extras: `Ты — копирайтер интернет-магазина. Оформи текст о фильме в HTML. ТОЛЬКО чистые теги без div и классов: h2, p, ul, li. Никаких инлайн-стилей кроме style="margin-bottom:6px" у li.
Структура: <h2>Описание фильма НАЗВАНИЕ:</h2> и <p>, затем <h2>Дополнительные материалы к фильму НАЗВАНИЕ:</h2> и <ul><li style="margin-bottom:8px">.
ТОЛЬКО HTML-теги. БЕЗ ПОЯСНЕНИЙ.`,

  music: `Ты — копирайтер интернет-магазина. Оформи текст о музыкальном релизе в HTML. ТОЛЬКО чистые теги без div и классов. Никаких инлайн-стилей кроме style="margin-bottom:6px" у li и style="margin-bottom:12px" у последнего li каждой секции треклиста.

Правила оформления:
1. Если есть дисклеймер заглавными буквами в начале — оставь его первым элементом в <p>.
2. Все параграфы описания — просто <p>.
3. Если есть формат/упаковка/количество треков — <p><b>Формат: ...</b><br><b>Упаковка: ...</b><br><b>Треков: ...</b></p>
4. Треклист всегда начинается с <p><b>Треклист:</b></p>
5. Структура треклиста — определи по содержимому:
   - Один диск без сторон → просто <ol><li style="margin-bottom:6px">трек</li>...</ol>
   - LP1 / LP2 (или CD1 / CD2) → <p><b>LP 1</b></p><ol>...(последний li margin-bottom:12px)</ol><p><b>LP 2</b></p><ol>...</ol>
   - LP с подзаголовком → <p><b>LP 2: (Demos)</b></p><ol>...</ol>
   - Side A / Side B → <ul><li style="margin-bottom:6px">Side A:</li><ol><li style="margin-bottom:6px">трек</li>...</ol><li style="margin-bottom:6px">Side B:</li><ol>...</ol></ul>
   - Стороны A1/A2.../B1/B2... в одном списке → один <ol> где каждый трек содержит A1./B1. в тексте

ТОЛЬКО HTML-теги. БЕЗ ПОЯСНЕНИЙ.`,
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
