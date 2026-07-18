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

export function SignInView({ client = browserIdentityClient }: { client?: IdentityClient }) {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | UiFailure>('idle');
  return (
    <section className="card" aria-labelledby="sign-in-title">
      <p className="muted">AKSES INTERNAL</p>
      <h1 id="sign-in-title">Masuk dengan identitas terverifikasi</h1>
      <p>Google dan MFA akan tersedia setelah konfigurasi organisasi disetujui.</p>
      {state in messages && <p role="alert">{messages[state as UiFailure]}</p>}
      {state === 'success' && <p role="status">Identitas terverifikasi.</p>}
      <button
        disabled={state === 'loading'}
        onClick={async () => {
          setState('loading');
          try {
            await client.signIn();
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
