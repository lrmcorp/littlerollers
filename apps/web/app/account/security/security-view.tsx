'use client';

import { useEffect, useState } from 'react';
import { browserIdentityClient, type IdentityClient } from '../../identity-client';
import { Feedback, PageHeader, Skeleton, StatusBadge } from '../../ui';

type Status = Awaited<ReturnType<IdentityClient['securityStatus']>>;

export function SecurityView({ client = browserIdentityClient }: { client?: IdentityClient }) {
  const [status, setStatus] = useState<Status>();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setStatus(await client.securityStatus());
    } catch {
      setError('Status keamanan tidak dapat dimuat.');
    }
  };

  useEffect(() => {
    void load();
  }, []);

  if (!status && !error) return <Skeleton label="Memuat keamanan akun" />;

  return (
    <section className="card">
      <PageHeader
        eyebrow="Akun"
        title="Keamanan akun"
        description="Kelola password akun dan cabut sesi lain setelah password diperbarui."
        context={
          <>
            <StatusBadge tone={status?.passwordEnabled ? 'success' : 'neutral'}>
              Password {status?.passwordEnabled ? 'aktif' : 'belum aktif'}
            </StatusBadge>
          </>
        }
      />

      {status?.passwordEnabled && (
        <form
          className="admin-form"
          aria-label="Ubah password"
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const data = new FormData(form);
            setError('');
            void client
              .changePassword(String(data.get('current')), String(data.get('next')))
              .then(() => {
                setMessage('Password diperbarui dan sesi lain telah dicabut.');
                form.reset();
                void load();
              })
              .catch(() =>
                setError('Password saat ini tidak valid atau password baru tidak sesuai.'),
              );
          }}
        >
          <h2>Ubah password</h2>
          <label>
            Password saat ini
            <input name="current" type="password" autoComplete="current-password" required />
          </label>
          <label>
            Password baru
            <input
              name="next"
              type="password"
              minLength={8}
              maxLength={128}
              autoComplete="new-password"
              required
            />
          </label>
          <button>Simpan password</button>
        </form>
      )}

      {message && <Feedback kind="status">{message}</Feedback>}
      {error && <Feedback kind="error">{error}</Feedback>}
    </section>
  );
}
