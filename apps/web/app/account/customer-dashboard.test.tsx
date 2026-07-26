import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CustomerDashboard } from './customer-dashboard';

const session = vi.hoisted(() => ({
  displayName: 'Nadia Customer',
  roles: ['CUSTOMER'],
  identityVerificationStatus: 'PENDING',
}));

vi.mock('../session-context', () => ({
  useSessionContext: () => ({ session }),
}));

vi.mock('../identity-verification-client', () => ({
  verificationClient: {
    mine: vi.fn().mockResolvedValue({
      status: 'PENDING',
      documents: [
        { id: 'selfie', kind: 'SELFIE', status: 'PENDING' },
        { id: 'ktp', kind: 'KTP_FRONT', status: 'APPROVED' },
      ],
    }),
  },
}));

describe('customer dashboard', () => {
  it('shows verification progress and locks transactional actions while pending', async () => {
    render(<CustomerDashboard />);

    expect(screen.getByRole('heading', { name: 'Halo, Nadia Customer' })).toBeVisible();
    expect(await screen.findByText('Selfie')).toBeVisible();
    expect(screen.getByText('KTP depan')).toBeVisible();
    expect(screen.getByRole('link', { name: /Jadwal kelas/ })).toHaveAttribute('href', '/classes');
    expect(screen.getByLabelText('Paket saya terkunci')).toBeVisible();
    expect(screen.getByLabelText('Booking terkunci')).toBeVisible();
    expect(screen.queryByRole('link', { name: /Buka booking/ })).not.toBeInTheDocument();
  });
});
