'use client';

import { useState } from 'react';
import {
  browserIdentityClient,
  failureCode,
  type IdentityClient,
  type UiFailure,
} from '../identity-client';
import { ConfirmationPanel, Feedback, PageHeader, StatusBadge } from '../ui';
import { useSessionContext } from '../session-context';

export function UsersView({ client = browserIdentityClient }: { client?: IdentityClient }) {
  const context = useSessionContext();
  const [fallbackAssurance, setFallbackAssurance] = useState<'BASE' | 'MFA'>('BASE');
  const assurance = context?.session?.assurance ?? fallbackAssurance;
  const canAdmin = !context || context.hasCapability('user:admin');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [result, setResult] = useState<string>();
  const [failure, setFailure] = useState<UiFailure>();
  return (
    <section className="card" aria-labelledby="users-title">
      <PageHeader
        eyebrow="Administrasi identitas"
        title="Administrasi pengguna"
        titleId="users-title"
        description="Daftar, undangan, role, branch scope, dan deaktivasi selalu diverifikasi oleh backend."
        context={
          <>
            <StatusBadge tone="info">SUPER OWNER</StatusBadge>
            <StatusBadge tone={assurance === 'MFA' ? 'success' : 'warning'}>
              {assurance} assurance
            </StatusBadge>
          </>
        }
      />
      {assurance === 'BASE' ? (
        <div className="notice" role="alert">
          Verifikasi MFA diperlukan untuk tindakan administrasi.
          <button
            onClick={async () => {
              try {
                await client.stepUp();
                if (context) await context.refresh();
                else setFallbackAssurance('MFA');
              } catch (error) {
                setFailure(failureCode(error));
              }
            }}
          >
            Gunakan MFA synthetic
          </button>
        </div>
      ) : canAdmin ? (
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
          <ConfirmationPanel title="Konsekuensi deaktivasi">
            Seluruh sesi Web dan mobile pengguna akan dicabut. Pastikan target serta cakupan cabang
            sudah benar.
          </ConfirmationPanel>
        </>
      ) : (
        <Feedback kind="info">
          Anda memiliki akses baca tanpa capability administrasi pengguna.
        </Feedback>
      )}
      {result && <Feedback kind="status">{result}</Feedback>}
      {failure && <Feedback kind="error">{failure}</Feedback>}
    </section>
  );
}
