import 'reflect-metadata';
import { ROLE_CAPABILITIES } from '../identity/role-capabilities';
import { ROLES_KEY } from '../identity/roles.decorator';
import { OperationsAutomationController } from './operations-automation.controller';

const handlerRoles = (name: keyof OperationsAutomationController) =>
  Reflect.getMetadata(ROLES_KEY, OperationsAutomationController.prototype[name]) as string[];

describe('tombol berbahaya otomasi hanya untuk Super Owner', () => {
  it.each(['evaluateAutoCancel', 'evaluateRemindersBatch'] as const)(
    '%s ditolak di server untuk selain SUPER_OWNER',
    (handler) => {
      expect(handlerRoles(handler)).toEqual(['SUPER_OWNER']);
    },
  );

  it('hanya Super Owner yang memegang izin automation:run', () => {
    const holders = Object.entries(ROLE_CAPABILITIES)
      .filter(([, capabilities]) => capabilities.includes('automation:run'))
      .map(([role]) => role)
      .sort();
    expect(holders).toEqual(['SUPER_OWNER']);
  });

  it('Admin dan Manager tetap bisa melihat log pengingat', () => {
    expect(ROLE_CAPABILITIES.ADMIN).toContain('automation:read');
    expect(ROLE_CAPABILITIES.MANAGER).toContain('automation:read');
  });
});
