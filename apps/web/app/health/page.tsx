export default async function Health() {
  let status = 'Belum terhubung';
  try {
    const response = await fetch(
      `${process.env.API_BASE_URL ?? 'http://localhost:3001'}/api/v1/operations/health`,
      { cache: 'no-store' },
    );
    status = response.ok ? 'Siap' : 'Terdegradasi';
  } catch {}
  return (
    <section className="card">
      <p className="muted">OPERATIONS</p>
      <h1>Status sistem</h1>
      <p role="status">API: {status}</p>
    </section>
  );
}
