import { Test, TestingModule } from '@nestjs/testing';
import { PublicAttendanceController } from './public-attendance.controller';
import { AttendanceService } from './kehadiran.service';
import { KioskAccessService } from './kiosk-access.service';
import { StudioCheckInService } from './studio-check-in.service';

describe('PublicAttendanceController Kiosk', () => {
  let controller: PublicAttendanceController;
  let attendance: {
    getCustomerLinkInfo: jest.Mock;
    confirmCustomerLink: jest.Mock;
    getKioskBranches: jest.Mock;
    getKioskDisplay: jest.Mock;
  };
  let kioskAccess: { unlock: jest.Mock; requireAccess: jest.Mock };
  let studioCheckIn: { pindai: jest.Mock; hariIni: jest.Mock };

  beforeEach(async () => {
    attendance = {
      getCustomerLinkInfo: jest.fn(),
      confirmCustomerLink: jest.fn(),
      getKioskBranches: jest.fn().mockResolvedValue({
        items: [
          { id: 'branch-1', code: 'SENO', name: 'Daily Dose Senopati', timezone: 'Asia/Jakarta' },
        ],
      }),
      getKioskDisplay: jest.fn().mockResolvedValue({
        branch: {
          id: 'branch-1',
          code: 'SENO',
          name: 'Daily Dose Senopati',
          timezone: 'Asia/Jakarta',
        },
        serverTime: '2026-10-21T08:00:00.000Z',
        slots: [
          {
            id: 'slot-1',
            classTypeName: 'Reformer Flow',
            instructorName: 'Coach Sarah',
            window: 'OPEN',
            isAttended: false,
            qrPayload: 'dd-checkin:v1:test-token-123',
          },
        ],
      }),
    };
    kioskAccess = {
      unlock: jest
        .fn()
        .mockResolvedValue({ token: '1.abc', expiresAt: '2026-11-20T00:00:00.000Z' }),
      requireAccess: jest.fn().mockResolvedValue({ id: 'branch-1' }),
    };

    studioCheckIn = {
      pindai: jest.fn().mockResolvedValue({ diterima: true, tercatat: true }),
      hariIni: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicAttendanceController],
      providers: [
        { provide: AttendanceService, useValue: attendance },
        { provide: KioskAccessService, useValue: kioskAccess },
        { provide: StudioCheckInService, useValue: studioCheckIn },
      ],
    }).compile();

    controller = module.get<PublicAttendanceController>(PublicAttendanceController);
  });

  it('lists branches for the kiosk selector without any location data', async () => {
    const result = await controller.getKioskBranches();
    expect(result.items).toHaveLength(1);
    expect(result.items?.[0]?.code).toBe('SENO');
    expect(JSON.stringify(result)).not.toMatch(/latitude|longitude|geofence/i);
  });

  it('only returns the kiosk display after the tablet token is accepted', async () => {
    const result = await controller.getKioskDisplay('seno', 'tablet-token');
    expect(kioskAccess.requireAccess).toHaveBeenCalledWith('seno', 'tablet-token');
    expect(attendance.getKioskDisplay).toHaveBeenCalledWith('seno');
    expect(result.slots?.[0]?.qrPayload).toBe('dd-checkin:v1:test-token-123');

    attendance.getKioskDisplay.mockClear();
    kioskAccess.requireAccess.mockRejectedValue({ code: 'KIOSK_LOCKED' });
    await expect(controller.getKioskDisplay('seno', undefined)).rejects.toMatchObject({
      code: 'KIOSK_LOCKED',
    });
    expect(attendance.getKioskDisplay).not.toHaveBeenCalled();
  });

  it('unlocks with the PIN and passes the client address for rate limiting', async () => {
    const result = await controller.unlockKiosk('seno', { pin: '123456' }, {
      ip: '10.0.0.7',
    } as never);
    expect(kioskAccess.unlock).toHaveBeenCalledWith('seno', '123456', '10.0.0.7');
    expect(result.token).toBe('1.abc');
  });

  it('meneruskan pindaian studio beserta token tablet, tanpa memercayai cabang dari isi permintaan', async () => {
    await controller.scanAtStudio('gg', { pass: 'dd-pass:v1:abc' }, '1.abc');

    expect(studioCheckIn.pindai).toHaveBeenCalledWith('gg', '1.abc', 'dd-pass:v1:abc');
  });

  it('meneruskan daftar tercatat hari ini dengan token tablet', async () => {
    await controller.kioskToday('gg', '1.abc');

    expect(studioCheckIn.hariIni).toHaveBeenCalledWith('gg', '1.abc');
  });
});
