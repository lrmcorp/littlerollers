import { Activity, CheckCircle2, Clock3, Server } from 'lucide-react';

export default async function Health() {
  let ready = false;
  let checkedAt = new Date();
  try {
    const response = await fetch(
      `${process.env.API_BASE_URL ?? 'http://localhost:32121'}/api/v1/operations/health`,
      { cache: 'no-store' },
    );
    ready = response.ok;
    if (response.ok) {
      const body = (await response.json()) as { checkedAt?: string };
      if (body.checkedAt) checkedAt = new Date(body.checkedAt);
    }
  } catch {}
  return (
    <div className="space-y-6">
      <header className="border-b border-dd-line pb-7">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-dd-forest">
          <Activity className="size-4" />
          Operations
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Status sistem</h1>
        <p className="mt-2 max-w-2xl text-dd-muted">
          Kesiapan layanan inti tanpa mengekspos credential, provider, atau detail koneksi privat.
        </p>
      </header>
      <section className="grid gap-4 sm:grid-cols-3" aria-label="Ringkasan status">
        <div className="rounded-dd-lg border border-dd-line bg-dd-surface p-5 shadow-dd-card">
          <Server className="size-5 text-dd-brass" />
          <span className="mt-5 block text-xs font-bold uppercase tracking-wider text-dd-muted">
            API utama
          </span>
          <strong
            className={`mt-2 flex items-center gap-2 text-xl ${ready ? 'text-dd-success' : 'text-dd-danger'}`}
          >
            <CheckCircle2 className="size-5" />
            {ready ? 'Siap' : 'Tidak tersedia'}
          </strong>
        </div>
        <div className="rounded-dd-lg border border-dd-line bg-dd-surface p-5 shadow-dd-card">
          <Activity className="size-5 text-dd-brass" />
          <span className="mt-5 block text-xs font-bold uppercase tracking-wider text-dd-muted">
            Kondisi
          </span>
          <strong className="mt-2 block text-xl">{ready ? 'Normal' : 'Perlu perhatian'}</strong>
        </div>
        <div className="rounded-dd-lg border border-dd-line bg-dd-surface p-5 shadow-dd-card">
          <Clock3 className="size-5 text-dd-brass" />
          <span className="mt-5 block text-xs font-bold uppercase tracking-wider text-dd-muted">
            Pemeriksaan
          </span>
          <strong className="mt-2 block text-base">{checkedAt.toLocaleString('id-ID')}</strong>
        </div>
      </section>
      <div
        role="status"
        className={`rounded-dd-lg border p-4 text-sm font-semibold ${ready ? 'border-emerald-200 bg-dd-success-soft text-dd-success' : 'border-red-200 bg-dd-danger-soft text-dd-danger'}`}
      >
        API: {ready ? 'Siap menerima permintaan' : 'Belum terhubung'}
      </div>
    </div>
  );
}
