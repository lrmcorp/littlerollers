import { PolicyService } from '../identity/policy.service';
import { PackageAccessService } from './package-access.service';
import { PaymentAccountService } from './rekening-pembayaran.service';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const branchA = id(1);
const branchB = id(2);
const accountId = id(10);

const principalFor = (capabilities: string[], branchIds = [branchA]) => ({
  sessionId: 's',
  userId: id(100),
  roles: [] as never,
  capabilities,
  branchIds,
});
const manager = principalFor(['payment-account:manage', 'payment-account:read']);

const row = (overrides: Record<string, unknown> = {}) => ({
  id: accountId,
  branchId: branchA,
  bankName: 'BCA',
  accountNumber: '5270001511',
  accountHolder: 'PT Daily Dose',
  active: true,
  createdAt: new Date('2026-01-01'),
  ...overrides,
});

function setup(account: Record<string, unknown> | null = row()) {
  const tx = {
    rekeningPembayaran: {
      findUnique: jest.fn().mockResolvedValue(account),
      update: jest
        .fn()
        .mockImplementation(async ({ data }) => ({ ...(account ?? {}), ...data })),
    },
  };
  const db = { $transaction: jest.fn(async (fn: (t: typeof tx) => unknown) => fn(tx)) };
  const audit = { record: jest.fn() };
  const access = new PackageAccessService({} as never, new PolicyService(), audit as never);
  const service = new PaymentAccountService(db as never, access, {} as never, audit as never);
  return { service, tx, audit };
}

describe('PaymentAccountService.update', () => {
  it('requires payment-account:manage and hides accounts of another branch', async () => {
    const { service, tx } = setup();
    await expect(
      service.update(principalFor(['payment-account:read']), accountId, { bankName: 'BNI', accountHolderName: 'X' }, 'c'),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(
      service.update(
        principalFor(['payment-account:manage'], [branchB]),
        accountId,
        { bankName: 'BNI', accountHolderName: 'X' },
        'c',
      ),
    ).rejects.toMatchObject({ code: 'RESOURCE_NOT_FOUND' });
    expect(tx.rekeningPembayaran.update).not.toHaveBeenCalled();
  });

  it('validates the bank, holder and number', async () => {
    const { service, tx } = setup();
    const bad = [
      { bankName: '', accountHolderName: 'X' },
      { bankName: 'BNI', accountHolderName: '  ' },
      { bankName: 'x'.repeat(65), accountHolderName: 'X' },
      { bankName: 'BNI', accountHolderName: 'x'.repeat(129) },
      { bankName: 'BNI', accountHolderName: 'X', accountNumber: 'abc' },
    ];
    for (const input of bad)
      await expect(service.update(manager, accountId, input, 'c')).rejects.toMatchObject({
        code: 'VALIDATION_ERROR',
      });
    expect(tx.rekeningPembayaran.update).not.toHaveBeenCalled();
  });

  it('keeps the account number when it is left blank', async () => {
    const { service, tx, audit } = setup();
    const result = await service.update(
      manager,
      accountId,
      { bankName: ' BNI ', accountHolderName: ' PT Baru ', accountNumber: '  ' },
      'c',
    );
    expect(tx.rekeningPembayaran.update).toHaveBeenCalledWith({
      where: { id: accountId },
      data: { bankName: 'BNI', accountHolder: 'PT Baru' },
    });
    expect(result).toMatchObject({ bankName: 'BNI', accountHolderName: 'PT Baru', maskedAccountNumber: '•••• 1511' });
    expect(audit.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'PAYMENT_ACCOUNT_UPDATED',
        details: expect.objectContaining({ accountNumberChanged: false }),
      }),
    );
  });

  it('normalizes and replaces the account number, never writing it to the audit trail', async () => {
    const { service, tx, audit } = setup();
    await service.update(
      manager,
      accountId,
      { bankName: 'BCA', accountHolderName: 'PT Daily Dose', accountNumber: '123-456-7890' },
      'c',
    );
    expect(tx.rekeningPembayaran.update).toHaveBeenCalledWith({
      where: { id: accountId },
      data: expect.objectContaining({ accountNumber: '1234567890' }),
    });
    expect(JSON.stringify(audit.record.mock.calls)).not.toContain('1234567890');
    expect(JSON.stringify(audit.record.mock.calls)).toContain('•••• 7890');
  });

  it('returns not found for a missing account', async () => {
    await expect(
      setup(null).service.update(manager, accountId, { bankName: 'BCA', accountHolderName: 'X' }, 'c'),
    ).rejects.toMatchObject({ code: 'RESOURCE_NOT_FOUND' });
  });
});
