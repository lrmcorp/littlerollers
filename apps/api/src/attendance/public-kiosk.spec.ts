import { Test, TestingModule } from '@nestjs/testing';
import { PublicAttendanceController } from './public-attendance.controller';
import { AttendanceService } from './kehadiran.service';

describe('PublicAttendanceController Kiosk', () => {
  let controller: PublicAttendanceController;
  let attendance: {
    getCustomerLinkInfo: jest.Mock;
    confirmCustomerLink: jest.Mock;
    getKioskBranches: jest.Mock;
    getKioskDisplay: jest.Mock;
  };

  beforeEach(async () => {
    attendance = {
      getCustomerLinkInfo: jest.fn(),
      confirmCustomerLink: jest.fn(),
      getKioskBranches: jest.fn().mockResolvedValue({
        items: [
          {
            id: 'branch-1',
            code: 'SENO',
            name: 'Daily Dose Senopati',
            timezone: 'Asia/Jakarta',
            hasGeofence: true,
            geofenceRadiusMeters: 100,
          },
        ],
      }),
      getKioskDisplay: jest.fn().mockResolvedValue({
        branch: {
          id: 'branch-1',
          code: 'SENO',
          name: 'Daily Dose Senopati',
          timezone: 'Asia/Jakarta',
          hasGeofence: true,
          geofenceRadiusMeters: 100,
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

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicAttendanceController],
      providers: [
        {
          provide: AttendanceService,
          useValue: attendance,
        },
      ],
    }).compile();

    controller = module.get<PublicAttendanceController>(PublicAttendanceController);
  });

  it('should return branch list for kiosk selector', async () => {
    const result = await controller.getKioskBranches();
    expect(attendance.getKioskBranches).toHaveBeenCalled();
    expect(result.items).toHaveLength(1);
    expect(result.items?.[0]?.code).toBe('SENO');
  });

  it('should return kiosk display data for a branch code', async () => {
    const result = await controller.getKioskDisplay('seno');
    expect(attendance.getKioskDisplay).toHaveBeenCalledWith('seno');
    expect(result.branch.code).toBe('SENO');
    expect(result.slots).toHaveLength(1);
    expect(result.slots?.[0]?.qrPayload).toBe('dd-checkin:v1:test-token-123');
  });
});
