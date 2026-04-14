"use client";
import { useState } from "react";

const CATEGORIES = [
  { id: "books", label: "Книги" },
  { id: "games", label: "Видеоигры" },
  { id: "figures", label: "Фигурки" },
  { id: "boardgames", label: "Настолки" },
  { id: "movies_collection", label: "Кино — сборники" },
  { id: "movies_awards", label: "Кино — с наградами" },
  { id: "movies_extras", label: "Кино — доп. материалы" },
];

export default function Home() {
  const [text, setText] = useState("");
  const [template, setTemplate] = useState("books");
  const [results, setResults] = useState([]); // [{status, html, error}]
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);

  function splitProducts(raw) {
    return raw.split(/\*{3,}/).map(s => s.trim()).filter(Boolean);
  }

  async function generate() {
    const products = splitProducts(text);
    if (!products.length || loading) return;

    setLoading(true);
    setResults(products.map(() => ({ status: "pending", html: "", error: "" })));
    setProgress({ current: 0, total: products.length });

    for (let i = 0; i < products.length; i++) {
      setProgress({ current: i + 1, total: products.length });
      setResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: "loading" } : r));

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: products[i], template }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Ошибка сервера");
        setResults(prev => prev.map((r, idx) => idx === i ? { status: "done", html: data.html, error: "" } : r));
      } catch (e) {
        setResults(prev => prev.map((r, idx) => idx === i ? { status: "error", html: "", error: e.message } : r));
      }
    }
    setLoading(false);
  }

  function copyOne(idx) {
    const r = results[idx];
    if (!r?.html) return;
    navigator.clipboard.writeText(r.html).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    });
  }

  function copyAll() {
    const all = results.filter(r => r.html).map(r => r.html).join("\n\n<!-- *** -->\n\n");
    navigator.clipboard.writeText(all).then(() => {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    });
  }

  const productCount = splitProducts(text).length;
  const doneCount = results.filter(r => r.status === "done").length;

  const iframeSrc = (html) =>
    `data:text/html;charset=utf-8,${encodeURIComponent(
      `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;padding:16px;background:white;box-sizing:border-box}</style></head><body>${html}</body></html>`
    )}`;

  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg,#0f0f1a 0%,#141428 60%,#0a1628 100%)",
      fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "32px 16px", gap: "20px",
    }}>
      <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", letterSpacing: "5px", textTransform: "uppercase" }}>
        Product Card Studio
      </div>

      {/* Category keyboard */}
      <div style={{
        background: "#1a1a1e", borderRadius: "12px", padding: "14px 16px",
        display: "flex", flexWrap: "wrap", gap: "6px", maxWidth: "700px", justifyContent: "center",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 20px rgba(0,0,0,0.4)",
      }}>
        {CATEGORIES.map(cat => {
          const on = template === cat.id;
          return (
            <button key={cat.id} onClick={() => setTemplate(cat.id)} style={{
              background: on ? "#0f2a0f" : "#2c2c2e",
              border: `1px solid ${on ? "#30d158" : "#3a3a3c"}`,
              borderBottom: `2px solid ${on ? "#1a4a1a" : "#1a1a1c"}`,
              borderRadius: "6px", padding: "6px 14px", fontSize: "12px",
              color: on ? "#30d158" : "rgba(255,255,255,0.4)",
              cursor: "pointer", transition: "all .12s", whiteSpace: "nowrap",
              boxShadow: on ? "0 0 10px rgba(48,209,88,0.3)" : "none",
              textShadow: on ? "0 0 8px rgba(48,209,88,0.5)" : "none",
            }}>{cat.label}</button>
          );
        })}
      </div>

      {/* Input */}
      <div style={{ width: "100%", maxWidth: "1100px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase" }}>
            Исходный текст
          </div>
          <div style={{ color: "rgba(255,255,255,0.25)", fontSize: "11px" }}>
            {productCount > 1
              ? `${productCount} товара — разделены ***`
              : "разделяйте товары через ***"}
          </div>
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") generate(); }}
          placeholder={"Текст первого товара...\n\n***\n\nТекст второго товара...\n\n***\n\nТекст третьего товара...\n\nCtrl+Enter = генерировать"}
          style={{
            width: "100%", height: "220px", background: "#1a1a1e",
            border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px",
            color: "rgba(255,255,255,0.85)", fontFamily: "inherit", fontSize: "13px",
            padding: "16px", resize: "vertical", outline: "none", lineHeight: 1.6,
            boxSizing: "border-box",
          }}
        />

        <div style={{ display: "flex", gap: "12px", marginTop: "10px", alignItems: "center" }}>
          <button onClick={generate} disabled={loading || !text.trim()} style={{
            flex: 1, padding: "13px",
            background: loading ? "#1a3a1a" : "#0071e3",
            color: "white", border: "none", borderRadius: "10px",
            fontSize: "14px", fontWeight: 500, cursor: loading ? "wait" : "pointer",
            transition: "all .2s", opacity: !text.trim() ? 0.4 : 1,
          }}>
            {loading
              ? `Генерирую ${progress.current} из ${progress.total}...`
              : productCount > 1
                ? `Создать ${productCount} карточки`
                : "Создать карточку"}
          </button>

          {doneCount > 1 && (
            <button onClick={copyAll} style={{
              padding: "13px 20px", background: copiedAll ? "#30d158" : "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)", color: copiedAll ? "#fff" : "rgba(255,255,255,0.5)",
              borderRadius: "10px", fontSize: "13px", cursor: "pointer", whiteSpace: "nowrap",
            }}>
              {copiedAll ? "✓ Скопировано" : `Скопировать все (${doneCount})`}
            </button>
          )}
        </div>

        {/* Progress bar */}
        {loading && (
          <div style={{ marginTop: "10px", height: "3px", background: "rgba(255,255,255,0.08)", borderRadius: "2px", overflow: "hidden" }}>
            <div style={{
              height: "100%", background: "#0071e3", borderRadius: "2px",
              width: `${(progress.current / progress.total) * 100}%`,
              transition: "width 0.3s ease",
            }} />
          </div>
        )}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div style={{ width: "100%", maxWidth: "1100px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {results.map((r, i) => (
            <div key={i} style={{
              background: "#1a1a1e", borderRadius: "12px",
              border: `1px solid ${r.status === "done" ? "rgba(48,209,88,0.2)" : r.status === "error" ? "rgba(255,69,58,0.2)" : "rgba(255,255,255,0.06)"}`,
              overflow: "hidden",
            }}>
              {/* Card header */}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{
                    width: "6px", height: "6px", borderRadius: "50%",
                    background: r.status === "done" ? "#30d158" : r.status === "error" ? "#ff453a" : r.status === "loading" ? "#ff9f0a" : "rgba(255,255,255,0.2)",
                    animation: r.status === "loading" ? "dp 1s ease-in-out infinite" : "none",
                  }} />
                  Товар {i + 1}
                  {r.status === "loading" && <span style={{ color: "rgba(255,255,255,0.25)" }}>— генерирую...</span>}
                  {r.status === "done" && <span style={{ color: "rgba(48,209,88,0.6)" }}>— готово</span>}
                  {r.status === "error" && <span style={{ color: "rgba(255,69,58,0.7)" }}>— ошибка</span>}
                </div>
                {r.status === "done" && (
                  <button onClick={() => copyOne(i)} style={{
                    background: copiedIdx === i ? "#30d158" : "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: copiedIdx === i ? "#fff" : "rgba(255,255,255,0.4)",
                    borderRadius: "6px", padding: "3px 12px", fontSize: "11px", cursor: "pointer",
                  }}>
                    {copiedIdx === i ? "✓ Скопировано" : "Копировать HTML"}
                  </button>
                )}
              </div>

              {/* Card content */}
              {r.status === "loading" && (
                <div style={{ height: "80px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                  {[0,1,2].map(j => (
                    <div key={j} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#0071e3", animation: `dp 1.4s ease-in-out ${j*0.2}s infinite` }} />
                  ))}
                </div>
              )}
              {r.status === "pending" && (
                <div style={{ height: "50px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)" }}>ожидает...</span>
                </div>
              )}
              {r.status === "error" && (
                <div style={{ padding: "16px" }}>
                  <span style={{ fontSize: "12px", color: "#ff453a" }}>{r.error}</span>
                </div>
              )}
              {r.status === "done" && (
                <>
                  <iframe src={iframeSrc(r.html)} style={{ width: "100%", height: "300px", border: "none", display: "block" }} sandbox="allow-same-origin" />
                  <details>
                    <summary style={{ padding: "8px 16px", fontSize: "11px", color: "rgba(255,255,255,0.2)", cursor: "pointer", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                      Исходный HTML
                    </summary>
                    <pre style={{ margin: 0, padding: "12px 16px", fontSize: "10px", color: "rgba(255,255,255,0.4)", overflow: "auto", maxHeight: "150px", background: "#111" }}>{r.html}</pre>
                  </details>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes dp{0%,80%,100%{transform:scale(.6);opacity:.3}40%{transform:scale(1);opacity:1}}`}</style>
    </main>
  );
}
