export interface PublicBranch {
  id: string;
  code: string;
  name: string;
  timezone: string;
}

export interface PublicClassSlot {
  id: string;
  branchId: string;
  classType: { id: string; code: string; name: string };
  startAt: string;
  endAt: string;
  timezone: string;
  status: 'PUBLISHED' | 'CONFIRMED';
  capacity: number;
  available: number;
}

export interface PublicClassCatalogResult {
  branches: PublicBranch[];
  items: PublicClassSlot[];
  range: { from: string; until: string };
}

export interface PublicClassCatalogClient {
  list(input: { branchId?: string; from?: Date; until?: Date }): Promise<PublicClassCatalogResult>;
}

export const browserPublicClassCatalogClient: PublicClassCatalogClient = {
  async list(input) {
    const query = new URLSearchParams();
    if (input.branchId) query.set('branchId', input.branchId);
    if (input.from) query.set('from', input.from.toISOString());
    if (input.until) query.set('until', input.until.toISOString());
    const response = await fetch(`/api/v1/public/class-catalog?${query}`, {
      credentials: 'omit',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw { response: { status: response.status } };
    return response.json() as Promise<PublicClassCatalogResult>;
  },
};

export function publicCatalogFailure(error: unknown) {
  const status = (error as { response?: { status?: number } })?.response?.status;
  if (status === 404) return 'Studio tidak tersedia.';
  if (status === 422) return 'Rentang tanggal tidak valid.';
  if (status === 503) return 'Jadwal sedang tidak tersedia. Silakan coba kembali.';
  return 'Jadwal belum dapat dimuat. Periksa koneksi lalu coba lagi.';
}
