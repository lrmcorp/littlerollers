const classes = [
  {
    number: '01',
    title: 'Private Class',
    description: 'Sesi personal 50 menit dengan perhatian penuh pada kebutuhan gerak Anda.',
    note: 'Fokus individual',
  },
  {
    number: '02',
    title: 'Semi Private Class',
    description: 'Berlatih bersama 2–4 orang dengan suasana intim dan arahan yang tetap terjaga.',
    note: '2–4 peserta',
  },
  {
    number: '03',
    title: 'Private Group',
    description: 'Pengalaman reformer bersama grup pilihan Anda dalam sesi yang terstruktur.',
    note: 'Reformer group',
  },
];

const locations = [
  ['Green Garden', 'Jakarta Barat'],
  ['Muara Karang', 'Jakarta Utara'],
  ['Graha Family', 'Surabaya Barat'],
  ['Universitas Tarumanagara', 'Kampus 2'],
  ['Orange Groves', 'PIK 2'],
];

function BrandMark() {
  return (
    <a className="public-brand" href="#top" aria-label="Daily Dose Pilates — kembali ke atas">
      <img
        src="https://dailydosepilates.com/assets/images/logo.png"
        width="500"
        height="138"
        alt="Daily Dose Pilates"
      />
    </a>
  );
}

export function PublicLanding() {
  return (
    <div className="public-site" id="top">
      <a className="skip-link" href="#public-main">
        Langsung ke konten utama
      </a>
      <header className="public-header">
        <BrandMark />
        <nav className="public-nav" aria-label="Navigasi publik">
          <a href="#classes">Kelas</a>
          <a href="#approach">Pendekatan</a>
          <a href="#locations">Lokasi</a>
          <a href="#contact">Kontak</a>
        </nav>
        <a className="public-header-cta" href="/sign-in">
          Masuk / Registrasi
        </a>
      </header>

      <main id="public-main">
        <section className="public-hero" aria-labelledby="public-hero-title">
          <div className="public-hero-copy">
            <p className="public-kicker">Mindful movement · Everyday strength</p>
            <h1 id="public-hero-title">Gerak yang terasa baik, untuk hidup yang lebih seimbang.</h1>
            <p className="public-hero-lead">
              Ruang Pilates yang tenang untuk membangun kekuatan, kontrol, dan koneksi dengan tubuh
              Anda—satu sesi pada satu waktu.
            </p>
            <div className="public-actions">
              <a className="public-button public-button-primary" href="#classes">
                Temukan kelas
              </a>
              <a className="public-button public-button-quiet" href="#locations">
                Pilih studio
              </a>
            </div>
            <dl className="public-hero-facts" aria-label="Ringkasan Daily Dose Pilates">
              <div>
                <dt>Format</dt>
                <dd>Private & group</dd>
              </div>
              <div>
                <dt>Durasi</dt>
                <dd>50 menit</dd>
              </div>
              <div>
                <dt>Studio</dt>
                <dd>Jakarta & Surabaya</dd>
              </div>
            </dl>
          </div>
          <div className="public-hero-art" aria-label="Ruang untuk bergerak dengan tenang">
            <div className="public-hero-orbit" aria-hidden="true" />
            <div className="public-hero-figure" aria-hidden="true">
              <span className="figure-head" />
              <span className="figure-body" />
              <span className="figure-arm" />
              <span className="figure-leg" />
            </div>
            <div className="public-hero-note">
              <span>Daily practice</span>
              <strong>Move with intention.</strong>
            </div>
          </div>
        </section>

        <section className="public-manifesto" id="approach" aria-labelledby="approach-title">
          <p className="public-section-index">01 — Pendekatan kami</p>
          <div>
            <h2 id="approach-title">
              Bukan tentang bergerak lebih banyak. Tentang bergerak lebih baik.
            </h2>
            <p>
              Setiap sesi dirancang untuk membantu Anda hadir, memahami pola gerak, dan berkembang
              dalam ritme yang terasa tepat. Terarah tanpa terburu-buru, menantang tanpa kehilangan
              kendali.
            </p>
          </div>
          <div className="public-principles" aria-label="Prinsip latihan">
            <span>01 · Control</span>
            <span>02 · Alignment</span>
            <span>03 · Consistency</span>
          </div>
        </section>

        <section className="public-classes" id="classes" aria-labelledby="classes-title">
          <div className="public-section-heading">
            <div>
              <p className="public-section-index">02 — Pilih pengalaman Anda</p>
              <h2 id="classes-title">Kelas untuk cara bergerak yang berbeda.</h2>
            </div>
            <p>Mulai dari perhatian personal hingga energi bersama kelompok kecil.</p>
          </div>
          <div className="public-class-grid">
            {classes.map((item) => (
              <article className="public-class-card" key={item.title}>
                <span className="public-class-number">{item.number}</span>
                <div>
                  <p>{item.note}</p>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
                <a href="/sign-in" aria-label={`Masuk untuk melihat ${item.title}`}>
                  Lihat kelas <span aria-hidden="true">↗</span>
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="public-ritual" aria-labelledby="ritual-title">
          <div className="public-ritual-visual" aria-hidden="true">
            <span>inhale</span>
            <i />
            <span>exhale</span>
          </div>
          <div className="public-ritual-copy">
            <p className="public-section-index">03 — Your daily ritual</p>
            <h2 id="ritual-title">Sediakan waktu untuk tubuh Anda.</h2>
            <p>
              Datang apa adanya. Instructor membantu Anda menemukan intensitas yang tepat, sementara
              studio memberi ruang untuk fokus sepenuhnya pada setiap napas dan gerakan.
            </p>
            <a className="public-text-link" href="/sign-in">
              Mulai perjalanan Anda <span aria-hidden="true">→</span>
            </a>
          </div>
        </section>

        <section className="public-locations" id="locations" aria-labelledby="locations-title">
          <div className="public-section-heading">
            <div>
              <p className="public-section-index">04 — Temukan studio</p>
              <h2 id="locations-title">Daily Dose, lebih dekat dengan rutinitas Anda.</h2>
            </div>
            <p>Pilih lokasi sebelum melihat jadwal dan ketersediaan kelas.</p>
          </div>
          <div className="public-location-list">
            {locations.map(([name, area], index) => (
              <article key={name}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{name}</h3>
                <p>{area}</p>
                <a href="/sign-in" aria-label={`Pilih lokasi ${name}`}>
                  Pilih studio →
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="public-quote" aria-label="Filosofi Daily Dose Pilates">
          <blockquote>
            “Consistency is not perfection. It is choosing to return to yourself.”
          </blockquote>
          <p>Daily Dose Pilates</p>
        </section>

        <section className="public-final-cta" id="contact" aria-labelledby="final-cta-title">
          <div>
            <p className="public-section-index">Your next session</p>
            <h2 id="final-cta-title">Mulai dari satu gerakan yang terasa tepat.</h2>
          </div>
          <div>
            <p>Temukan kelas dan studio yang sesuai dengan ritme Anda.</p>
            <a className="public-button public-button-light" href="/sign-in">
              Book your Daily Dose
            </a>
          </div>
        </section>
      </main>

      <footer className="public-footer">
        <BrandMark />
        <div>
          <strong>Explore</strong>
          <a href="#classes">Kelas</a>
          <a href="#locations">Lokasi</a>
          <a href="/sign-in">Masuk / Registrasi</a>
        </div>
        <div>
          <strong>Support</strong>
          <a href="https://dailydosepilates.com/contact-us" target="_blank" rel="noreferrer">
            Contact us
          </a>
          <a href="/health">Status sistem</a>
        </div>
        <p>© {new Date().getFullYear()} Daily Dose Pilates</p>
      </footer>
    </div>
  );
}
