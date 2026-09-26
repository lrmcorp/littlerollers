import {
  publicApiStatus,
  publicGeneratedApi,
  type PublicBranch,
  type PublicClassTypeRef,
  type PublicScheduleSummary,
} from './public-api-client';
import { appLoading } from '../components/app-loading';

export type { PublicBranch };

export type PublicClassSlot = Omit<
  PublicScheduleSummary,
  'startAt' | 'endAt' | 'branch' | 'classType'
> & {
  branchId: string;
  classType: PublicClassTypeRef;
  instructor?: { displayName: string } | null;
  startAt: string;
  endAt: string;
};

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
    const result = await appLoading.track(
      publicGeneratedApi.classes.listPublicClassSchedule(input),
      { label: 'Memuat jadwal…' },
    );
    return {
      branches: result.branches,
      items: result.items.map((item) => ({
        ...item,
        branchId: input.branchId ?? item.branch?.id ?? '',
        classType: item.classType as PublicClassTypeRef,
        startAt: typeof item.startAt === 'string' ? item.startAt : (item.startAt as any).toISOString(),
        endAt: typeof item.endAt === 'string' ? item.endAt : (item.endAt as any).toISOString(),
      })),
      range: {
        from: typeof result.range.from === 'string' ? result.range.from : (result.range.from as any).toISOString(),
        until: typeof result.range.until === 'string' ? result.range.until : (result.range.until as any).toISOString(),
      },
    };
  },
};

export function publicCatalogFailure(error: unknown) {
  const status = publicApiStatus(error);
  if (status === 404) return 'Studio tidak tersedia.';
  if (status === 422) return 'Rentang tanggal tidak valid.';
  if (status === 503) return 'Jadwal sedang tidak tersedia. Silakan coba kembali.';
  return 'Jadwal belum dapat dimuat. Periksa koneksi lalu coba lagi.';
}
