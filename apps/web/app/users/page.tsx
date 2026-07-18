'use client';

import { useState } from 'react';

export default function UsersPage() {
  const [assurance, setAssurance] = useState<'BASE' | 'MFA'>('BASE');
  const [inviteOpen, setInviteOpen] = useState(false);
  return (
    <section className="card" aria-labelledby="users-title">
      <p className="muted">SUPER OWNER · {assurance} ASSURANCE</p>
      <h1 id="users-title">Administrasi pengguna</h1>
      <p>Daftar, undangan, role, branch scope, dan deaktivasi selalu diverifikasi oleh backend.</p>
      {assurance === 'BASE' ? (
        <div className="notice" role="alert">
          Verifikasi MFA diperlukan untuk tindakan administrasi.
          <button onClick={() => setAssurance('MFA')}>Gunakan MFA synthetic</button>
        </div>
      ) : (
        <>
          <button onClick={() => setInviteOpen(true)}>Undang pengguna</button>
          {inviteOpen && (
            <form aria-label="Undang pengguna" onSubmit={(event) => event.preventDefault()}>
              <label>
                Email kerja
                <input type="email" autoComplete="off" required />
              </label>
              <label>
                Role
                <select defaultValue="ADMIN">
                  <option>ADMIN</option>
                  <option>MANAGER</option>
                  <option>FINANCE</option>
                  <option>OPS</option>
                </select>
              </label>
              <button type="submit">Buat undangan synthetic</button>
            </form>
          )}
        </>
      )}
    </section>
  );
}
