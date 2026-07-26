export interface PublicPackageBranch {
  id: string;
  code: string;
  name: string;
  timezone: string;
}

export interface PublicPackage {
  id: string;
  branchId: string;
  name: string;
  sessionCount: number;
  durationDays: number;
  priceRp: number;
  effectiveUntil: string | null;
  classType: { id: string; code: string; name: string };
}

export interface PublicPackageCatalogResult {
  branches: PublicPackageBranch[];
  items: PublicPackage[];
}

export interface PublicPackageCatalogClient {
  list(branchId?: string): Promise<PublicPackageCatalogResult>;
}

export const browserPublicPackageCatalogClient: PublicPackageCatalogClient = {
  async list(branchId) {
    const query = new URLSearchParams();
    if (branchId) query.set('branchId', branchId);
    const response = await fetch(`/api/v1/public/package-catalog?${query}`, {
      credentials: 'omit',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw { response: { status: response.status } };
    return response.json() as Promise<PublicPackageCatalogResult>;
  },
};

export function publicPackageFailure(error: unknown) {
  const status = (error as { response?: { status?: number } })?.response?.status;
  if (status === 404) return 'Studio tidak tersedia.';
  if (status === 422) return 'Studio yang dipilih tidak valid.';
  if (status === 503) return 'Paket sedang tidak tersedia. Silakan coba kembali.';
  return 'Paket belum dapat dimuat. Periksa koneksi lalu coba lagi.';
}
