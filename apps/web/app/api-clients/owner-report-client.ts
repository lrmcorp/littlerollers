import { apiFetch } from '../lib/api-client';

export interface KelasDiBawahKuota {
  classSlotId: string;
  branchId: string | null;
  namaKelas: string | null;
  mulai: string | null;
  namaInstruktur: string | null;
  hadir: number | null;
  minimum: number | null;
  selisihBebanRp: number | null;
  alasan: string | null;
  diputuskanOleh: string | null;
  diputuskanPada: string;
}

export interface LaporanOwner {
  range: { from: string; until: string; label: string };
  dibawahKuota: { total: number; totalBebanRp: number; rows: KelasDiBawahKuota[] };
  pindaiDitolak: { total: number; perAlasan: { alasan: string; jumlah: number }[] };
}

export interface OwnerReportClient {
  laporan(params: { from: string; until: string; branchId?: string }): Promise<LaporanOwner>;
}

export const browserOwnerReportClient: OwnerReportClient = {
  laporan({ from, until, branchId }) {
    const qs = new URLSearchParams({ from, until, ...(branchId ? { branchId } : {}) });
    return apiFetch(`/reports/owner-exceptions?${qs}`, { label: 'Memuat laporan owner…' });
  },
};
