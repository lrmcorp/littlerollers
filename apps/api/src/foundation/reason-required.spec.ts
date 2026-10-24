import { ClassSlotService } from '../classes/slot-kelas.service';
import { AssignmentService } from '../identity/assignment.service';
import { IdentityDocumentWorkflowService } from '../identity/identity-document-workflow.service';
import { PolicyService } from '../identity/policy.service';
import { PaymentReviewService } from '../packages/verifikasi-pembayaran.service';
import { requireReason } from './reason';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const principal = {
  sessionId: 's',
  userId: id(1),
  roles: [{ role: 'SUPER_OWNER' as const, branchId: null }],
  capabilities: ['branch:all', 'assignment:manage', 'class-slot:manage', 'identity-verification:decide'],
  branchIds: [] as string[],
};
const BAD = [undefined, '', '   ', 'ab', 'x'.repeat(501)];

describe('requireReason', () => {
  it('trims and returns a valid reason, and rejects anything outside 3–500 characters', () => {
    expect(requireReason('  Salah input  ')).toBe('Salah input');
    for (const bad of BAD) expect(() => requireReason(bad)).toThrow(expect.objectContaining({ code: 'VALIDATION_ERROR' }));
  });
});

describe('ending an assignment needs a reason', () => {
  it('refuses without one before touching any data', async () => {
    const db = { ownerCabang: { findUnique: jest.fn() }, penugasanInstruktur: { findUnique: jest.fn() } };
    const service = new AssignmentService(db as never, new PolicyService(), { catat: jest.fn() } as never);
    for (const reason of BAD)
      await expect(
        service.end(principal as never, id(9), { effectiveAt: '2026-10-24T00:00:00Z', reason: reason as never }, 'c'),
      ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    expect(db.ownerCabang.findUnique).not.toHaveBeenCalled();
  });
});

describe('cancelling a class needs a known reason code, and a note for "other"', () => {
  const service = new ClassSlotService(
    { slotKelas: { findUnique: jest.fn() } } as never,
    new PolicyService(),
    {} as never,
    { value: { quotaEvaluation: { maxAttempts: 5 } } } as never,
  );
  const key = '1234567890123456';
  it.each([
    [undefined, undefined],
    ['LAINNYA', undefined],
    ['OTHER_REVIEW_REQUIRED', undefined],
    ['OTHER_REVIEW_REQUIRED', 'ab'],
  ])('refuses code %s with note %s', async (reasonCode, note) => {
    await expect(
      service.cancel(principal as never, id(5), { reasonCode: reasonCode as never, note, expectedVersion: 1 }, key, 'c'),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });
});

describe('rejecting a payment needs a reason code', () => {
  it('refuses a rejection without one', async () => {
    const service = new PaymentReviewService({} as never, {} as never, { review: jest.fn() } as never);
    await expect(
      service.decide(principal as never, id(5), 'REJECTED', {}, 'idem-key-1', 'c'),
    ).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });
});

describe('rejecting an identity document needs a reason code (and a note for "other"), and every decision is audited', () => {
  const setup = () => {
    const db = {
      profilPengguna: {
        findUnique: jest.fn().mockResolvedValue({ notes: null }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
    const audit = { catat: jest.fn().mockResolvedValue(undefined) };
    const service = new IdentityDocumentWorkflowService(db as never, new PolicyService(), undefined, audit as never);
    return { db, audit, service };
  };
  const docId = `doc-ktp-${id(7)}`;
  const reject = (s: ReturnType<typeof setup>, input: Record<string, unknown>) =>
    s.service.decideIdentityDocument(principal as never, docId, 'REJECTED', { expectedVersion: 1, ...input } as never, 'c');

  it('refuses a rejection without a code, or "other" without a note, and writes nothing', async () => {
    const s = setup();
    await expect(reject(s, {})).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    for (const note of BAD)
      await expect(reject(s, { reasonCode: 'OTHER_REQUIRES_NOTE', note })).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    expect(s.db.profilPengguna.updateMany).not.toHaveBeenCalled();
    expect(s.audit.catat).not.toHaveBeenCalled();
  });

  it('stores the real reason (never an invented default) and records it in the permanent audit', async () => {
    const s = setup();
    await reject(s, { reasonCode: 'BLURRY', note: ' Foto buram ' });
    const notes = s.db.profilPengguna.updateMany.mock.calls[0]![0].data.notes as string;
    expect(notes).toMatch(/^KYC_REJECTED: BLURRY: Foto buram /);
    expect(notes).not.toContain('valid');
    expect(s.audit.catat).toHaveBeenCalledWith(
      null,
      expect.objectContaining({ action: 'identity_document.rejected', objectType: 'IdentityDocument', targetUserId: id(7), reason: 'BLURRY: Foto buram' }),
    );
    const bare = setup();
    await reject(bare, { reasonCode: 'BLURRY' });
    expect(bare.audit.catat).toHaveBeenCalledWith(null, expect.objectContaining({ reason: 'BLURRY' }));
  });

  it('approving needs no note', async () => {
    const { audit, service } = setup();
    await service.decideIdentityDocument(principal as never, docId, 'APPROVED', { expectedVersion: 1 }, 'c');
    expect(audit.catat).toHaveBeenCalledWith(null, expect.objectContaining({ action: 'identity_document.approved', reason: null }));
  });
});
