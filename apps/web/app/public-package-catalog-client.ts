import type {
  PublicBranch,
  PublicClassTypeRef,
  PublicPackageSummary,
} from '@dailydose/api-client-ts/generated';
import { appLoading } from './components/app-loading';
import { publicApiStatus, publicGeneratedApi } from './public-api-client';

export type PublicPackageBranch = Pick<PublicBranch, 'id' | 'code' | 'name' | 'timezone'> &
  Partial<Pick<PublicBranch, 'publicProfile'>>;
export type PublicPackage = Omit<
  PublicPackageSummary,
  'effectiveUntil' | 'classType' | 'branch'
> & {
  branchId: string;
  classType: PublicClassTypeRef;
  effectiveUntil: string | null;
};

export interface PublicPackageCatalogResult {
  branches: PublicPackageBranch[];
  items: PublicPackage[];
}

export interface PublicPackageCatalogClient {
  list(branchId?: string): Promise<PublicPackageCatalogResult>;
}

export const browserPublicPackageCatalogClient: PublicPackageCatalogClient = {
  async list(branchId) {
    const result = await appLoading.track(
      publicGeneratedApi.packages.listPublicPackages({ branchId }),
      { label: 'Memuat paket…' },
    );
    return {
      branches: result.branches,
      items: result.items.map((item) => ({
        ...item,
        branchId: item.branch?.id ?? branchId ?? '',
        classType: item.classType as PublicClassTypeRef,
        effectiveUntil: item.effectiveUntil?.toISOString() ?? null,
      })),
    };
  },
};

export function publicPackageFailure(error: unknown) {
  const status = publicApiStatus(error);
  if (status === 404) return 'Studio tidak tersedia.';
  if (status === 422) return 'Studio yang dipilih tidak valid.';
  if (status === 503) return 'Paket sedang tidak tersedia. Silakan coba kembali.';
  return 'Paket belum dapat dimuat. Periksa koneksi lalu coba lagi.';
}
