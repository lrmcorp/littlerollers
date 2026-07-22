export default function Home() {
  return (
    <section className="card">
      <p className="muted">BG-2 IDENTITY FOUNDATION</p>
      <h1>Daily Dose v2</h1>
      <p>
        Identity dan authorization dibangun dengan konfigurasi wajib. Provider produksi belum
        diaktifkan.
      </p>
      <p>
        <a href="/sign-in">Masuk internal</a> · <a href="/users">Administrasi pengguna</a> ·{' '}
        <a href="/assignments">Assignments</a> · <a href="/master">Master data</a> ·{' '}
        <a href="/purchases">Purchase package</a> · <a href="/classes">Timetable kelas</a>
      </p>
    </section>
  );
}
