import './globals.css';
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <div className="shell">
          <nav className="nav" aria-label="Navigasi utama">
            <a href="/" aria-label="Daily Dose Pilates — Beranda">
              <img
                className="brand-logo"
                src="https://dailydosepilates.com/assets/images/logo.png"
                width="500"
                height="138"
                alt="Daily Dose Pilates"
              />
            </a>
            <a href="/">Beranda</a>
            <a href="/health">Status sistem</a>
            <a href="/assignments">Assignment</a>
          </nav>
          <main className="content">{children}</main>
        </div>
      </body>
    </html>
  );
}
