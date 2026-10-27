'use client';

import { useEffect, useState } from 'react';

/** Hanya jalur internal yang diteruskan (bukan alamat lain), sama seperti syarat tujuan setelah masuk. */
export function safeReturnTo(value: string | null | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return '';
  return value;
}

/**
 * Tujuan setelah masuk/daftar (`returnTo`, atau `returnUrl` lama) dari URL halaman ini, dibaca setelah hidrasi supaya
 * HTML server dan klien sama. `withReturnTo('/register')` memberi tautan ke halaman auth lain yang ikut membawanya.
 */
export function useReturnTo() {
  const [returnTo, setReturnTo] = useState('');
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    setReturnTo(safeReturnTo(query.get('returnTo') || query.get('returnUrl')));
  }, []);
  return {
    returnTo,
    withReturnTo: (href: string) =>
      returnTo ? `${href}${href.includes('?') ? '&' : '?'}returnTo=${encodeURIComponent(returnTo)}` : href,
  };
}
