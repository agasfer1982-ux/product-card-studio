import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const TEMPLATES = {
  standard: `Ты — копирайтер интернет-магазина. Создай HTML-карточку товара. ТОЛЬКО HTML-фрагмент, инлайн-стили. Категория: {CAT}. Название h2 16px #1d1d1f, цена 20px 600 #0071e3, описание p 13px #6e6e73, характеристики ul 12px, кнопка background:#0071e3 color:white border:none padding:10px border-radius:8px width:100%. Обёртка: <div style="font-family:-apple-system,sans-serif;max-width:320px;padding:16px;background:white;border-radius:12px;border:1px solid #e5e5ea">`,
  premium: `Создай роскошную HTML-карточку. ТОЛЬКО HTML-фрагмент, инлайн-стили. Категория: {CAT}. Тёмный #0a0a0a, золото #c9a84c, Georgia. Обёртка: <div style="font-family:Georgia,serif;max-width:320px;padding:24px;background:#0a0a0a;border-radius:4px;border:1px solid #1a1a1a">`,
  minimal: `Минималистичная HTML-карточка. ТОЛЬКО HTML-фрагмент, инлайн-стили. Категория: {CAT}. Helvetica, белый. Обёртка: <div style="font-family:Helvetica,Arial,sans-serif;max-width:300px;padding:20px;background:white">`,
  tech: `HTML-карточка tech-товара. ТОЛЬКО HTML-фрагмент, инлайн-стили. Категория: {CAT}. Тёмный #111 акцент #00d4ff. Обёртка: <div style="font-family:monospace;max-width:320px;padding:16px;background:#111;border-radius:10px;border:1px solid #00d4ff33">`,
  clothes: `HTML-карточка одежды. ТОЛЬКО HTML-фрагмент, инлайн-стили. Категория: {CAT}. #fafaf8 акцент #d4715a. Обёртка: <div style="font-family:Georgia,serif;max-width:300px;padding:20px;background:#fafaf8;border-radius:8px">`,
  food: `HTML-карточка продукта питания. ТОЛЬКО HTML-фрагмент, инлайн-стили. Категория: {CAT}. Зелёные акценты. Обёртка: <div style="font-family:-apple-system,sans-serif;max-width:300px;padding:16px;background:white;border-radius:10px;border:1px solid #e8f5e9">`,
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

    return Response.json({ html });
  } catch (e) {
    console.error(e);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
