import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Clock, FileText, HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react';
import { PublicFooter } from '../components/public/public-footer';
import { PublicHeader } from '../components/public/public-header';
import { PublicPageHero } from '../components/public/public-page';
import { publicContainer } from '../components/public/public-styles';

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan Layanan',
  description:
    'Syarat dan Ketentuan keanggotaan, pembelian paket sesi, dan reservasi kelas Daily Dose Pilates.',
};

export default function TermsPage() {
  return (
    <div className="min-w-0 overflow-x-clip bg-dd-cream font-sans text-dd-ink">
      <a className="skip-link" href="#terms-main">
        Langsung ke isi syarat &amp; ketentuan
      </a>
      <PublicHeader />
      <main id="terms-main">
        <PublicPageHero
          eyebrow="Ketentuan Keanggotaan &amp; Layanan"
          title="Syarat &amp; Ketentuan Studio"
          description="Panduan resmi mengenai hak, kewajiban, reservasi kelas, dan masa berlaku paket sesi Daily Dose Pilates."
        />

        <section className="py-12 sm:py-16">
          <div className={publicContainer}>
            <div className="mx-auto max-w-3xl space-y-10">
              {/* Seksi 1: Ketentuan Umum */}
              <article className="rounded-dd-xl border border-dd-line bg-white p-6 sm:p-8 shadow-dd-card space-y-4">
                <div className="flex items-center gap-2.5 text-dd-forest font-bold text-sm uppercase tracking-wider">
                  <FileText className="size-4" />
                  <h2>1. Ketentuan Umum &amp; Akun Member</h2>
                </div>
                <div className="space-y-3 text-sm leading-relaxed text-dd-muted">
                  <p>
                    Dengan mendaftar akun atau membeli paket sesi di Daily Dose Pilates, Anda menyetujui untuk memberikan data diri yang benar (nama, nomor WhatsApp aktif, dan email valid).
                  </p>
                  <p>
                    Setiap akun bersifat personal dan tidak dapat dipindahtangankan tanpa persetujuan tertulis dari manajemen studio. Sesi latihan dalam paket akun Anda hanya dapat digunakan oleh pemilik akun terdaftar.
                  </p>
                </div>
              </article>

              {/* Seksi 2: Paket Sesi & Pembayaran */}
              <article className="rounded-dd-xl border border-dd-line bg-white p-6 sm:p-8 shadow-dd-card space-y-4">
                <div className="flex items-center gap-2.5 text-dd-forest font-bold text-sm uppercase tracking-wider">
                  <Sparkles className="size-4" />
                  <h2>2. Pembelian Paket &amp; Masa Berlaku</h2>
                </div>
                <div className="space-y-3 text-sm leading-relaxed text-dd-muted">
                  <p>
                    Setiap paket sesi memiliki masa berlaku (durasi aktif) yang tertera saat pembelian. Masa berlaku dihitung sejak tanggal pembayaran diverifikasi dan paket dinyatakan aktif.
                  </p>
                  <p>
                    Sesi yang tidak digunakan setelah masa berlaku habis akan otomatis kedaluwarsa dan tidak dapat dikembalikan <em>(non-refundable)</em>.
                  </p>
                  <p>
                    Pembayaran dapat dilakukan melalui transfer bank atau QRIS instan resmi. Paket akan otomatis dikreditkan ke saldo akun Anda setelah verifikasi transaksi selesai.
                  </p>
                </div>
              </article>

              {/* Seksi 3: Reservasi & Pembatalan Kelas */}
              <article className="rounded-dd-xl border border-dd-line bg-white p-6 sm:p-8 shadow-dd-card space-y-4">
                <div className="flex items-center gap-2.5 text-dd-forest font-bold text-sm uppercase tracking-wider">
                  <Clock className="size-4" />
                  <h2>3. Pemesanan Kelas &amp; Kebijakan Pembatalan</h2>
                </div>
                <div className="space-y-3 text-sm leading-relaxed text-dd-muted">
                  <p>
                    Member dapat memesan slot kelas maksimal 14 hari ke depan selama kuota kelas masih tersedia dan saldo paket sesi mencukupi.
                  </p>
                  <p>
                    <strong>Pembatalan Sesi (Late Cancel):</strong> Pembatalan kelas harus diajukan minimal 12 jam sebelum jadwal kelas dimulai agar sesi dapat dikembalikan ke saldo akun Anda. Pembatalan kurang dari 12 jam sebelum kelas atau ketidakhadiran tanpa pemberitahuan <em>(no-show)</em> akan mengakibatkan 1 sesi terpotong.
                  </p>
                  <p>
                    Member diharapkan hadir di studio 10–15 menit sebelum kelas dimulai untuk persiapan dan pemanasan. Keterlambatan lebih dari 10 menit dapat mengorbankan hak mengikuti kelas demi keselamatan latihan.
                  </p>
                </div>
              </article>

              {/* Seksi 4: Keselamatan & Kesehatan */}
              <article className="rounded-dd-xl border border-dd-line bg-white p-6 sm:p-8 shadow-dd-card space-y-4">
                <div className="flex items-center gap-2.5 text-dd-forest font-bold text-sm uppercase tracking-wider">
                  <HeartHandshake className="size-4" />
                  <h2>4. Kesehatan, Cedera &amp; Keselamatan Latihan</h2>
                </div>
                <div className="space-y-3 text-sm leading-relaxed text-dd-muted">
                  <p>
                    Member wajib menginformasikan riwayat cedera, kondisi medis khusus, atau kehamilan kepada instruktur sebelum sesi dimulai.
                  </p>
                  <p>
                    Instruktur berhak merekomendasikan modifikasi gerakan atau mengarahkan ke sesi privat demi keselamatan dan kenyamanan Anda.
                  </p>
                  <p>
                    Member diwajibkan menggunakan kaus kaki khusus Pilates dengan anti-slip <em>(grip socks)</em> saat berada di area reformer studio.
                  </p>
                </div>
              </article>

              {/* Seksi 5: Bantuan & Perubahan Ketentuan */}
              <article className="rounded-dd-xl border border-dd-line bg-white p-6 sm:p-8 shadow-dd-card space-y-4">
                <div className="flex items-center gap-2.5 text-dd-forest font-bold text-sm uppercase tracking-wider">
                  <ShieldCheck className="size-4" />
                  <h2>5. Pertanyaan &amp; Kontak Bantuan</h2>
                </div>
                <p className="text-sm leading-relaxed text-dd-muted">
                  Jika Anda memiliki pertanyaan mengenai syarat dan ketentuan ini, hubungi tim kami melalui WhatsApp studio resmi atau kunjungi front desk cabang Daily Dose Pilates terdekat.
                </p>
                <div className="pt-2 flex flex-wrap gap-3">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 rounded-dd-md bg-dd-forest px-4 py-2 text-sm font-semibold text-white no-underline transition hover:bg-dd-forest-dark"
                  >
                    <span>Hubungi Kami</span>
                  </Link>
                  <Link
                    href="/guide"
                    className="inline-flex items-center gap-2 rounded-dd-md border border-dd-line bg-white px-4 py-2 text-sm font-semibold text-dd-ink no-underline transition hover:bg-dd-surface-muted"
                  >
                    <span>Panduan &amp; Etika Studio</span>
                  </Link>
                </div>
              </article>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
