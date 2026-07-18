'use client';

import { useState } from 'react';
import {
  browserIdentityClient,
  failureCode,
  type IdentityClient,
  type UiFailure,
} from '../identity-client';

const messages: Record<UiFailure, string> = {
  CONFIGURATION_REQUIRED: 'Konfigurasi autentikasi belum tersedia. Hubungi administrator.',
  RATE_LIMITED: 'Terlalu banyak percobaan. Coba kembali nanti.',
  MFA_CHALLENGE_EXPIRED: 'Verifikasi telah kedaluwarsa.',
  FORBIDDEN: 'Akses tidak diizinkan.',
  IDENTITY_CONFLICT: 'Identitas memerlukan tinjauan dukungan.',
  SESSION_REVOKED: 'Sesi telah berakhir. Silakan masuk kembali.',
};

export function SignInView({
  client = browserIdentityClient,
  syntheticMode = process.env.NEXT_PUBLIC_AUTH_SYNTHETIC_ENABLED === 'true',
}: {
  client?: IdentityClient;
  syntheticMode?: boolean;
}) {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | UiFailure>('idle');
  const [syntheticEmail, setSyntheticEmail] = useState('');
  return (
    <section className="card" aria-labelledby="sign-in-title">
      <p className="muted">AKSES INTERNAL</p>
      <h1 id="sign-in-title">Masuk dengan identitas terverifikasi</h1>
      <p>Google dan MFA akan tersedia setelah konfigurasi organisasi disetujui.</p>
      {syntheticMode && (
        <label>
          Email Google synthetic
          <input
            type="email"
            autoComplete="username"
            value={syntheticEmail}
            onChange={(event) => setSyntheticEmail(event.target.value)}
            required
          />
        </label>
      )}
      {state in messages && <p role="alert">{messages[state as UiFailure]}</p>}
      {state === 'success' && <p role="status">Identitas terverifikasi.</p>}
      <button
        disabled={state === 'loading' || (syntheticMode && !syntheticEmail)}
        onClick={async () => {
          setState('loading');
          try {
            await client.signIn(syntheticMode ? syntheticEmail : undefined);
            setState('success');
          } catch (error) {
            setState(failureCode(error));
          }
        }}
      >
        {state === 'loading' ? 'Memeriksa…' : 'Lanjutkan dengan Google'}
      </button>
    </section>
  );
}
