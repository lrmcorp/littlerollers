import { PolicyService } from '../identity/policy.service';
import { LedgerService } from './ledger.service';

describe('LedgerService production gate', () => {
  const admin = {
    sessionId: 'session',
    userId: 'admin',
    roles: [],
    capabilities: ['ledger:read', 'ledger:adjust:request'],
    branchIds: [],
  };

  it('keeps reads available while adjustment mutations are disabled', async () => {
    const service = new LedgerService(
      {} as never,
      new PolicyService(),
      {} as never,
      { value: { sessionAdjustment: { enabled: false } } } as never,
    );
    await expect(
      service.requestAdjustment(
        admin,
        {
          customerPackageId: '00000000-0000-4000-8000-000000000001',
          quantity: 1,
          reasonCode: 'PACKAGE_COMPENSATION',
        },
        'key',
        'correlation',
      ),
    ).rejects.toMatchObject({ code: 'CONFIGURATION_REQUIRED' });
  });
});
