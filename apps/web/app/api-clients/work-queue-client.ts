import { apiFetch } from '../lib/api-client';

export type KunciAntrean = 'renewal' | 'verifikasi' | 'bukti' | 'kuota' | 'ubahJadwal';
export type NadaAntrean = 'TELAT' | 'TENGGAT' | 'MENUNGGU';

export interface ItemAntrean {
  key: KunciAntrean;
  jumlah: number;
  nada: NadaAntrean;
  acuanPada: string | null;
  umurJam: number | null;
  nilaiRp?: number;
  hot?: number;
  kelas?: { id: string; nama: string; mulai: string; terisi: number; minimum: number }[];
  alasan?: string | null;
  href: string;
}

export interface AntreanTertinggal {
  dibuatPada: string;
  items: ItemAntrean[];
  gagal: KunciAntrean[];
}

export interface WorkQueueClient {
  tertinggal(branchId?: string): Promise<AntreanTertinggal>;
}

export const browserWorkQueueClient: WorkQueueClient = {
  tertinggal(branchId) {
    const qs = branchId ? `?${new URLSearchParams({ branchId })}` : '';
    return apiFetch(`/work-queue/overdue${qs}`, { label: 'Memuat antrean…' });
  },
};
