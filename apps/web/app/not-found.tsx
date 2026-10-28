import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Compass,
  HelpCircle,
  House,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { ButtonLink } from './components/actions';

export const metadata = { title: 'Halaman Tidak Ditemukan (404)' };

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col items-center justify-center px-4 py-16 text-center font-sans">
      <div className="w-full space-y-6 rounded-dd-2xl border border-dd-line/80 bg-white p-8 sm:p-12">
        {/* Badge 404 */}
        <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-dd-forest/10 px-4 py-1 text-[13px] font-bold text-dd-forest">
          <Compass className="size-3.5" />
          <span>Error 404 · Halaman Tidak Ditemukan</span>
        </div>

        <div className="space-y-2">
          <h1 className="font-sans text-3xl sm:text-4xl font-bold tracking-tight text-dd-ink">
            Ups! Halaman belum tersedia
          </h1>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-dd-muted">
            Tautan yang Anda tuju mungkin salah ketik, sudah dipindahkan, atau tidak lagi aktif.
            Mari kembali ke jalur latihan Anda.
          </p>
        </div>

        {/* Shortcut Navigasi Cepat */}
        <div className="grid gap-3 sm:grid-cols-2 pt-2 text-left">
          <Link
            href="/classes"
            className="flex min-h-[44px] items-center gap-3 rounded-dd-lg border border-dd-border-interactive bg-dd-surface p-3.5 no-underline transition hover:border-dd-forest hover:bg-dd-forest/5 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#09371f]"
          >
            <div className="grid size-9 place-items-center rounded-full bg-dd-forest/10 text-dd-forest shrink-0">
              <Calendar className="size-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-dd-ink">Jadwal Kelas</p>
              <p className="text-[13px] text-dd-muted">Cek jadwal 14 hari studio</p>
            </div>
          </Link>

          <Link
            href="/packages"
            className="flex min-h-[44px] items-center gap-3 rounded-dd-lg border border-dd-border-interactive bg-dd-surface p-3.5 no-underline transition hover:border-dd-forest hover:bg-dd-forest/5 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#09371f]"
          >
            <div className="grid size-9 place-items-center rounded-full bg-dd-forest/10 text-dd-forest shrink-0">
              <Sparkles className="size-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-dd-ink">Paket &amp; Harga</p>
              <p className="text-[13px] text-dd-muted">Pilihan sesi reformer &amp; privat</p>
            </div>
          </Link>
        </div>

        {/* Tombol Tindakan Utama */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-dd-line/60">
          <ButtonLink href="/" leadingIcon={<House className="size-4" />}>
            Kembali ke Beranda
          </ButtonLink>
          <ButtonLink
            href="/contact"
            variant="secondary"
            leadingIcon={<MessageCircle className="size-4" />}
          >
            Bantuan WhatsApp
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
