'use client';

import { useState } from 'react';
import { browserIdentityClient, failureCode, type IdentityClient } from '../identity-client';
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
      description="Masukkan email undangan Anda. Jika akun cocok, kami akan mengirim tautan reset yang aman."
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
            className="min-h-[50px] rounded-dd-sm border border-dd-line px-4"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </label>
        <button
          className="min-h-[50px] rounded-dd-sm bg-dd-forest px-5 font-bold text-white"
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
