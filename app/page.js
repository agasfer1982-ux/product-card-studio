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
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function generate() {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError("");
    setHtml("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, template }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка сервера");
      setHtml(data.html);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function copyHtml() {
    navigator.clipboard.writeText(html).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const iframeSrc = html
    ? `data:text/html;charset=utf-8,${encodeURIComponent(
        `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;padding:20px;background:white;box-sizing:border-box}</style></head><body>${html}</body></html>`
      )}`
    : null;

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
            }}>
              {cat.label}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", justifyContent: "center", width: "100%", maxWidth: "1100px" }}>
        <div style={{ flex: "1 1 380px", minWidth: 0 }}>
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "8px" }}>
            Исходный текст
          </div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") generate(); }}
            placeholder={"Вставьте сюда исходный текст карточки товара.\n\nCtrl+Enter = генерировать"}
            style={{
              width: "100%", height: "320px", background: "#1a1a1e",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px",
              color: "rgba(255,255,255,0.85)", fontFamily: "inherit", fontSize: "13px",
              padding: "16px", resize: "vertical", outline: "none", lineHeight: 1.6,
              boxSizing: "border-box",
            }}
          />
          <button onClick={generate} disabled={loading || !text.trim()} style={{
            marginTop: "10px", width: "100%", padding: "13px",
            background: loading ? "#1a3a1a" : "#0071e3",
            color: "white", border: "none", borderRadius: "10px",
            fontSize: "14px", fontWeight: 500, cursor: loading ? "wait" : "pointer",
            transition: "all .2s", opacity: !text.trim() ? 0.4 : 1,
          }}>
            {loading ? "Генерирую..." : "Создать карточку"}
          </button>
          <div style={{ marginTop: "6px", color: "rgba(255,255,255,0.2)", fontSize: "11px", textAlign: "center" }}>или Ctrl+Enter</div>
        </div>

        <div style={{ flex: "1 1 380px", minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase" }}>Результат</div>
            {html && (
              <button onClick={copyHtml} style={{
                background: copied ? "#30d158" : "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: copied ? "#fff" : "rgba(255,255,255,0.5)",
                borderRadius: "8px", padding: "4px 14px", fontSize: "11px",
                cursor: "pointer", transition: "all .2s",
              }}>
                {copied ? "✓ Скопировано" : "Копировать HTML"}
              </button>
            )}
          </div>
          <div style={{
            height: "320px", background: "#1a1a1e",
            border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px",
            overflow: "hidden",
          }}>
            {!html && !loading && !error && (
              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>Здесь появится готовая карточка</div>
              </div>
            )}
            {loading && (
              <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "14px" }}>
                <div style={{ display: "flex", gap: "6px" }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#0071e3", animation: `dp 1.4s ease-in-out ${i*0.2}s infinite` }} />
                  ))}
                </div>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>Создаю карточку...</div>
              </div>
            )}
            {error && <div style={{ padding: "20px" }}><div style={{ color: "#ff453a", fontSize: "13px", fontWeight: 600 }}>Ошибка</div><div style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", marginTop: "6px" }}>{error}</div></div>}
            {html && iframeSrc && <iframe src={iframeSrc} style={{ width: "100%", height: "100%", border: "none" }} sandbox="allow-same-origin" />}
          </div>
          {html && (
            <details style={{ marginTop: "10px" }}>
              <summary style={{ color: "rgba(255,255,255,0.25)", fontSize: "11px", cursor: "pointer" }}>Исходный HTML</summary>
              <pre style={{ marginTop: "8px", background: "#1a1a1e", borderRadius: "8px", padding: "12px", fontSize: "10px", color: "rgba(255,255,255,0.5)", overflow: "auto", maxHeight: "200px", border: "1px solid rgba(255,255,255,0.06)" }}>{html}</pre>
            </details>
          )}
        </div>
      </div>
      <style>{`@keyframes dp{0%,80%,100%{transform:scale(.6);opacity:.3}40%{transform:scale(1);opacity:1}}`}</style>
    </main>
  );
}
