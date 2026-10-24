import { CustomerManagementService } from './manajemen-pelanggan.service';
import { maskContactEmail, maskContactPhone, maskCustomerProfile } from './customer-visibility';
import { PolicyService } from './policy.service';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const branchA = id(2);
const branchB = id(3);

const staff = (over: Record<string, unknown> = {}) => ({
  sessionId: 's',
  userId: id(1),
  roles: [] as never,
  capabilities: ['customer:read'],
  branchIds: [branchA],
  ...over,
});

const row = (n: number, over: Record<string, unknown> = {}) => ({
  id: id(100 + n),
  displayName: `Pelanggan ${n}`,
  email: `rina${n}@example.test`,
  phone: `+62812345678${n}`,
  status: 'ACTIVE',
  preferredBranchId: branchA,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  stoppedAt: null,
  profile: { id: `p${n}`, userId: id(100 + n), fullName: `Pelanggan ${n}`, nik: '3171000000000001', address: 'Jl. Rahasia 1', ktpUrl: 'k.jpg', selfieUrl: 's.jpg', emergencyContactPhone: '+62811', notes: 'KYC_APPROVED' },
  customerPackages: [],
  purchases: [],
  bookings: [],
  _count: { customerPackages: 0, bookings: 1, purchases: 1 },
  ...over,
});

function setup(rows: ReturnType<typeof row>[], history: { bookings?: string[]; purchases?: string[] } = {}) {
  const db = {
    user: {
      findMany: jest.fn().mockResolvedValue(rows),
      count: jest.fn().mockResolvedValue(rows.length),
      findFirst: jest.fn().mockResolvedValue(rows[0] ?? null),
    },
    cabang: { findUnique: jest.fn().mockResolvedValue(null) },
    pemesananKelas: { findMany: jest.fn().mockResolvedValue((history.bookings ?? []).map((userId) => ({ userId }))) },
    pembelian: { findMany: jest.fn().mockResolvedValue((history.purchases ?? []).map((userId) => ({ userId }))) },
  };
  return { db, service: new CustomerManagementService(db as never, new PolicyService()) };
}

describe('contact masking helpers', () => {
  it('keeps just enough to recognise a contact, never the whole value', () => {
    expect(maskContactEmail('rina@example.test')).toBe('ri**@example.test');
    expect(maskContactPhone('+6281234567890')).toBe('+6281******890');
    expect(maskContactEmail(null)).toBeNull();
    expect(maskContactPhone(undefined)).toBeNull();
  });

  it('blanks personal data in a profile but keeps its shape', () => {
    const masked = maskCustomerProfile(row(1).profile)!;
    expect(masked).toMatchObject({ fullName: 'Pelanggan 1', nik: null, address: null, ktpUrl: null, selfieUrl: null, emergencyContactPhone: null, notes: null });
  });
});

describe('customer list: contact visibility by branch (option D)', () => {
  it('shows contacts of own-branch and unattached customers, masks customers tied only to other branches', async () => {
    const mine = row(1);
    const elsewhere = row(2, { preferredBranchId: branchB });
    const served = row(3, { preferredBranchId: branchB });
    const unattached = row(4, { preferredBranchId: null, _count: { customerPackages: 0, bookings: 0, purchases: 0 } });
    const { service, db } = setup([mine, elsewhere, served, unattached], { bookings: [served.id] });

    const result = await service.list(staff() as never, {});
    const byId = Object.fromEntries(result.items.map((item) => [item.id, item]));

    expect(byId[mine.id]).toMatchObject({ email: mine.email, phoneE164: mine.phone, contactMasked: false });
    expect(byId[served.id]).toMatchObject({ email: served.email, contactMasked: false });
    expect(byId[unattached.id]).toMatchObject({ email: unattached.email, contactMasked: false });
    expect(byId[elsewhere.id]).toMatchObject({ contactMasked: true, email: 'ri***@example.test' });
    expect(byId[elsewhere.id]!.phoneE164).not.toBe(elsewhere.phone);
    expect(byId[elsewhere.id]!.profile).toMatchObject({ nik: null, address: null, ktpUrl: null });
    // Hanya pelanggan yang belum jelas keterkaitannya yang ditanyakan ke tabel booking/pembelian, dibatasi cabang staf.
    expect(db.pemesananKelas.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: { in: [elsewhere.id, served.id] }, classSlot: { branchId: { in: [branchA] } } } }),
    );
  });

  it('never masks for cross-branch staff, and skips the history queries entirely', async () => {
    const elsewhere = row(2, { preferredBranchId: branchB });
    const { service, db } = setup([elsewhere]);
    const result = await service.list(staff({ capabilities: ['customer:read', 'branch:all'], branchIds: [] }) as never, {});
    expect(result.items[0]).toMatchObject({ email: elsewhere.email, phoneE164: elsewhere.phone, contactMasked: false });
    expect(db.pemesananKelas.findMany).not.toHaveBeenCalled();
  });

  it('still reports verification status from the real profile for masked customers', async () => {
    const elsewhere = row(2, { preferredBranchId: branchB });
    const { service } = setup([elsewhere]);
    const result = await service.list(staff() as never, {});
    expect(result.items[0]!.verificationStatus).toBeDefined();
    expect(result.items[0]!.verificationStatus).not.toBeNull();
  });
});

describe('customer detail: contact visibility by branch', () => {
  it('masks contact, personal profile data, documents and payment proofs for a customer of another branch', async () => {
    const elsewhere = row(2, {
      preferredBranchId: branchB,
      purchases: [
        {
          id: 'pb1', invoiceNumber: 'INV-1', status: 'PAID', subtotalRp: 1, totalAmountRp: 1, createdAt: new Date(), paidAt: new Date(),
          paymentMethod: 'TRANSFER', package: { name: 'Paket' }, branch: { name: 'Cabang B' }, paymentProof: { fileUrl: 'bukti.jpg' },
        },
      ],
    });
    const { service } = setup([elsewhere]);
    const detail = await service.detail(staff() as never, elsewhere.id);
    expect(detail).toMatchObject({ contactMasked: true, email: 'ri***@example.test', identityDocuments: [] });
    expect(detail.phoneE164).not.toBe(elsewhere.phone);
    expect(detail.profile).toMatchObject({ nik: null, address: null, ktpUrl: null });
    expect(detail.purchases[0]).toMatchObject({ paymentProofUrl: null });
  });

  it('shows everything for a customer tied to the staff branch', async () => {
    const mine = row(1, {
      purchases: [
        {
          id: 'pa1', invoiceNumber: 'INV-2', status: 'PAID', subtotalRp: 1, totalAmountRp: 1, createdAt: new Date(), paidAt: new Date(),
          paymentMethod: 'TRANSFER', package: { name: 'Paket' }, branch: { name: 'Cabang A' }, paymentProof: { fileUrl: 'bukti.jpg' },
        },
      ],
    });
    const { service } = setup([mine]);
    const detail = await service.detail(staff() as never, mine.id);
    expect(detail).toMatchObject({ contactMasked: false, email: mine.email, phoneE164: mine.phone });
    expect(detail.profile).toMatchObject({ nik: '3171000000000001', address: 'Jl. Rahasia 1' });
    expect(detail.purchases[0]).toMatchObject({ paymentProofUrl: 'bukti.jpg' });
    expect(detail.identityDocuments.length).toBeGreaterThan(0);
  });
});

describe('customer writes use the same rule (404 for staff accounts and other-branch customers)', () => {
  const writer = (over: Record<string, unknown> = {}) => staff({ capabilities: ['customer:read', 'customer:write', 'customer:manage'], ...over });
  const build = (found: ReturnType<typeof row> | null, history: { bookings?: string[]; purchases?: string[] } = {}) => {
    const tx = {
      user: {
        findFirst: jest.fn().mockResolvedValue(found),
        update: jest.fn().mockResolvedValue({ id: found?.id, displayName: 'x', status: 'ACTIVE' }),
      },
      profilPengguna: { upsert: jest.fn() },
      pemesananKelas: { findMany: jest.fn().mockResolvedValue((history.bookings ?? []).map((userId) => ({ userId }))) },
      pembelian: { findMany: jest.fn().mockResolvedValue((history.purchases ?? []).map((userId) => ({ userId }))) },
    };
    const db = { ...tx, $transaction: jest.fn(async (fn: (t: typeof tx) => unknown) => fn(tx)) };
    return { tx, service: new CustomerManagementService(db as never, new PolicyService()) };
  };

  it('looks only among customer accounts, so a staff id cannot be edited through the customer endpoint', async () => {
    const { tx, service } = build(null);
    await expect(
      service.updateProfile(writer() as never, id(1), { displayName: 'Baru', email: 'x@example.test' }, '', '', 'c'),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
    expect(tx.user.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: id(1), role: { in: ['CUSTOMER', 'MEMBER'] } } }),
    );
    expect(tx.user.update).not.toHaveBeenCalled();
  });

  it('refuses profile edits, document uploads and stop-marking for another branch customer', async () => {
    const other = row(2, { preferredBranchId: branchB, _count: { customerPackages: 0, bookings: 2, purchases: 0 } });
    const { tx, service } = build(other);
    await expect(service.updateProfile(writer() as never, other.id, { displayName: 'Baru' }, '', '', 'c')).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await expect(service.uploadDocument(writer() as never, other.id, 'KTP_FRONT', { base64: 'aGk=' })).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await expect(service.markStopped(writer() as never, other.id)).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await expect(service.unmarkStopped(writer() as never, other.id)).rejects.toMatchObject({ code: 'NOT_FOUND' });
    expect(tx.user.update).not.toHaveBeenCalled();
  });

  it('lets cross-branch staff and staff who served the customer proceed', async () => {
    const other = row(2, { preferredBranchId: branchB, _count: { customerPackages: 0, bookings: 2, purchases: 0 } });
    const global = build(other);
    await global.service.updateProfile(writer({ capabilities: ['customer:read', 'customer:write', 'customer:manage', 'branch:all'], branchIds: [] }) as never, other.id, { displayName: 'Baru' }, '', '', 'c');
    expect(global.tx.user.update).toHaveBeenCalled();
    const served = build(other, { bookings: [other.id] });
    await served.service.updateProfile(writer() as never, other.id, { displayName: 'Baru' }, '', '', 'c');
    expect(served.tx.user.update).toHaveBeenCalled();
  });
});
