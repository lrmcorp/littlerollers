'use client';

import { useState } from 'react';
import {
  browserIdentityClient,
  failureCode,
  type IdentityClient,
  type UiFailure,
} from '../identity-client';
import { Feedback, PageHeader, StatusBadge } from '../ui';
import { useSessionContext } from '../session-context';

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
  const sessionContext = useSessionContext();
  return (
    <section className="card" aria-labelledby="sign-in-title">
      <PageHeader
        eyebrow="Akses internal"
        title="Masuk dengan identitas terverifikasi"
        titleId="sign-in-title"
        description="Google dan MFA akan tersedia setelah konfigurasi organisasi disetujui."
        context={<StatusBadge tone="warning">Konfigurasi wajib</StatusBadge>}
      />
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
      {state in messages && <Feedback kind="error">{messages[state as UiFailure]}</Feedback>}
      {state === 'success' && <Feedback kind="status">Identitas terverifikasi.</Feedback>}
      <button
        disabled={state === 'loading' || (syntheticMode && !syntheticEmail)}
        onClick={async () => {
          setState('loading');
          try {
            await client.signIn(syntheticMode ? syntheticEmail : undefined);
            if (sessionContext) {
              const completed = await sessionContext.completeSignIn(
                new URLSearchParams(window.location.search).get('returnTo') ?? '/',
              );
              if (!completed) throw { response: { status: 401 } };
            }
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
