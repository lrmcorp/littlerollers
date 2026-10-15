import { describe, expect, it, vi } from 'vitest';
import * as metadataModule from '@/lib/public-detail-metadata';
import ClassDetailPage from '@/classes/[slug]/page';
import StudioDetailPage from '@/locations/[slug]/page';
import ScheduleDetailPage from '@/schedule/[id]/page';
import PackageDetailPage from '@/packages/[id]/page';

// Mock next/navigation notFound
const notFoundMock = vi.fn(() => {
  const error = new Error('NEXT_NOT_FOUND');
  (error as any).digest = 'NEXT_NOT_FOUND';
  throw error;
});

vi.mock('next/navigation', () => ({
  notFound: () => notFoundMock(),
}));

describe('Dynamic slug 404 handling (Poin 14)', () => {
  it('triggers notFound() when class type slug is not found', async () => {
    vi.spyOn(metadataModule, 'publicMetadataValue').mockResolvedValue(null);

    await expect(
      ClassDetailPage({ params: Promise.resolve({ slug: 'non-existent-class' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFoundMock).toHaveBeenCalled();
  });

  it('triggers notFound() when studio slug is not found', async () => {
    vi.spyOn(metadataModule, 'publicMetadataValue').mockResolvedValue(null);

    await expect(
      StudioDetailPage({ params: Promise.resolve({ slug: 'non-existent-studio' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFoundMock).toHaveBeenCalled();
  });

  it('triggers notFound() when schedule id is not found', async () => {
    vi.spyOn(metadataModule, 'publicMetadataValue').mockResolvedValue(null);

    await expect(
      ScheduleDetailPage({ params: Promise.resolve({ id: 'non-existent-schedule' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFoundMock).toHaveBeenCalled();
  });

  it('triggers notFound() when package id is not found', async () => {
    vi.spyOn(metadataModule, 'publicMetadataValue').mockResolvedValue(null);

    await expect(
      PackageDetailPage({ params: Promise.resolve({ id: 'non-existent-package' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFoundMock).toHaveBeenCalled();
  });
});
