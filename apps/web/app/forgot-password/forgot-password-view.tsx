'use client';

import { useState } from 'react';
import {
  browserIdentityClient,
  failureCode,
  type IdentityClient,
} from '@/api-clients/identity-client';
import { Feedback } from '../ui';
import { AuthPageShell } from '../components/auth/auth-page-shell';

export function ForgotPasswordView({
  client = browserIdentityClient,
}: {
  client?: IdentityClient;
}) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  return (
    <AuthPageShell
      eyebrow="Pemulihan akun"
      title="Lupa password"
      description="Masukkan email terdaftar Anda. Jika akun terdaftar, kami akan mengirimkan tautan pemulihan password yang aman."
    >
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          setStatus('loading');
          void client
            .requestPasswordReset(String(new FormData(event.currentTarget).get('email')))
            .then(() => setStatus('sent'))
            .catch((error) => {
              failureCode(error);
              setStatus('error');
            });
        }}
      >
        <label className="grid gap-2 text-sm font-bold">
          Email
          <input
            className="min-h-[50px] rounded-none border border-ed-border-ui bg-white px-4 text-sm text-ed-ink transition-colors focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#09371f]"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="nama@email.com"
            required
          />
        </label>
        <button
          className="min-h-[50px] rounded-none bg-dd-forest px-5 font-bold text-white transition-colors hover:bg-ed-deep focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#09371f] disabled:bg-ed-line disabled:text-ed-muted"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Mengirim…' : 'Kirim tautan reset'}
        </button>
      </form>
      {status === 'sent' && (
        <Feedback kind="status">
          Jika akun cocok, tautan reset telah dikirim. Periksa inbox dan folder spam.
        </Feedback>
      )}
      {status === 'error' && (
        <Feedback kind="error">Permintaan belum dapat diproses. Coba kembali nanti.</Feedback>
      )}
    </AuthPageShell>
  );
}
