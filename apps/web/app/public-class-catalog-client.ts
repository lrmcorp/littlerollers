import type {
  PublicBranch as GeneratedPublicBranch,
  PublicClassTypeRef,
  PublicScheduleSummary,
} from '@dailydose/api-client-ts/generated';
import { appLoading } from './components/app-loading';
import { publicApiStatus, publicGeneratedApi } from './public-api-client';

export type PublicBranch = Pick<GeneratedPublicBranch, 'id' | 'code' | 'name' | 'timezone'> &
  Partial<Pick<GeneratedPublicBranch, 'publicProfile'>>;

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
      { label: 'Loading the timetable…' },
    );
    return {
      branches: result.branches,
      items: result.items.map((item) => ({
        ...item,
        branchId: input.branchId ?? item.branch?.id ?? '',
        classType: item.classType as PublicClassTypeRef,
        startAt: item.startAt.toISOString(),
        endAt: item.endAt.toISOString(),
      })),
      range: {
        from: result.range.from.toISOString(),
        until: result.range.until.toISOString(),
      },
    };
  },
};

export function publicCatalogFailure(error: unknown) {
  const status = publicApiStatus(error);
  if (status === 404) return 'This club is not available.';
  if (status === 422) return 'That date range is not valid.';
  if (status === 503) return 'The timetable is unavailable right now. Please try again.';
  return 'The timetable could not load. Check your connection and try again.';
}
