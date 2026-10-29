import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PublicPackage, PublicPackageCatalogClient } from './public-package-catalog-client';
import {
  packageCtaHref,
  packageCtaLabel,
  packageDescriptor,
  packageJourneyCopy,
  PublicPackagesView,
  publicBranchLocation,
  recommendedFirst,
  recommendedPackageId,
} from './packages/public-packages-view';
import { packageAudienceState } from './session-audience';
import type { WebSession } from './session-client';

const branch = {
  id: 'branch-1',
  code: 'LR-JKT',
  name: 'Little Rollers Jakarta',
  timezone: 'Asia/Jakarta',
};

const packages: PublicPackage[] = [
  {
    id: 'package-starter',
    branchId: branch.id,
    name: 'Movers Starter',
    sessionCount: 4,
    durationDays: 30,
    priceRp: 1_200_000,
    effectiveUntil: null,
    classType: { id: 'type-private', code: 'PRIVATE', name: 'Private Class' },
  },
  {
    id: 'package-routine',
    branchId: branch.id,
    name: 'Movers Routine',
    sessionCount: 8,
    durationDays: 60,
    priceRp: 2_000_000,
    effectiveUntil: null,
    classType: { id: 'type-reformer', code: 'MOVERS', name: 'Movers' },
  },
  {
    id: 'package-commitment',
    branchId: branch.id,
    name: 'Movers Commitment',
    sessionCount: 12,
    durationDays: 90,
    priceRp: 2_700_000,
    effectiveUntil: null,
    classType: { id: 'type-reformer', code: 'MOVERS', name: 'Movers' },
  },
];

const approvedCustomer: WebSession = {
  id: 'customer-1',
  displayName: 'Nadia Customer',
  roles: ['CUSTOMER'],
  branchIds: [],
  capabilities: ['customer:self'],
  identityVerificationStatus: 'APPROVED',
  sessionExpiresAt: new Date(Date.now() + 60_000),
  branches: [],
};

const superOwner: WebSession = {
  ...approvedCustomer,
  id: 'super-owner-1',
  displayName: 'Super Owner',
  roles: ['SUPER_OWNER'],
  capabilities: ['branch:all'],
  identityVerificationStatus: 'NOT_REQUIRED',
};

describe('public package catalog', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/packages');
  });

  it('requires an explicit studio and renders authoritative commercial values', async () => {
    const client: PublicPackageCatalogClient = {
      list: vi
        .fn()
        .mockResolvedValueOnce({ branches: [branch], items: [] })
        .mockResolvedValueOnce({ branches: [branch], items: [packages[0]!] }),
    };
    const view = render(<PublicPackagesView client={client} />);
    expect(await screen.findByText('Pilih studio untuk melihat paket')).toBeVisible();
    expect(screen.queryByText('Movers Starter')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Little Rollers Jakarta/ }));
    expect(await screen.findByRole('heading', { name: 'Movers Starter' })).toBeVisible();
    expect(screen.getByText(/Rp\s*1\.200\.000/)).toBeVisible();
    expect(screen.getByText('4 sesi')).toBeVisible();
    expect(screen.getByText('30 hari')).toBeVisible();
    expect(screen.getByText('Tersedia untuk pembelian')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Masuk untuk memilih' })).toHaveAttribute(
      'href',
      '/sign-in?returnTo=%2Fcheckout%3Fpackage%3Dpackage-starter%26branch%3Dbranch-1',
    );
    await waitFor(() => expect(client.list).toHaveBeenCalledTimes(2));
    expect((await axe(view.container)).violations).toHaveLength(0);
  }, 30_000);

  it('orders the recommendation first and derives customer-facing descriptors', () => {
    const recommendedId = recommendedPackageId(packages);
    expect(recommendedId).toBe('package-commitment');
    expect(recommendedFirst(packages, recommendedId).map(({ id }) => id)).toEqual([
      'package-commitment',
      'package-starter',
      'package-routine',
    ]);
    expect(packageDescriptor(packages[2]!, packages, recommendedId)).toBe(
      'Nilai terbaik untuk latihan rutin',
    );
    expect(packageDescriptor(packages[0]!, packages, recommendedId)).toBe(
      'Cocok untuk mulai mencoba',
    );
    expect(packageDescriptor(packages[1]!, packages, recommendedId)).toBe(
      'Fleksibel untuk latihan mingguan',
    );
  });

  it('shows the normal price as a semantic deletion when a promotion is live', async () => {
    const promotedPackage: PublicPackage = {
      ...packages[0]!,
      effectivePriceRp: 1_080_000,
      promotion: {
        id: 'promotion-1',
        name: 'Promo Pembukaan',
        label: 'Promo 10%',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        discountRp: 120_000,
        promotionalPriceRp: 1_080_000,
        activeFrom: '2026-07-01T00:00:00.000Z',
        activeUntil: '2026-08-01T00:00:00.000Z',
        version: 1,
      },
    };
    const client: PublicPackageCatalogClient = {
      list: vi
        .fn()
        .mockResolvedValueOnce({ branches: [branch], items: [] })
        .mockResolvedValueOnce({ branches: [branch], items: [promotedPackage] }),
    };

    render(<PublicPackagesView client={client} />);
    await userEvent.click(await screen.findByRole('button', { name: /Little Rollers Jakarta/ }));

    expect(await screen.findByLabelText(/Harga normal Rp\s*1\.200\.000/)).toBeVisible();
    expect(screen.getByText('Promo 10%')).toBeVisible();
    expect(screen.getByText(/Rp\s*1\.080\.000/)).toBeVisible();
    expect(screen.getByText(/Hemat Rp\s*120\.000/)).toBeVisible();
  });

  it('uses friendly locations and role-aware CTA labels', () => {
    expect(publicBranchLocation(branch)).toBe('Jakarta · WIB');
    expect(packageCtaLabel(null)).toBe('Masuk untuk memilih');
    expect(packageCtaLabel({ ...approvedCustomer, identityVerificationStatus: 'PENDING' })).toBe(
      'Verifikasi untuk memilih',
    );
    expect(packageCtaLabel(approvedCustomer)).toBe('Pilih paket');
    expect(packageCtaLabel(superOwner)).toBe('Buka Workspace');
    expect(packageCtaLabel({ ...superOwner, roles: ['CUSTOMER', 'SUPER_OWNER'] })).toBe(
      'Buka Workspace',
    );
    expect(packageAudienceState(superOwner)).toBe('STAFF');
    expect(packageJourneyCopy(superOwner)).toBe(
      'Anda sedang menggunakan akun staf. Pembelian paket menggunakan akun customer.',
    );
    expect(packageCtaHref('STAFF', '/checkout?package=one')).toBe('/workspace');
    expect(packageCtaHref('CUSTOMER_APPROVED', '/checkout?package=one')).toBe(
      '/checkout?package=one',
    );
  });

  it('preserves slot while synchronizing studio and class type filters', async () => {
    window.history.replaceState({}, '', '/packages?slot=slot-1');
    const client: PublicPackageCatalogClient = {
      list: vi
        .fn()
        .mockResolvedValueOnce({ branches: [branch], items: [] })
        .mockResolvedValueOnce({ branches: [branch], items: packages }),
    };
    render(<PublicPackagesView client={client} />);

    await userEvent.click(await screen.findByRole('button', { name: /Little Rollers Jakarta/ }));
    await screen.findByRole('heading', { name: 'Movers Commitment' });
    expect(window.location.search).toBe('?slot=slot-1&branch=branch-1');

    await userEvent.click(screen.getByRole('combobox', { name: /Tipe kelas/ }));
    await userEvent.click(await screen.findByRole('option', { name: 'Private Class' }));
    expect(window.location.search).toBe('?slot=slot-1&branch=branch-1&classType=type-private');
    expect(screen.getByRole('heading', { name: 'Movers Starter' })).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Movers Routine' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Reset filter' }));
    expect(window.location.search).toBe('?slot=slot-1&branch=branch-1');
  });

  it('retries safely when the initial catalog dependency is unavailable', async () => {
    const client: PublicPackageCatalogClient = {
      list: vi
        .fn()
        .mockRejectedValueOnce({ response: { status: 503 } })
        .mockResolvedValueOnce({ branches: [branch], items: [] }),
    };
    render(<PublicPackagesView client={client} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Paket sedang tidak tersedia');
    await userEvent.click(screen.getByRole('button', { name: 'Coba lagi' }));
    expect(await screen.findByText('Pilih studio untuk melihat paket')).toBeVisible();
    expect(client.list).toHaveBeenCalledTimes(2);
  });
});
