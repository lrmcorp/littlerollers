import { ButtonLink } from './components/actions';

export const metadata = { title: 'Halaman tidak ditemukan' };

export default function NotFound() {
  return (
    <section className="mx-auto w-full max-w-xl space-y-3 rounded-dd-lg border border-dd-line bg-dd-surface p-6 text-center shadow-dd-card sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-dd-forest">Kode 404</p>
      <h1 className="text-2xl font-semibold text-dd-ink">Halaman tidak ditemukan</h1>
      <p className="text-sm leading-6 text-dd-muted">
        Alamat yang Anda buka tidak ada, sudah dipindahkan, atau di luar hak akses akun ini.
      </p>
      <div className="flex flex-wrap justify-center gap-2 pt-2">
        <ButtonLink href="/workspace">Ke Dashboard</ButtonLink>
        <ButtonLink href="/" variant="secondary">
          Situs utama
        </ButtonLink>
      </div>
    </section>
  );
}
