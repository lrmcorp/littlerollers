import { InstructorManagementService } from './manajemen-instruktur.service';
import { PolicyService } from './policy.service';

const principal = {
  sessionId: 's',
  userId: 'admin-1',
  roles: [{ role: 'ADMIN', branchId: 'branch-1' }] as never,
  capabilities: ['assignment:read', 'user:read'],
  branchIds: ['branch-1'],
};

const slotRow = (id: string, instructorAttendance: unknown) => ({
  id,
  startAt: new Date('2026-06-01T02:00:00Z'),
  endAt: new Date('2026-06-01T03:00:00Z'),
  status: 'COMPLETED',
  classType: { code: 'REF', name: 'Reformer' },
  branch: { id: 'branch-1', name: 'Jakarta' },
  instructorAttendance,
});

function build(slots: ReturnType<typeof slotRow>[], missing = 0) {
  const findFirst = jest.fn().mockResolvedValue({
    id: 'coach-1',
    displayName: 'Coach Sarah',
    email: null,
    phone: null,
    status: 'ACTIVE',
    instructorAssignments: [],
    instructedClassSlots: slots,
  });
  const count = jest.fn().mockResolvedValue(missing);
  const db = { user: { findFirst }, slotKelas: { count } };
  return { service: new InstructorManagementService(db as never, new PolicyService()), count };
}

describe('InstructorManagementService attendance data', () => {
  it('reports real attendance per class instead of assuming everyone checked in at start time', async () => {
    const checkedInAt = new Date('2026-06-01T01:50:00Z');
    const { service } = build([
      slotRow('a', { checkedInAt, method: 'QR_SCAN' }),
      slotRow('b', null),
    ]);
    const detail = await service.detail(principal, 'coach-1');
    const [withCheckIn, without] = detail.instructedClassSlots;
    expect(withCheckIn?.instructorAttendances).toEqual([{ checkedInAt, method: 'QR_SCAN' }]);
    expect(without?.instructorAttendances).toEqual([]);
    expect(detail.instructorAttendances).toHaveLength(1);
  });

  it('counts completed classes without attendance in the branches the viewer can see', async () => {
    const { service, count } = build([slotRow('b', null)], 3);
    const detail = await service.detail(principal, 'coach-1');
    expect(detail.blockers.completedWithoutCheckIn).toBe(3);
    expect(count).toHaveBeenCalledWith({
      where: {
        instructorId: 'coach-1',
        status: 'COMPLETED',
        instructorAttendance: null,
        branchId: { in: ['branch-1'] },
      },
    });
  });

  it('refuses viewers without assignment:read', async () => {
    const { service } = build([]);
    await expect(
      service.detail({ ...principal, capabilities: ['user:read'] }, 'coach-1'),
    ).rejects.toBeDefined();
  });
});
