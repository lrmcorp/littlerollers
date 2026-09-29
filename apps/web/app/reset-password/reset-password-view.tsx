'use client';

import Link from 'next/link';
import { useState } from 'react';
import { browserIdentityClient, type IdentityClient } from '@/api-clients/identity-client';
import { Feedback } from '../ui';
import { AuthPageShell } from '../components/auth/auth-page-shell';

export function ResetPasswordView({ client = browserIdentityClient }: { client?: IdentityClient }) {
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  return (
    <AuthPageShell
      eyebrow="Kredensial baru"
      title="Reset password"
      description="Gunakan password baru sepanjang 8–128 karakter. Seluruh sesi lama akan dicabut."
    >
      <form
        method="post"
        className="grid min-w-0 max-w-full gap-4 overflow-x-clip"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const password = String(data.get('password'));
          if (password !== String(data.get('confirmation'))) {
            setStatus('error');
            return;
          }
          const token = new URLSearchParams(window.location.search).get('token') ?? '';
          setStatus('loading');
          void client
            .resetPassword(token, password)
            .then(() => setStatus('done'))
            .catch(() => setStatus('error'));
        }}
      >
        <label className="grid min-w-0 gap-2 text-sm font-bold">
          Password baru
          <span className="relative min-w-0">
            <input
              className="min-h-[50px] w-full min-w-0 rounded-dd-sm border border-dd-line px-4 pr-24"
              name="password"
              type={show ? 'text' : 'password'}
              minLength={8}
              maxLength={128}
              autoComplete="new-password"
              placeholder="Minimal 8 karakter"
              required
            />
            <button
              className="absolute inset-y-0 right-1 px-3 text-sm font-bold text-dd-forest"
              type="button"
              onClick={() => setShow((value) => !value)}
            >
              {show ? 'Sembunyikan' : 'Lihat'}
            </button>
          </span>
        </label>
        <label className="grid min-w-0 gap-2 text-sm font-bold">
          Ulangi password baru
          <input
            className="min-h-[50px] w-full min-w-0 rounded-dd-sm border border-dd-line px-4"
            name="confirmation"
            type={show ? 'text' : 'password'}
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
            placeholder="Ulangi password baru"
            required
          />
        </label>
        <button
          className="min-h-[50px] rounded-dd-sm bg-dd-forest px-5 font-bold text-white"
          disabled={status === 'loading'}
        >
          Simpan password baru
        </button>
      </form>
      {status === 'done' && (
        <Feedback kind="status">
          Password berhasil diperbarui. <Link href="/sign-in">Silakan masuk ke akun</Link>.
        </Feedback>
      )}
      {status === 'error' && (
        <Feedback kind="error">Password harus sama, dan tautan harus masih berlaku.</Feedback>
      )}
    </AuthPageShell>
  );
}
