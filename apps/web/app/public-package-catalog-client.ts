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
  'effectiveUntil' | 'classType' | 'branch' | 'promotion' | 'effectivePriceRp'
> & {
  branchId: string;
  classType: PublicClassTypeRef;
  effectiveUntil: string | null;
  effectivePriceRp?: number;
  promotion?: null | {
    id: string;
    name: string;
    label: string;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    discountValue: number;
    discountRp: number;
    promotionalPriceRp: number;
    activeFrom: string;
    activeUntil: string;
    version: number;
  };
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
      items: result.items.map((item) => {
        const raw = item as unknown as { classTypes?: PublicClassTypeRef[] };
        const classType =
          item.classType ??
          raw.classTypes?.[0] ??
          ({ id: 'all', code: 'ALL', name: 'Semua Kelas' } as PublicClassTypeRef);
        return {
          ...item,
          branchId: item.branch?.id ?? item.branchId ?? branchId ?? '',
          classType,
          effectiveUntil: item.effectiveUntil
            ? typeof item.effectiveUntil === 'string'
              ? item.effectiveUntil
              : item.effectiveUntil.toISOString()
            : null,
          effectivePriceRp: item.effectivePriceRp ?? item.priceRp,
          promotion: item.promotion
            ? {
                ...item.promotion,
                activeFrom:
                  typeof item.promotion.activeFrom === 'string'
                    ? item.promotion.activeFrom
                    : new Date(item.promotion.activeFrom).toISOString(),
                activeUntil:
                  typeof item.promotion.activeUntil === 'string'
                    ? item.promotion.activeUntil
                    : new Date(item.promotion.activeUntil).toISOString(),
              }
            : null,
        };
      }),
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
