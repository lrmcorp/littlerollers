import { PolicyService } from '../identity/policy.service';
import { KioskAccessService } from './kiosk-access.service';

const branchId = '00000000-0000-4000-8000-000000000001';
const now = new Date('2026-10-27T03:00:00Z');

const superOwner = {
  sessionId: 's',
  userId: '00000000-0000-4000-8000-000000000100',
  roles: [] as never,
  capabilities: ['branch:manage', 'branch:all'],
  branchIds: [] as string[],
};

function setup(branchOverrides: Record<string, unknown> = {}) {
  const rows: Record<string, unknown> = {
    id: branchId,
    code: 'DD-GG',
    name: 'Daily Dose Green Garden',
    kioskPinHash: null,
    kioskPinUpdatedAt: null,
    ...branchOverrides,
  };
  const cabang = {
    findFirst: jest.fn().mockImplementation(async () => ({ ...rows })),
    findUnique: jest.fn().mockImplementation(async () => ({ ...rows })),
    findMany: jest.fn().mockImplementation(async () => [{ ...rows }]),
    update: jest.fn().mockImplementation(async ({ data }) => {
      Object.assign(rows, data);
      return { ...rows };
    }),
  };
  const rateLimit = { consume: jest.fn().mockResolvedValue(undefined) };
  const audit = { catat: jest.fn().mockResolvedValue(undefined) };
  const service = new KioskAccessService(
    { cabang } as never,
    new PolicyService(),
    rateLimit as never,
    audit as never,
  );
  return { service, cabang, rateLimit, audit };
}

describe('KioskAccessService', () => {
  it('stays locked until staff create a PIN, and never stores the PIN itself', async () => {
    const { service, cabang } = setup();
    await expect(service.unlock('dd-gg', '123456', 'tablet', now)).rejects.toMatchObject({ code: 'KIOSK_NOT_CONFIGURED' });
    await expect(service.requireAccess('dd-gg', '1.x', now)).rejects.toMatchObject({ code: 'KIOSK_LOCKED' });

    const created = await service.rotatePin(superOwner, branchId, 'c');
    expect(created.pin).toMatch(/^\d{6}$/);
    const stored = cabang.update.mock.calls[0]![0].data.kioskPinHash as string;
    expect(stored).toMatch(/^[0-9a-f]{64}$/);
    expect(stored).not.toContain(created.pin);
  });

  it('opens with the right PIN and returns a token the display endpoint accepts', async () => {
    const { service } = setup();
    const { pin } = await service.rotatePin(superOwner, branchId, 'c');
    const { token, expiresAt } = await service.unlock('dd-gg', pin, 'tablet', now);
    expect(new Date(expiresAt).getTime()).toBeGreaterThan(now.getTime() + 29 * 86_400_000);
    await expect(service.requireAccess('dd-gg', token, now)).resolves.toMatchObject({ id: branchId });
  });

  it('refuses a wrong or malformed PIN', async () => {
    const { service } = setup();
    const { pin } = await service.rotatePin(superOwner, branchId, 'c');
    const wrong = pin === '000000' ? '000001' : '000000';
    await expect(service.unlock('dd-gg', wrong, 'tablet', now)).rejects.toMatchObject({ code: 'KIOSK_PIN_INVALID' });
    for (const bad of ['12345', '1234567', 'abcdef', '', null, 123456])
      await expect(service.unlock('dd-gg', bad, 'tablet', now)).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('rejects forged, expired, and other-branch tokens', async () => {
    const { service } = setup();
    const { pin } = await service.rotatePin(superOwner, branchId, 'c');
    const { token } = await service.unlock('dd-gg', pin, 'tablet', now);
    const [expires] = token.split('.');
    await expect(service.requireAccess('dd-gg', `${expires}.${'0'.repeat(64)}`, now)).rejects.toMatchObject({ code: 'KIOSK_LOCKED' });
    await expect(service.requireAccess('dd-gg', undefined, now)).rejects.toMatchObject({ code: 'KIOSK_LOCKED' });
    const later = new Date(now.getTime() + 31 * 86_400_000);
    await expect(service.requireAccess('dd-gg', token, later)).rejects.toMatchObject({ code: 'KIOSK_LOCKED' });
  });

  it('changing the PIN revokes every token issued before', async () => {
    const { service } = setup();
    const first = await service.rotatePin(superOwner, branchId, 'c');
    const { token } = await service.unlock('dd-gg', first.pin, 'tablet', now);
    await service.rotatePin(superOwner, branchId, 'c');
    await expect(service.requireAccess('dd-gg', token, now)).rejects.toMatchObject({ code: 'KIOSK_LOCKED' });
  });

  it('rate-limits unlock attempts per tablet and per branch before checking the PIN', async () => {
    const { service, rateLimit } = setup();
    const { pin } = await service.rotatePin(superOwner, branchId, 'c');
    await service.unlock('dd-gg', pin, 'tablet', now);
    expect(rateLimit.consume).toHaveBeenCalledWith('kiosk-unlock', expect.any(String), 6, 900);
    expect(rateLimit.consume).toHaveBeenCalledWith('kiosk-unlock-branch', branchId, 30, 900);

    rateLimit.consume.mockRejectedValueOnce({ code: 'RATE_LIMITED' });
    await expect(service.unlock('dd-gg', pin, 'tablet', now)).rejects.toMatchObject({ code: 'RATE_LIMITED' });
  });

  it('only branch managers can create or list PINs, and the action is audited', async () => {
    const { service, audit } = setup();
    const nobody = { ...superOwner, capabilities: [] as string[] };
    await expect(service.list(nobody)).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(service.rotatePin(nobody, branchId, 'c')).rejects.toMatchObject({ code: 'FORBIDDEN' });
    const otherBranchManager = { ...superOwner, capabilities: ['branch:manage'], branchIds: ['other'] };
    await expect(service.rotatePin(otherBranchManager, branchId, 'c')).rejects.toMatchObject({ code: 'RESOURCE_NOT_FOUND' });

    const { pin } = await service.rotatePin(superOwner, branchId, 'corr-1');
    expect(audit.catat).toHaveBeenCalledWith(null, expect.objectContaining({ action: 'kiosk.pin_rotated', objectId: branchId }));
    const entry = JSON.stringify(audit.catat.mock.calls[0]![1]);
    expect(entry).not.toContain(`"${pin}"`);
    expect(entry).not.toMatch(/"pin"|kioskPinHash/);
  });

  it('lists branches with whether a PIN exists, never the PIN', async () => {
    const { service } = setup();
    expect((await service.list(superOwner)).items[0]).toMatchObject({ configured: false, updatedAt: null });
    await service.rotatePin(superOwner, branchId, 'c');
    const listed = await service.list(superOwner);
    expect(listed.items[0]).toMatchObject({ configured: true });
    expect(JSON.stringify(listed)).not.toMatch(/pin"|kioskPinHash/i);
  });
});
