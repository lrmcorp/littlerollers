import type {
  PublicBranch,
  PublicClassDetail as GeneratedPublicClassDetail,
  PublicClassProfile,
  PublicClassTypeRef,
  PublicPackageDetail as GeneratedPublicPackageDetail,
  PublicPackageProfile,
  PublicPackageSummary,
  PublicScheduleDetail as GeneratedPublicScheduleDetail,
  PublicScheduleSummary,
  PublicStudioDetail as GeneratedPublicStudioDetail,
  PublicStudioDetailAllOfClasses,
} from '@dailydose/api-client-ts/generated';
import { publicApiStatus, publicGeneratedApi } from './public-api-client';

export type PublicProfileBranch = PublicBranch;

export type RelatedSchedule = Omit<PublicScheduleSummary, 'startAt' | 'endAt'> & {
  startAt: string;
  endAt: string;
};

export type PublicPackageDetail = Omit<
  GeneratedPublicPackageDetail,
  'effectiveFrom' | 'effectiveUntil' | 'schedules'
> & {
  effectiveFrom: string;
  effectiveUntil: string | null;
  schedules: RelatedSchedule[];
};

export type PublicScheduleDetail = Omit<GeneratedPublicScheduleDetail, 'startAt' | 'endAt'> & {
  startAt: string;
  endAt: string;
};

export interface PublicClassDetail {
  profile: PublicClassProfile;
  studios: PublicProfileBranch[];
  packages: Array<
    Pick<PublicPackageSummary, 'id' | 'name' | 'sessionCount' | 'durationDays' | 'priceRp'> & {
      publicProfile: Pick<PublicPackageProfile, 'summary'>;
      branch: PublicProfileBranch;
    }
  >;
  schedules: RelatedSchedule[];
}

export interface PublicStudioDetail extends Pick<
  GeneratedPublicStudioDetail,
  'id' | 'code' | 'name' | 'timezone' | 'supportWhatsappE164' | 'publicProfile'
> {
  classes: Array<PublicStudioDetailAllOfClasses & { profile: PublicClassProfile }>;
  packages: Array<
    Pick<PublicPackageSummary, 'id' | 'name' | 'sessionCount' | 'durationDays' | 'priceRp'> & {
      publicProfile: Pick<PublicPackageProfile, 'summary'>;
      classType: PublicClassTypeRef;
    }
  >;
  schedules: RelatedSchedule[];
}

function scheduleView(item: PublicScheduleSummary): RelatedSchedule {
  return {
    ...item,
    startAt: item.startAt.toISOString(),
    endAt: item.endAt.toISOString(),
  };
}

function classDetailView(item: GeneratedPublicClassDetail): PublicClassDetail {
  return {
    profile: item.profile,
    studios: item.studios,
    packages: item.packages
      .filter(
        (
          candidate,
        ): candidate is PublicPackageSummary & {
          publicProfile: PublicPackageProfile;
          branch: PublicBranch;
        } => Boolean(candidate.publicProfile && candidate.branch),
      )
      .map(({ id, name, sessionCount, durationDays, priceRp, publicProfile, branch }) => ({
        id,
        name,
        sessionCount,
        durationDays,
        priceRp,
        publicProfile,
        branch,
      })),
    schedules: item.schedules.map(scheduleView),
  };
}

function studioDetailView(item: GeneratedPublicStudioDetail): PublicStudioDetail {
  return {
    id: item.id,
    code: item.code,
    name: item.name,
    timezone: item.timezone,
    supportWhatsappE164: item.supportWhatsappE164,
    publicProfile: item.publicProfile,
    classes: item.classes.filter(
      (candidate): candidate is PublicStudioDetailAllOfClasses & { profile: PublicClassProfile } =>
        Boolean(candidate.profile),
    ),
    packages: item.packages
      .filter(
        (
          candidate,
        ): candidate is PublicPackageSummary & {
          publicProfile: PublicPackageProfile;
          classType: PublicClassTypeRef;
        } => Boolean(candidate.publicProfile && candidate.classType),
      )
      .map(({ id, name, sessionCount, durationDays, priceRp, publicProfile, classType }) => ({
        id,
        name,
        sessionCount,
        durationDays,
        priceRp,
        publicProfile,
        classType,
      })),
    schedules: item.schedules.map(scheduleView),
  };
}

export const publicDetailClient = {
  async package(id: string): Promise<PublicPackageDetail> {
    const item = await publicGeneratedApi.packages.getPublicPackageDetail({ id });
    return {
      ...item,
      effectiveFrom: item.effectiveFrom.toISOString(),
      effectiveUntil: item.effectiveUntil?.toISOString() ?? null,
      schedules: item.schedules.map(scheduleView),
    };
  },
  async schedule(id: string): Promise<PublicScheduleDetail> {
    const item = await publicGeneratedApi.classes.getPublicScheduleDetail({ id });
    return {
      ...item,
      startAt: item.startAt.toISOString(),
      endAt: item.endAt.toISOString(),
    };
  },
  async classType(slug: string): Promise<PublicClassDetail> {
    return classDetailView(await publicGeneratedApi.classes.getPublicClassDetail({ slug }));
  },
  async studio(slug: string): Promise<PublicStudioDetail> {
    return studioDetailView(await publicGeneratedApi.master.getPublicStudioDetail({ slug }));
  },
};

export function publicDetailFailure(error: unknown) {
  const status = publicApiStatus(error);
  if (status === 404) return 'NOT_FOUND';
  if (status === 503) return 'Layanan sedang tidak tersedia. Silakan coba beberapa saat lagi.';
  return 'Detail belum dapat dimuat. Periksa koneksi lalu coba lagi.';
}
