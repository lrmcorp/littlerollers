import './globals.css';
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <div className="shell">
          <nav className="nav" aria-label="Navigasi utama">
            <strong>Daily Dose</strong>
            <a href="/">Beranda</a>
            <a href="/health">Status sistem</a>
          </nav>
          <main className="content">{children}</main>
        </div>
      </body>
    </html>
  );
}
