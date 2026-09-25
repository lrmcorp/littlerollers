'use client';

import { createContext, useContext } from 'react';
import type { FrontendPageDefinition } from '@/lib/frontend-pages';

/**
 * Halaman registry yang sedang dibuka. Diisi oleh `ApplicationShell` agar header halaman dan
 * elemen lain dapat membaca grup/cakupan tanpa memanggil `usePathname` sendiri (lebih mudah dites).
 */
const PageMetaContext = createContext<FrontendPageDefinition | undefined>(undefined);

export const PageMetaProvider = PageMetaContext.Provider;

export function usePageMeta() {
  return useContext(PageMetaContext);
}
