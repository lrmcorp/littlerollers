import { InstructorManagementService } from './manajemen-instruktur.service';
import { UserAdministrationService } from './user-administration.service';
import { PolicyService } from './policy.service';
import type { SessionPrincipal } from './identity.service';

describe('Isolasi Akun Testing & Instruktur Nonaktif (Poin 13)', () => {
  const superOwner: SessionPrincipal = {
    sessionId: 'sess-1',
    userId: 'super-1',
    roles: [{ role: 'SUPER_OWNER', branchId: null }],
    capabilities: ['assignment:read', 'assignment:manage', 'class-slot:manage', 'user:admin', 'user:read', 'branch:all'],
    branchIds: [],
  };

  it('InstructorManagementService.list hanya memuat instruktur yang berstatus ACTIVE', async () => {
    const mockFindMany = jest.fn().mockResolvedValue([
      {
        id: 'inst-1',
        displayName: 'Instruktur Resmi',
        email: 'resmi@dailydose.test',
        role: 'COACH',
        status: 'ACTIVE',
        instructorAssignments: [],
        _count: { instructedClassSlots: 5, instructorAttendances: 5 },
      },
    ]);

    const mockDb: any = {
      user: {
        findMany: mockFindMany,
        count: jest.fn().mockResolvedValue(1),
      },
      slotKelas: { findMany: jest.fn().mockResolvedValue([]) },
      instructorFee: { findMany: jest.fn().mockResolvedValue([]) },
    };

    const service = new InstructorManagementService(mockDb, new PolicyService());
    const result = await service.list(superOwner, {});

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'ACTIVE',
          role: { in: ['COACH', 'INSTRUCTOR'] },
        }),
      }),
    );
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.displayName).toBe('Instruktur Resmi');
  });

  it('UserAdministrationService.lookupUsers dengan instructorsOnly memfilter status ACTIVE', async () => {
    const mockFindMany = jest.fn().mockResolvedValue([
      {
        id: 'inst-1',
        displayName: 'Instruktur Resmi',
        role: 'COACH',
        status: 'ACTIVE',
        preferredBranchId: 'b1',
      },
    ]);

    const mockDb: any = {
      user: {
        findMany: mockFindMany,
      },
    };

    const service = new UserAdministrationService(mockDb, new PolicyService(), {} as never);
    const result = await service.lookupUsers(superOwner, { instructorsOnly: true });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'ACTIVE',
          AND: expect.arrayContaining([{ role: 'COACH' }]),
        }),
      }),
    );
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.label).toBe('Instruktur Resmi');
  });
});
