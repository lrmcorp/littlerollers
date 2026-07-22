'use client';
import { useState } from 'react';
import {
  browserClassSlotClient,
  classSlotFailure,
  type ClassSlot,
  type ClassSlotClient,
} from '../class-slot-client';
import { EmptyState, Feedback, PageHeader, Skeleton, StatusBadge } from '../ui';
import { useActiveBranchState, useSessionContext } from '../session-context';

export function ClassSlotView({ client = browserClassSlotClient }: { client?: ClassSlotClient }) {
  const [branchId, setBranchId] = useActiveBranchState();
  const sessionContext = useSessionContext();
  const canManage = !sessionContext || sessionContext.hasCapability('class-slot:manage');
  const hasMfa = !sessionContext || sessionContext.session?.assurance === 'MFA';
  const [items, setItems] = useState<ClassSlot[]>([]);
  const [message, setMessage] = useState<string>();
  const [failure, setFailure] = useState<string>();
  const [busy, setBusy] = useState(false);
  const run = async (action: () => Promise<void>, success: string) => {
    setBusy(true);
    setFailure(undefined);
    try {
      await action();
      setMessage(success);
    } catch (error) {
      setFailure(classSlotFailure(error));
    } finally {
      setBusy(false);
    }
  };
  const replace = (slot: ClassSlot) =>
    setItems((current) => current.map((item) => (item.id === slot.id ? slot : item)));
  return (
    <section className="card" aria-labelledby="classes-title">
      <PageHeader
        eyebrow="Timetable branch-scoped"
        title="Timetable dan lifecycle kelas"
        titleId="classes-title"
        description="Waktu memakai interval [mulai, selesai). Publish dan cancel wajib MFA."
        context={
          <>
            <StatusBadge tone="info">Admin / Manager</StatusBadge>
            <StatusBadge tone="warning">MFA mutation</StatusBadge>
          </>
        }
      />
      <label>
        ID cabang
        <input
          aria-label="ID cabang kelas"
          value={branchId}
          onChange={(event) => setBranchId(event.target.value)}
        />
      </label>
      <button
        disabled={busy || !branchId}
        onClick={() =>
          void run(async () => setItems(await client.list({ branchId })), 'Class slot dimuat.')
        }
      >
        Muat class slot
      </button>
      <form
        aria-label="Buat class slot"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          void run(async () => {
            const slot = await client.create({
              branchId,
              classTypeId: String(data.get('classTypeId')),
              instructorUserId: String(data.get('instructorUserId')) || undefined,
              startAt: new Date(String(data.get('startAt'))),
              endAt: new Date(String(data.get('endAt'))),
            });
            setItems((current) => [slot, ...current]);
          }, 'Draft class slot dibuat.');
        }}
      >
        <h2>Buat draft</h2>
        <label>
          ID class type
          <input name="classTypeId" required />
        </label>
        <label>
          ID instructor (opsional)
          <input name="instructorUserId" />
        </label>
        <label>
          Mulai
          <input name="startAt" type="datetime-local" required />
        </label>
        <label>
          Selesai eksklusif
          <input name="endAt" type="datetime-local" required />
        </label>
        <button type="submit" disabled={busy || !branchId || !canManage}>
          Buat draft class slot
        </button>
      </form>
      {busy && <Skeleton label="Memproses class slot" />}
      {failure && <Feedback kind="error">{failure}</Feedback>}
      {message && !busy && <Feedback kind="status">{message}</Feedback>}
      <h2>Jadwal branch</h2>
      {items.length === 0 ? (
        <EmptyState
          title="Belum ada class slot"
          description="Pilih cabang untuk memuat timetable atau buat draft baru."
        />
      ) : (
        <ul aria-label="Daftar class slot">
          {items.map((slot) => (
            <li key={slot.id}>
              <strong>{slot.status}</strong> · {slot.timezone} · quota {slot.minimumQuota}/
              {slot.capacity} · version {slot.version}
              <div>
                <label>
                  Assign instructor
                  <input
                    aria-label={`Instructor ${slot.id}`}
                    defaultValue={slot.instructorUserId ?? ''}
                  />
                </label>
                <button
                  disabled={busy || slot.status !== 'DRAFT' || !canManage}
                  onClick={(event) => {
                    const input = event.currentTarget.parentElement?.querySelector(
                      'input',
                    ) as HTMLInputElement;
                    void run(
                      async () => replace(await client.assign(slot.id, input.value, slot.version)),
                      'Instructor ditetapkan.',
                    );
                  }}
                >
                  Assign
                </button>
                <button
                  disabled={
                    busy ||
                    slot.status !== 'DRAFT' ||
                    !slot.instructorUserId ||
                    !canManage ||
                    !hasMfa
                  }
                  onClick={() =>
                    void run(
                      async () => replace(await client.publish(slot.id, slot.version)),
                      'Class slot dipublikasikan.',
                    )
                  }
                >
                  Publish
                </button>
                <button
                  disabled={
                    busy || !['DRAFT', 'PUBLISHED'].includes(slot.status) || !canManage || !hasMfa
                  }
                  onClick={() =>
                    void run(
                      async () =>
                        replace(
                          await client.cancel(slot.id, 'OTHER_REVIEW_REQUIRED', slot.version),
                        ),
                      'Class slot dibatalkan.',
                    )
                  }
                >
                  Cancel
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
