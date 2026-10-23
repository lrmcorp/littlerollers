import { describe, expect, it } from 'vitest';
import { ADMIN_PAGE_SIZE, pageOffset } from './pagination';

describe('pagination helpers', () => {
  it('uses the API page size of 10', () => {
    expect(ADMIN_PAGE_SIZE).toBe(10);
  });

  it('computes the starting row number offset for cursor pages', () => {
    expect(pageOffset(0)).toBe(0);
    expect(pageOffset(1)).toBe(ADMIN_PAGE_SIZE);
    expect(pageOffset(3)).toBe(3 * ADMIN_PAGE_SIZE);
    expect(pageOffset(2, 10)).toBe(20);
  });
});
