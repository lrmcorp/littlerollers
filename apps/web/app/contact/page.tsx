import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ExternalLink, MessageCircle } from 'lucide-react';
import { PublicFooter } from '../components/public/public-footer';
import { PublicHeader } from '../components/public/public-header';
import { PublicPageHero, PublicSectionHeading } from '../components/public/public-page';
import { publicContainer } from '../components/public/public-styles';

export const metadata: Metadata = {
  title: 'Hubungi Kami',
  description: 'Hubungi tim Daily Dose Pilates untuk bantuan kelas, paket, dan kunjungan studio.',
};

export default function ContactPage() {
  return (
    <div className="min-w-0 overflow-x-clip bg-dd-cream font-sans text-dd-ink">
      <a className="skip-link" href="#contact-main">
        Langsung ke kontak
      </a>
      <PublicHeader />
      <main id="contact-main">
        <PublicPageHero
          eyebrow="Kami siap membantu"
          title="Ada yang ingin Anda tanyakan?"
          description="Tim Daily Dose siap membantu memilih kelas, paket, atau studio yang sesuai dengan kebutuhan Anda."
        />
        <section className="py-12 sm:py-16" aria-labelledby="contact-options-title">
          <div className={publicContainer}>
            <PublicSectionHeading
              eyebrow="01 — Pilih kebutuhan"
              title="Mulai dari jalur yang tepat."
              titleId="contact-options-title"
              description="Pilih kebutuhan Anda agar kami dapat mengarahkan ke informasi yang relevan."
            />
            <div className="grid gap-5 md:grid-cols-3">
              <article className="rounded-dd-lg border border-dd-line bg-white p-6 shadow-dd-card">
                <span className="text-xs font-bold text-dd-brass">01</span>
                <h3 className="mt-3 font-sans text-2xl font-semibold">Jadwal kelas</h3>
                <p className="mt-3 min-h-16 leading-7 text-dd-muted">
                  Lihat jadwal publik yang tersedia menurut studio dan zona waktunya.
                </p>
                <Link className="mt-5 inline-flex items-center gap-1.5 font-bold text-dd-forest hover:underline" href="/classes">
                  <span>Jelajahi jadwal</span>
                  <ArrowRight className="size-4" />
                </Link>
              </article>
              <article className="rounded-dd-lg border border-dd-line bg-white p-6 shadow-dd-card">
                <span className="text-xs font-bold text-dd-brass">02</span>
                <h3 className="mt-3 font-sans text-2xl font-semibold">Paket Pilates</h3>
                <p className="mt-3 min-h-16 leading-7 text-dd-muted">
                  Bandingkan paket aktif, jumlah sesi, harga, dan masa berlaku.
                </p>
                <Link className="mt-5 inline-flex items-center gap-1.5 font-bold text-dd-forest hover:underline" href="/packages">
                  <span>Jelajahi paket</span>
                  <ArrowRight className="size-4" />
                </Link>
              </article>
              <article className="rounded-dd-lg border border-dd-line bg-white p-6 shadow-dd-card">
                <span className="text-xs font-bold text-dd-brass">03</span>
                <h3 className="mt-3 font-sans text-2xl font-semibold">Bantuan & Kontak</h3>
                <p className="mt-3 min-h-16 leading-7 text-dd-muted">
                  Hubungi kami langsung melalui WhatsApp studio atau kanal kontak resmi Daily Dose Pilates.
                </p>
                <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:items-center">
                  <a
                    className="inline-flex items-center justify-center gap-2 rounded-dd-md bg-[#1f8f5f] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#18754e] shadow-sm"
                    href={`https://wa.me/${process.env.NEXT_PUBLIC_OFFICIAL_WHATSAPP || '62895329736127'}?text=Halo%20Daily%20Dose%20Pilates,%20saya%20ingin%20bertanya%20seputar%20kelas%20dan%20paket%20studio`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="size-4" />
                    <span>Chat WhatsApp CS</span>
                  </a>
                  <Link
                    className="inline-flex items-center gap-1.5 font-bold text-dd-forest hover:underline text-sm"
                    href="/locations"
                  >
                    <span>Lihat kontak per studio</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </article>
            </div>
            <div className="mt-8 rounded-dd-lg border border-dd-line bg-dd-paper p-6">
              <strong className="text-dd-forest">Privasi Anda tetap penting.</strong>
              <p className="mt-2 leading-7 text-dd-muted">
                Halaman ini tidak meminta atau menyimpan data pribadi secara publik. Setiap pesan
                dan pertanyaan Anda kami jaga kerahasiaannya untuk membantu kebutuhan latihan Anda di
                Daily Dose.
              </p>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
