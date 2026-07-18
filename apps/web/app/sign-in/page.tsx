'use client';

import { useState } from 'react';

export default function SignInPage() {
  const [state, setState] = useState<'idle' | 'loading' | 'configuration'>('idle');
  return (
    <section className="card" aria-labelledby="sign-in-title">
      <p className="muted">AKSES INTERNAL</p>
      <h1 id="sign-in-title">Masuk dengan identitas terverifikasi</h1>
      <p>Google dan MFA akan tersedia setelah konfigurasi organisasi disetujui.</p>
      {state === 'configuration' && (
        <p role="alert">Konfigurasi autentikasi belum tersedia. Hubungi administrator.</p>
      )}
      <button
        disabled={state === 'loading'}
        onClick={() => {
          setState('loading');
          setTimeout(() => setState('configuration'), 0);
        }}
      >
        {state === 'loading' ? 'Memeriksa…' : 'Lanjutkan dengan Google'}
      </button>
    </section>
  );
}
