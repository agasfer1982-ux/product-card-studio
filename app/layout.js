export const metadata = { title: "Product Card Studio" };
export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body style={{ margin: 0, padding: 0, background: "#0f0f1a" }}>{children}</body>
    </html>
  );
}
