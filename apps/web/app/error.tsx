'use client';
import { Button } from './components/actions';

export default function ErrorView({ reset }: { reset: () => void }) {
  return (
    <section className="mx-auto w-full max-w-xl space-y-3 rounded-dd-lg border border-dd-line bg-dd-surface p-6 shadow-dd-card">
      <h1 className="text-xl font-semibold text-dd-ink">Tidak dapat memuat halaman</h1>
      <p className="text-sm leading-6 text-dd-muted">
        Coba kembali. Gunakan ID korelasi dari respons ketika menghubungi dukungan.
      </p>
      <Button onClick={reset}>Coba lagi</Button>
    </section>
  );
}
