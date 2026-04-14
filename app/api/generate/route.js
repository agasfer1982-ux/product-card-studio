import Groq from "groq-sdk";
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const TEMPLATES = {
  standard: `Ты — копирайтер интернет-магазина. Создай HTML-карточку товара по тексту пользователя.
Верни ТОЛЬКО чистый HTML-фрагмент (без DOCTYPE, html, body, head, script, style тегов). Только инлайн-стили. Категория: {CAT}.
Структура: название h2 16px #1d1d1f, цена span 20px 600 #0071e3, описание p 13px #6e6e73, характеристики ul 12px, кнопка background:#0071e3 color:white border:none padding:10px 20px border-radius:8px font-size:14px cursor:pointer margin-top:12px width:100%.
Обёртка: <div style="font-family:-apple-system,sans-serif;max-width:320px;padding:16px;background:white;border-radius:12px;border:1px solid #e5e5ea;box-shadow:0 2px 8px rgba(0,0,0,0.06)">`,

  premium: `Создай роскошную HTML-карточку товара. ТОЛЬКО HTML-фрагмент, инлайн-стили. Категория: {CAT}.
Тёмный #0a0a0a, золото #c9a84c, Georgia. Название h2 color:#c9a84c border-bottom:1px solid #1a1a1a. Цена 22px white. Описание #aaa 13px. Список border-left:2px solid #c9a84c padding-left:12px color:#888. Кнопка border:1px solid #c9a84c color:#c9a84c background:transparent padding:12px letter-spacing:2px text-transform:uppercase width:100%.
Обёртка: <div style="font-family:Georgia,serif;max-width:320px;padding:24px;background:#0a0a0a;border-radius:4px;border:1px solid #1a1a1a">`,

  minimal: `Минималистичная HTML-карточка. ТОЛЬКО HTML-фрагмент, инлайн-стили. Категория: {CAT}.
Helvetica, белый. Категория 10px #999 letter-spacing:3px uppercase. Название 18px 400 #000. Цена 24px. Описание 13px #555 border-top:1px solid #eee padding-top:12px. Кнопка background:black color:white 12px letter-spacing:1px width:100% padding:12px.
Обёртка: <div style="font-family:Helvetica,Arial,sans-serif;max-width:300px;padding:20px;background:white">`,

  tech: `HTML-карточка tech-товара. ТОЛЬКО HTML-фрагмент, инлайн-стили. Категория: {CAT}.
Тёмный #111 акцент #00d4ff. Бейдж background:#00d4ff22 color:#00d4ff border:1px solid #00d4ff44 10px. Название #fff 16px. Цена #00d4ff 20px 600. Характеристики monospace 11px #7af list-style:none, li: border-bottom:1px solid #222 display:flex justify-content:space-between. Кнопка background:linear-gradient(135deg,#00d4ff,#0066ff) white border:none border-radius:6px width:100%.
Обёртка: <div style="font-family:monospace;max-width:320px;padding:16px;background:#111;border-radius:10px;border:1px solid #00d4ff33">`,

  clothes: `HTML-карточка одежды/обуви. ТОЛЬКО HTML-фрагмент, инлайн-стили. Категория: {CAT}.
#fafaf8 акцент #d4715a. Тег italic #d4715a 12px. Название 17px 500 #2d2d2d. Цена+зачёркнутая. Размеры: кнопки border:1px solid #ddd 11px margin:2px. Описание 13px #666. Состав 11px #999. Кнопка background:#2d2d2d color:#fafaf8 width:100% padding:12px.
Обёртка: <div style="font-family:Georgia,serif;max-width:300px;padding:20px;background:#fafaf8;border-radius:8px">`,

  food: `HTML-карточка продукта питания. ТОЛЬКО HTML-фрагмент, инлайн-стили. Категория: {CAT}.
Зелёные акценты. Бейдж органик: #e8f5e9 #2e7d32 border-radius:20px. Название 16px #1b1b1b. Вес 12px #888. Цена #e65100 20px 600. КБЖУ grid 4 колонки text-align:center. Кнопка background:#388e3c white border-radius:8px width:100%.
Обёртка: <div style="font-family:-apple-system,sans-serif;max-width:300px;padding:16px;background:white;border-radius:10px;border:1px solid #e8f5e9">`,
};

const CAT_NAMES = {
  "": "любая", electronics: "электроника", clothes: "одежда", shoes: "обувь",
  sports: "спорт", home: "дом", beauty: "красота", food: "продукты",
  kids: "детское", auto: "авто", books: "книги", jewelry: "украшения",
  garden: "сад", pets: "питомцы", health: "здоровье",
};

export async function POST(req) {
  try {
    const { text, template, category } = await req.json();
    if (!text?.trim()) return Response.json({ error: "Нет текста" }, { status: 400 });

    const tpl = TEMPLATES[template] || TEMPLATES.standard;
    const catName = CAT_NAMES[category] || "любая";
    const systemPrompt = tpl.replace("{CAT}", catName);

const completion = await client.chat.completions.create({
  model: "llama-3.3-70b-versatile",
  max_tokens: 1500,
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: text }
  ],
});
let html = completion.choices[0]?.message?.content || "";
html = html.replace(/^```html?\s*/i, "").replace(/\s*```$/i, "").trim();

    let html = message.content[0]?.text || "";
    html = html.replace(/^```html?\s*/i, "").replace(/\s*```$/i, "").trim();

    return Response.json({ html });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
