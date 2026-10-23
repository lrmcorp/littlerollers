import { HttpStatus } from '@nestjs/common';
import { PolicyService } from '../identity/policy.service';
import { MasterAccessService } from './master-access.service';
import { MasterCatalogService } from './master-catalog.service';

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const branchId = id(1);
const studioId = id(2);
const roomId = id(3);
const classTypeId = id(4);

const superOwner = {
  sessionId: 's-owner',
  userId: id(100),
  roles: [] as never,
  capabilities: ['master:manage', 'master:read', 'branch:all'],
  branchIds: [] as string[],
};

const unauthorizedStaff = {
  sessionId: 's-staff',
  userId: id(200),
  roles: [] as never,
  capabilities: ['master:read'],
  branchIds: [branchId],
};

describe('MasterCatalogService - Safe Hard Delete (Room, Studio, ClassType)', () => {
  describe('deleteRoom', () => {
    function setupRoom(classSlotsCount = 0) {
      const roomRow = {
        id: roomId,
        studioId,
        code: 'ROOM-A',
        name: 'Ruangan Reformer A',
        capacityBed: 8,
        active: true,
        studio: {
          id: studioId,
          branchId,
        },
        _count: {
          classSlots: classSlotsCount,
        },
      };

      const tx = {
        ruangan: {
          delete: jest.fn().mockResolvedValue(roomRow),
        },
        auditLog: {
          create: jest.fn().mockResolvedValue({ id: id(999) }),
        },
      };

      const db = {
        ruangan: {
          findUnique: jest.fn().mockImplementation(({ where }) => {
            if (where.id === roomId) return Promise.resolve(roomRow);
            return Promise.resolve(null);
          }),
          delete: tx.ruangan.delete,
        },
        $transaction: jest.fn(async (fn: (t: typeof tx) => unknown) => fn(tx)),
      };

      const access = new MasterAccessService(new PolicyService());
      const service = new MasterCatalogService(db as never, access);

      return { service, db, tx, roomRow };
    }

    it('hard-deletes room cleanly when it has 0 class slots', async () => {
      const { service, tx } = setupRoom(0);

      const result = await service.deleteRoom(superOwner, roomId, 'corr-test');

      expect(result).toEqual({
        success: true,
        id: roomId,
        name: 'Ruangan Reformer A',
      });
      expect(tx.ruangan.delete).toHaveBeenCalledWith({ where: { id: roomId } });
    });

    it('rejects deletion with 409 Conflict when room has class slots', async () => {
      const { service, tx } = setupRoom(3);

      await expect(service.deleteRoom(superOwner, roomId, 'corr-test')).rejects.toMatchObject({
        code: 'CANNOT_DELETE_ROOM_WITH_DEPENDENCIES',
        status: HttpStatus.CONFLICT,
      });
      expect(tx.ruangan.delete).not.toHaveBeenCalled();
    });

    it('throws 404 NOT_FOUND when room does not exist', async () => {
      const { service } = setupRoom();

      await expect(service.deleteRoom(superOwner, id(999), 'corr-test')).rejects.toMatchObject({
        code: 'NOT_FOUND',
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('enforces master:manage authorization', async () => {
      const { service } = setupRoom();

      await expect(service.deleteRoom(unauthorizedStaff, roomId, 'corr-test')).rejects.toMatchObject({
        code: 'FORBIDDEN',
        status: HttpStatus.FORBIDDEN,
      });
    });
  });

  describe('deleteStudio', () => {
    function setupStudio(relationsCount: { rooms?: number; classSlots?: number } = {}) {
      const studioRow = {
        id: studioId,
        branchId,
        code: 'STD-1',
        name: 'Studio Utama',
        active: true,
        _count: {
          rooms: 0,
          classSlots: 0,
          ...relationsCount,
        },
      };

      const tx = {
        studio: {
          delete: jest.fn().mockResolvedValue(studioRow),
        },
        auditLog: {
          create: jest.fn().mockResolvedValue({ id: id(999) }),
        },
      };

      const db = {
        studio: {
          findUnique: jest.fn().mockImplementation(({ where }) => {
            if (where.id === studioId) return Promise.resolve(studioRow);
            return Promise.resolve(null);
          }),
          delete: tx.studio.delete,
        },
        $transaction: jest.fn(async (fn: (t: typeof tx) => unknown) => fn(tx)),
      };

      const access = new MasterAccessService(new PolicyService());
      const service = new MasterCatalogService(db as never, access);

      return { service, db, tx, studioRow };
    }

    it('hard-deletes studio cleanly when it has 0 dependencies', async () => {
      const { service, tx } = setupStudio();

      const result = await service.deleteStudio(superOwner, studioId, 'corr-test');

      expect(result).toEqual({
        success: true,
        id: studioId,
        name: 'Studio Utama',
      });
      expect(tx.studio.delete).toHaveBeenCalledWith({ where: { id: studioId } });
    });

    it('rejects deletion with 409 Conflict when studio has rooms', async () => {
      const { service, tx } = setupStudio({ rooms: 2 });

      await expect(service.deleteStudio(superOwner, studioId, 'corr-test')).rejects.toMatchObject({
        code: 'CANNOT_DELETE_STUDIO_WITH_DEPENDENCIES',
        status: HttpStatus.CONFLICT,
      });
      expect(tx.studio.delete).not.toHaveBeenCalled();
    });

    it('rejects deletion with 409 Conflict when studio has class slots', async () => {
      const { service, tx } = setupStudio({ classSlots: 4 });

      await expect(service.deleteStudio(superOwner, studioId, 'corr-test')).rejects.toMatchObject({
        code: 'CANNOT_DELETE_STUDIO_WITH_DEPENDENCIES',
        status: HttpStatus.CONFLICT,
      });
      expect(tx.studio.delete).not.toHaveBeenCalled();
    });

    it('throws 404 NOT_FOUND when studio does not exist', async () => {
      const { service } = setupStudio();

      await expect(service.deleteStudio(superOwner, id(999), 'corr-test')).rejects.toMatchObject({
        code: 'NOT_FOUND',
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('enforces master:manage authorization', async () => {
      const { service } = setupStudio();

      await expect(service.deleteStudio(unauthorizedStaff, studioId, 'corr-test')).rejects.toMatchObject({
        code: 'FORBIDDEN',
        status: HttpStatus.FORBIDDEN,
      });
    });
  });

  describe('deleteClassType', () => {
    function setupClassType(relationsCount: Partial<Record<string, number>> = {}) {
      const classTypeRow = {
        id: classTypeId,
        code: 'PILATES-MAT',
        name: 'Mat Pilates',
        active: true,
        _count: {
          packages: 0,
          classSlots: 0,
          minQuotaSettings: 0,
          instructorFees: 0,
          projectionRates: 0,
          ...relationsCount,
        },
      };

      const tx = {
        jenisKelas: {
          delete: jest.fn().mockResolvedValue(classTypeRow),
        },
        auditLog: {
          create: jest.fn().mockResolvedValue({ id: id(999) }),
        },
      };

      const db = {
        jenisKelas: {
          findUnique: jest.fn().mockImplementation(({ where }) => {
            if (where.id === classTypeId) return Promise.resolve(classTypeRow);
            return Promise.resolve(null);
          }),
          delete: tx.jenisKelas.delete,
        },
        $transaction: jest.fn(async (fn: (t: typeof tx) => unknown) => fn(tx)),
      };

      const access = new MasterAccessService(new PolicyService());
      const service = new MasterCatalogService(db as never, access);

      return { service, db, tx, classTypeRow };
    }

    it('hard-deletes class type cleanly when it has 0 dependencies', async () => {
      const { service, tx } = setupClassType();

      const result = await service.deleteClassType(superOwner, classTypeId, 'corr-test');

      expect(result).toEqual({
        success: true,
        id: classTypeId,
        name: 'Mat Pilates',
      });
      expect(tx.jenisKelas.delete).toHaveBeenCalledWith({ where: { id: classTypeId } });
    });

    it('rejects deletion with 409 Conflict when class type has packages', async () => {
      const { service, tx } = setupClassType({ packages: 1 });

      await expect(service.deleteClassType(superOwner, classTypeId, 'corr-test')).rejects.toMatchObject({
        code: 'CANNOT_DELETE_CLASS_TYPE_WITH_DEPENDENCIES',
        status: HttpStatus.CONFLICT,
      });
      expect(tx.jenisKelas.delete).not.toHaveBeenCalled();
    });

    it('rejects deletion with 409 Conflict when class type has class slots', async () => {
      const { service, tx } = setupClassType({ classSlots: 8 });

      await expect(service.deleteClassType(superOwner, classTypeId, 'corr-test')).rejects.toMatchObject({
        code: 'CANNOT_DELETE_CLASS_TYPE_WITH_DEPENDENCIES',
        status: HttpStatus.CONFLICT,
      });
      expect(tx.jenisKelas.delete).not.toHaveBeenCalled();
    });

    it('rejects deletion with 409 Conflict when class type has minQuota, instructorFee, or projectionRate', async () => {
      const { service, tx } = setupClassType({ instructorFees: 2 });

      await expect(service.deleteClassType(superOwner, classTypeId, 'corr-test')).rejects.toMatchObject({
        code: 'CANNOT_DELETE_CLASS_TYPE_WITH_DEPENDENCIES',
        status: HttpStatus.CONFLICT,
      });
      expect(tx.jenisKelas.delete).not.toHaveBeenCalled();
    });

    it('throws 404 NOT_FOUND when class type does not exist', async () => {
      const { service } = setupClassType();

      await expect(service.deleteClassType(superOwner, id(999), 'corr-test')).rejects.toMatchObject({
        code: 'NOT_FOUND',
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('enforces master:manage authorization', async () => {
      const { service } = setupClassType();

      await expect(service.deleteClassType(unauthorizedStaff, classTypeId, 'corr-test')).rejects.toMatchObject({
        code: 'FORBIDDEN',
        status: HttpStatus.FORBIDDEN,
      });
    });
  });
});
