import { describe, expect, it } from 'vitest';
import {
  classDetail,
  packageDetail,
  schedule,
  siteConfig,
  studioDetail,
} from '../../e2e/support/mock-api-fixtures.mjs';

describe('Playwright mock API fixture contracts', () => {
  it('matches the public API contract structures', () => {
    // Validate siteConfig contract
    expect(siteConfig).toBeDefined();
    expect(Array.isArray(siteConfig.branches)).toBe(true);
    expect(Array.isArray(siteConfig.classes)).toBe(true);
    expect(siteConfig.branches.length).toBeGreaterThan(0);
    expect(siteConfig.branches[0]).toHaveProperty('code');
    expect(siteConfig.branches[0]).toHaveProperty('publicProfile');
    expect(siteConfig).toHaveProperty('mobileFeatures');

    // Validate packageDetail contract
    expect(packageDetail).toBeDefined();
    expect(packageDetail).toHaveProperty('id');
    expect(packageDetail).toHaveProperty('name');
    expect(packageDetail).toHaveProperty('priceRp');
    expect(packageDetail).toHaveProperty('sessionCount');
    expect(packageDetail).toHaveProperty('classType');
    expect(packageDetail).toHaveProperty('publicProfile');
    expect(packageDetail).toHaveProperty('branch');
    expect(Array.isArray(packageDetail.schedules)).toBe(true);

    // Validate classDetail contract
    expect(classDetail).toBeDefined();
    expect(classDetail).toHaveProperty('profile');
    expect(classDetail.profile).toHaveProperty('slug');
    expect(classDetail.profile).toHaveProperty('summary');
    expect(Array.isArray(classDetail.studios)).toBe(true);
    expect(Array.isArray(classDetail.packages)).toBe(true);
    expect(Array.isArray(classDetail.schedules)).toBe(true);

    // Validate studioDetail contract
    expect(studioDetail).toBeDefined();
    expect(studioDetail).toHaveProperty('id');
    expect(studioDetail).toHaveProperty('code');
    expect(studioDetail).toHaveProperty('name');
    expect(studioDetail).toHaveProperty('publicProfile');
    expect(Array.isArray(studioDetail.classes)).toBe(true);
    expect(Array.isArray(studioDetail.packages)).toBe(true);
    expect(Array.isArray(studioDetail.schedules)).toBe(true);

    // Validate schedule contract
    expect(schedule).toBeDefined();
    expect(schedule).toHaveProperty('id');
    expect(schedule).toHaveProperty('branchId');
    expect(schedule).toHaveProperty('startAt');
    expect(schedule).toHaveProperty('endAt');
    expect(schedule).toHaveProperty('status');
    expect(schedule).toHaveProperty('capacity');
    expect(schedule).toHaveProperty('available');
    expect(schedule).toHaveProperty('branch');
    expect(schedule).toHaveProperty('classType');
    expect(schedule).toHaveProperty('classProfile');
  });
});

