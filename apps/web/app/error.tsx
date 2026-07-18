'use client';
export default function ErrorView({ reset }: { reset: () => void }) {
  return (
    <section className="card">
      <h1>Tidak dapat memuat halaman</h1>
      <p>Coba kembali. Gunakan ID korelasi dari respons ketika menghubungi dukungan.</p>
      <button onClick={reset}>Coba lagi</button>
    </section>
  );
}
