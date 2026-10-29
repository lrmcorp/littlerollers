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
      { label: 'Loading packages…' },
    );
    return {
      branches: result.branches,
      items: result.items.map((item) => ({
        ...item,
        branchId: item.branch?.id ?? branchId ?? '',
        classType: item.classType as PublicClassTypeRef,
        effectiveUntil: item.effectiveUntil?.toISOString() ?? null,
        effectivePriceRp: (item as any).effectivePriceRp ?? item.priceRp,
        promotion: (item as any).promotion
          ? {
              ...(item as any).promotion,
              activeFrom: new Date((item as any).promotion.activeFrom).toISOString(),
              activeUntil: new Date((item as any).promotion.activeUntil).toISOString(),
            }
          : null,
      })),
    };
  },
};

export function publicPackageFailure(error: unknown) {
  const status = publicApiStatus(error);
  if (status === 404) return 'This club is not available.';
  if (status === 422) return 'That club is not valid.';
  if (status === 503) return 'Packages are unavailable right now. Please try again.';
  return 'Packages could not load. Check your connection and try again.';
}
