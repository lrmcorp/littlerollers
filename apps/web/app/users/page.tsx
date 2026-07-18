export default function UsersPage() {
  return (
    <section className="card" aria-labelledby="users-title">
      <p className="muted">SUPER OWNER · MFA REQUIRED</p>
      <h1 id="users-title">Administrasi pengguna</h1>
      <p>Daftar, undangan, role, branch scope, dan deaktivasi selalu diverifikasi oleh backend.</p>
      <div role="status" className="notice">
        Masuk dengan assurance MFA untuk melihat data pengguna.
      </div>
      <button disabled>Undang pengguna</button>
    </section>
  );
}
