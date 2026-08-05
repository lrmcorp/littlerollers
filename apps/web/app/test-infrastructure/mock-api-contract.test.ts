import {
  instanceOfPublicClassDetail,
  instanceOfPublicPackageDetail,
  instanceOfPublicScheduleDetail,
  instanceOfPublicSiteConfig,
  instanceOfPublicStudioDetail,
} from '@dailydose/api-client-ts/generated';
import { describe, expect, it } from 'vitest';
import {
  classDetail,
  packageDetail,
  schedule,
  siteConfig,
  studioDetail,
} from '../../e2e/support/mock-api-fixtures.mjs';

describe('Playwright mock API fixture contracts', () => {
  it('matches the generated public API contracts', () => {
    expect(instanceOfPublicSiteConfig(siteConfig)).toBe(true);
    expect(instanceOfPublicPackageDetail(packageDetail)).toBe(true);
    expect(instanceOfPublicClassDetail(classDetail)).toBe(true);
    expect(instanceOfPublicStudioDetail(studioDetail)).toBe(true);
    expect(instanceOfPublicScheduleDetail(schedule)).toBe(true);
  });
});
