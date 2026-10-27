import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppFeedbackProvider } from '../app-feedback';
import { PublicExperience } from './public-experience';

const account = vi.hoisted(() => ({
  siteConfig: vi.fn(),
  profile: vi.fn(),
  updateProfile: vi.fn(),
}));

vi.mock('next/navigation', () => ({ usePathname: () => '/classes' }));
vi.mock('@/api-clients/account-client', async (original) => ({
  ...(await original<typeof import('@/api-clients/account-client')>()),
  accountClient: account,
}));
vi.mock('../../session-context', () => ({
  useSessionContext: () => ({
    session: { roles: ['CUSTOMER'], displayName: 'Nadia', preferredBranch: null, branches: [] },
    refresh: vi.fn(),
  }),
}));

const studios = ['Daily Dose Green Garden', 'Daily Dose Muara Karang', 'Daily Dose Untar Kampus 2'].map(
  (name, index) => ({
    id: `branch-${index}`,
    name,
    code: `B${index}`,
    timezone: 'Asia/Jakarta',
    supportWhatsappE164: null,
  }),
);

describe('PublicExperience studio chooser', () => {
  beforeEach(() => {
    account.siteConfig.mockResolvedValue({ branches: studios, fallbackWhatsappE164: null });
    account.profile.mockResolvedValue({
      displayName: 'Nadia',
      preferredBranch: null,
      version: 1,
    });
  });

  it('keeps "Simpan studio" in the dialog footer, outside the scrolling list, and does not repeat the default note on every studio', async () => {
    render(
      <AppFeedbackProvider>
        <PublicExperience>
          <div />
        </PublicExperience>
      </AppFeedbackProvider>,
    );

    const save = await screen.findByRole('button', { name: 'Simpan studio' });
    expect(save.closest('[data-overlay-footer]')).not.toBeNull();
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
    // Area gulir yang memuat daftar studio tidak memuat tombol simpan.
    const scroller = radios[0]!.closest('.overflow-y-auto');
    expect(scroller).not.toBeNull();
    expect(scroller!.contains(save)).toBe(false);
    expect(screen.queryByText(/Menjadi default untuk aktivitas baru/)).toBeNull();
  });
});
