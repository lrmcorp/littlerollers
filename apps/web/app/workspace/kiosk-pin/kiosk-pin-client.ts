import { apiFetch } from '../../lib/api-client';

export interface KioskPinBranch {
  branchId: string;
  code: string;
  name: string;
  /** Sudah ada PIN. PIN asli tidak pernah dikirim ulang oleh server. */
  configured: boolean;
  updatedAt: string | null;
}

export interface KioskPinCreated {
  branchId: string;
  code: string;
  pin: string;
  updatedAt: string;
}

export interface KioskPinClient {
  list(): Promise<{ items: KioskPinBranch[] }>;
  rotate(branchId: string): Promise<KioskPinCreated>;
}

export const browserKioskPinClient: KioskPinClient = {
  list: () => apiFetch('/kiosk-access', { label: 'Memuat PIN kiosk…' }),
  rotate: (branchId) =>
    apiFetch(`/kiosk-access/${encodeURIComponent(branchId)}/pin`, {
      method: 'POST',
      label: 'Membuat PIN kiosk…',
    }),
};
