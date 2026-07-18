'use client';

import { useState } from 'react';
import {
  browserIdentityClient,
  failureCode,
  type IdentityClient,
  type UiFailure,
} from '../identity-client';

export function UsersView({ client = browserIdentityClient }: { client?: IdentityClient }) {
  const [assurance, setAssurance] = useState<'BASE' | 'MFA'>('BASE');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [result, setResult] = useState<string>();
  const [failure, setFailure] = useState<UiFailure>();
  return (
    <section className="card" aria-labelledby="users-title">
      <p className="muted">SUPER OWNER · {assurance} ASSURANCE</p>
      <h1 id="users-title">Administrasi pengguna</h1>
      <p>Daftar, undangan, role, branch scope, dan deaktivasi selalu diverifikasi oleh backend.</p>
      {assurance === 'BASE' ? (
        <div className="notice" role="alert">
          Verifikasi MFA diperlukan untuk tindakan administrasi.
          <button
            onClick={async () => {
              try {
                await client.stepUp();
                setAssurance('MFA');
              } catch (error) {
                setFailure(failureCode(error));
              }
            }}
          >
            Gunakan MFA synthetic
          </button>
        </div>
      ) : (
        <>
          <button onClick={() => setInviteOpen(true)}>Undang pengguna</button>
          {inviteOpen && (
            <form
              aria-label="Undang pengguna"
              onSubmit={async (event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                try {
                  const status = await client.invite(
                    String(data.get('email')),
                    String(data.get('role')),
                  );
                  setResult(
                    status === 'EXISTS' ? 'Undangan sudah tersedia.' : 'Undangan berhasil dibuat.',
                  );
                } catch (error) {
                  setFailure(failureCode(error));
                }
              }}
            >
              <label>
                Email kerja
                <input name="email" type="email" autoComplete="off" required />
              </label>
              <label>
                Role
                <select name="role" defaultValue="ADMIN">
                  <option>ADMIN</option>
                  <option>MANAGER</option>
                  <option>FINANCE</option>
                  <option>OPS</option>
                </select>
              </label>
              <button type="submit">Buat undangan synthetic</button>
            </form>
          )}
          <button
            onClick={async () => {
              try {
                await client.deactivate('selected-user');
                setResult('Pengguna dinonaktifkan.');
              } catch (error) {
                setFailure(failureCode(error));
              }
            }}
          >
            Nonaktifkan pengguna
          </button>
        </>
      )}
      {result && <p role="status">{result}</p>}
      {failure && <p role="alert">{failure}</p>}
    </section>
  );
}
