'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  browserClassSlotClient,
  classSlotFailure,
  type ClassSlot,
  type ClassSlotClient,
  type ClassTypeOption,
  type InstructorOption,
} from '../class-slot-client';
import {
  formatBranchDay,
  formatBranchTime,
  localDateKey,
  shiftWeek,
  weekWindow,
  zonedLocalDateTime,
} from '../class-time';
import { EmptyState, Feedback, PageHeader, Skeleton, StatusBadge } from '../ui';
import { useSessionContext } from '../session-context';

type Panel = { kind: 'create' } | { kind: 'detail'; slot: ClassSlot } | null;
type CancellationReason =
  'STUDIO_UNAVAILABLE' | 'INSTRUCTOR_UNAVAILABLE' | 'SAFETY_ISSUE' | 'OTHER_REVIEW_REQUIRED';

const statuses = [
  'ALL',
  'DRAFT',
  'PUBLISHED',
  'CONFIRMED',
  'AUTO_CANCELLED',
  'CANCELLED',
  'COMPLETED',
];
const statusLabels: Record<string, string> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Dipublikasikan',
  CONFIRMED: 'Dikonfirmasi',
  AUTO_CANCELLED: 'Batal otomatis',
  CANCELLED: 'Dibatalkan',
  COMPLETED: 'Selesai',
};
const cancellationLabels: Record<CancellationReason, string> = {
  STUDIO_UNAVAILABLE: 'Studio tidak tersedia',
  INSTRUCTOR_UNAVAILABLE: 'Instructor tidak tersedia',
  SAFETY_ISSUE: 'Masalah keselamatan',
  OTHER_REVIEW_REQUIRED: 'Perlu tinjauan lain',
};

function tone(status: string): 'neutral' | 'info' | 'success' | 'warning' | 'danger' {
  if (status === 'CONFIRMED' || status === 'COMPLETED') return 'success';
  if (status === 'PUBLISHED') return 'info';
  if (status.includes('CANCELLED')) return 'danger';
  return status === 'DRAFT' ? 'warning' : 'neutral';
}

export function ClassSlotView({
  client = browserClassSlotClient,
  branchOverride,
}: {
  client?: ClassSlotClient;
  branchOverride?: { id: string; name: string; timezone: string };
}) {
  const sessionContext = useSessionContext();
  const branch = branchOverride ?? sessionContext?.activeBranch ?? null;
  const authorityKey = `${sessionContext?.session?.id ?? 'test'}:${sessionContext?.session?.assurance ?? 'MFA'}`;
  const canManage = !sessionContext || sessionContext.hasCapability('class-slot:manage');
  const hasMfa = !sessionContext || sessionContext.session?.assurance === 'MFA';
  const [reference, setReference] = useState(new Date());
  const [slots, setSlots] = useState<ClassSlot[]>([]);
  const [classTypes, setClassTypes] = useState<ClassTypeOption[]>([]);
  const [instructors, setInstructors] = useState<InstructorOption[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [classTypeFilter, setClassTypeFilter] = useState('');
  const [instructorFilter, setInstructorFilter] = useState('');
  const [panel, setPanel] = useState<Panel>(null);
  const [message, setMessage] = useState<string>();
  const [failure, setFailure] = useState<string>();
  const [busy, setBusy] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const week = useMemo(
    () => (branch ? weekWindow(reference, branch.timezone) : null),
    [branch, reference],
  );

  const load = async () => {
    if (!branch || !week) return;
    setBusy(true);
    setFailure(undefined);
    try {
      const workspace = await client.discover({
        branchId: branch.id,
        timezone: branch.timezone,
        from: week.start,
        until: week.end,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      });
      setSlots(workspace.slots);
      setClassTypes(workspace.classTypes);
      setInstructors(workspace.instructors);
    } catch (error) {
      setFailure(classSlotFailure(error));
      setSlots([]);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    setSlots([]);
    setClassTypes([]);
    setInstructors([]);
    setClassTypeFilter('');
    setInstructorFilter('');
    setPanel(null);
    setMessage(undefined);
    setFailure(undefined);
  }, [branch?.id, authorityKey]);

  useEffect(() => {
    if (panel) closeButton.current?.focus();
  }, [panel]);

  const openPanel = (next: NonNullable<Panel>, trigger: HTMLElement) => {
    opener.current = trigger;
    setPanel(next);
  };
  const closePanel = () => {
    setPanel(null);
    window.setTimeout(() => opener.current?.focus(), 0);
  };
  const run = async (action: () => Promise<ClassSlot>, success: string) => {
    setBusy(true);
    setFailure(undefined);
    try {
      const updated = await action();
      setSlots((current) => {
        const exists = current.some((slot) => slot.id === updated.id);
        return exists
          ? current.map((slot) => (slot.id === updated.id ? updated : slot))
          : [updated, ...current];
      });
      if (panel?.kind === 'detail') setPanel({ kind: 'detail', slot: updated });
      setMessage(success);
    } catch (error) {
      setFailure(classSlotFailure(error));
    } finally {
      setBusy(false);
    }
  };
  const classTypeName = (id: string) =>
    classTypes.find((item) => item.id === id)?.name ?? `Class ${id.slice(0, 8)}`;
  const instructorName = (id?: string | null) =>
    id
      ? (instructors.find((item) => item.id === id)?.displayName ?? `Instructor ${id.slice(0, 8)}`)
      : 'Belum ditetapkan';
  const visible = slots
    .filter((slot) => !classTypeFilter || slot.classTypeId === classTypeFilter)
    .filter((slot) => !instructorFilter || slot.instructorUserId === instructorFilter)
    .sort((left, right) => left.startAt.getTime() - right.startAt.getTime());
  const grouped = new Map(
    (week?.days ?? []).map((day) => [
      day,
      visible.filter((slot) => localDateKey(slot.startAt, slot.timezone) === day),
    ]),
  );

  if (!branch) {
    return (
      <section className="card" aria-labelledby="classes-title">
        <PageHeader
          eyebrow="Timetable branch-scoped"
          title="Timetable kelas"
          titleId="classes-title"
          description="Pilih cabang aktif pada bagian atas workspace untuk membuka jadwal."
        />
        <Feedback kind="warning">Cabang aktif wajib dipilih secara eksplisit.</Feedback>
      </section>
    );
  }

  const slotCard = (slot: ClassSlot) => (
    <button
      className={`calendar-slot calendar-slot-${slot.status.toLowerCase()}`}
      key={slot.id}
      onClick={(event) => openPanel({ kind: 'detail', slot }, event.currentTarget)}
    >
      <span>
        {formatBranchTime(slot.startAt, slot.timezone)}–
        {formatBranchTime(slot.endAt, slot.timezone)}
      </span>
      <strong>{classTypeName(slot.classTypeId)}</strong>
      <small>{instructorName(slot.instructorUserId)}</small>
      <small>
        {slot.bookedCount}/{slot.capacity} terisi · min. {slot.minimumQuota}
      </small>
      <StatusBadge tone={tone(slot.status)}>{statusLabels[slot.status]}</StatusBadge>
    </button>
  );

  return (
    <section className="class-workspace" aria-labelledby="classes-title">
      <PageHeader
        eyebrow={`${branch.name} · ${branch.timezone}`}
        title="Timetable kelas mingguan"
        titleId="classes-title"
        description="Kelola draft, instructor, publish, dan cancellation pada waktu lokal cabang."
        context={
          <>
            <StatusBadge tone={hasMfa ? 'success' : 'warning'}>
              {hasMfa ? 'MFA aktif' : 'MFA diperlukan'}
            </StatusBadge>
            <span>Interval [mulai, selesai)</span>
          </>
        }
      />

      <div className="calendar-toolbar" aria-label="Kontrol timetable">
        <div className="calendar-navigation">
          <button className="button-quiet" onClick={() => setReference(shiftWeek(reference, -1))}>
            ← Minggu sebelumnya
          </button>
          <button className="button-quiet" onClick={() => setReference(new Date())}>
            Hari ini
          </button>
          <button className="button-quiet" onClick={() => setReference(shiftWeek(reference, 1))}>
            Minggu berikutnya →
          </button>
        </div>
        <strong aria-live="polite">{week?.label}</strong>
        <button
          disabled={!canManage}
          onClick={(event) => openPanel({ kind: 'create' }, event.currentTarget)}
        >
          Buat kelas
        </button>
      </div>

      <div className="calendar-filters" aria-label="Filter timetable">
        <label>
          Status
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            {statuses.map((status) => (
              <option value={status} key={status}>
                {status === 'ALL' ? 'Semua status' : statusLabels[status]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Class type
          <select
            value={classTypeFilter}
            onChange={(event) => setClassTypeFilter(event.target.value)}
          >
            <option value="">Semua class type</option>
            {classTypes.map((item) => (
              <option value={item.id} key={item.id}>
                {item.code} · {item.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Instructor
          <select
            value={instructorFilter}
            onChange={(event) => setInstructorFilter(event.target.value)}
          >
            <option value="">Semua instructor</option>
            {instructors.map((item) => (
              <option value={item.id} key={item.id}>
                {item.displayName}
              </option>
            ))}
          </select>
        </label>
        <button disabled={busy} onClick={() => void load()}>
          Muat timetable
        </button>
      </div>

      {busy && <Skeleton label="Memuat timetable kelas" />}
      {failure && <Feedback kind="error">{failure}</Feedback>}
      {message && !busy && <Feedback kind="status">{message}</Feedback>}
      {!busy && slots.length === 0 ? (
        <EmptyState
          title="Belum ada kelas pada minggu ini"
          description="Ubah minggu atau buat draft kelas baru."
        />
      ) : !busy && visible.length === 0 ? (
        <EmptyState
          title="Tidak ada kelas sesuai filter"
          description="Ubah status, class type, atau instructor."
        />
      ) : (
        <>
          <div className="weekly-calendar" role="region" aria-label="Kalender kelas tujuh hari">
            {week?.days.map((day) => (
              <section className="calendar-day" aria-labelledby={`day-${day}`} key={day}>
                <h2 id={`day-${day}`}>{formatBranchDay(day, branch.timezone)}</h2>
                <div>{grouped.get(day)?.map(slotCard)}</div>
              </section>
            ))}
          </div>
          <div className="mobile-agenda" aria-label="Agenda kelas mingguan">
            {week?.days.map((day) => (
              <section key={day}>
                <h2>{formatBranchDay(day, branch.timezone)}</h2>
                {grouped.get(day)?.length ? (
                  grouped.get(day)?.map(slotCard)
                ) : (
                  <p className="muted">Tidak ada kelas</p>
                )}
              </section>
            ))}
          </div>
        </>
      )}

      {panel && (
        <div
          className="panel-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closePanel();
          }}
        >
          <div
            className="side-panel"
            aria-label={panel.kind === 'create' ? 'Buat kelas' : 'Detail kelas'}
            aria-modal="true"
            role="dialog"
          >
            <div className="side-panel-header">
              <div>
                <p className="eyebrow">
                  {branch.name} · {branch.timezone}
                </p>
                <h2>
                  {panel.kind === 'create'
                    ? 'Buat draft kelas'
                    : classTypeName(panel.slot.classTypeId)}
                </h2>
              </div>
              <button ref={closeButton} className="button-quiet" onClick={closePanel}>
                Tutup
              </button>
            </div>
            {panel.kind === 'create' ? (
              <CreatePanel
                branchId={branch.id}
                timezone={branch.timezone}
                classTypes={classTypes}
                instructors={instructors}
                busy={busy}
                onCreate={async (input) => {
                  await run(() => client.create(input), 'Draft kelas berhasil dibuat.');
                  closePanel();
                }}
              />
            ) : (
              <DetailPanel
                slot={panel.slot}
                classTypeName={classTypeName(panel.slot.classTypeId)}
                instructorName={instructorName(panel.slot.instructorUserId)}
                instructors={instructors}
                canManage={canManage}
                hasMfa={hasMfa}
                busy={busy}
                onAssign={(instructorId) =>
                  run(
                    () => client.assign(panel.slot.id, instructorId, panel.slot.version),
                    'Instructor berhasil ditetapkan.',
                  )
                }
                onPublish={() =>
                  run(
                    () => client.publish(panel.slot.id, panel.slot.version),
                    'Kelas berhasil dipublikasikan.',
                  )
                }
                onCancel={(reason) =>
                  run(
                    () => client.cancel(panel.slot.id, reason, panel.slot.version),
                    'Kelas berhasil dibatalkan.',
                  )
                }
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function CreatePanel({
  branchId,
  timezone,
  classTypes,
  instructors,
  busy,
  onCreate,
}: {
  branchId: string;
  timezone: string;
  classTypes: ClassTypeOption[];
  instructors: InstructorOption[];
  busy: boolean;
  onCreate(input: {
    branchId: string;
    classTypeId: string;
    instructorUserId?: string;
    startAt: Date;
    endAt: Date;
  }): Promise<void>;
}) {
  const [summary, setSummary] = useState(
    'Pilih tanggal dan waktu. Quota/capacity akan diambil dari konfigurasi efektif backend.',
  );
  return (
    <form
      aria-label="Form buat kelas"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        try {
          const startAt = zonedLocalDateTime(
            String(data.get('date')),
            String(data.get('startTime')),
            timezone,
          );
          const endAt = zonedLocalDateTime(
            String(data.get('date')),
            String(data.get('endTime')),
            timezone,
          );
          if (endAt <= startAt) throw new Error('INVALID_RANGE');
          void onCreate({
            branchId,
            classTypeId: String(data.get('classTypeId')),
            instructorUserId: String(data.get('instructorUserId')) || undefined,
            startAt,
            endAt,
          });
        } catch {
          setSummary('Waktu selesai harus setelah waktu mulai dan valid pada timezone cabang.');
        }
      }}
    >
      <label>
        Class type
        <select name="classTypeId" required defaultValue="">
          <option value="" disabled>
            Pilih class type
          </option>
          {classTypes.map((item) => (
            <option value={item.id} key={item.id}>
              {item.code} · {item.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Instructor
        <select name="instructorUserId" defaultValue="">
          <option value="">Tetapkan nanti</option>
          {instructors.map((item) => (
            <option value={item.id} key={item.id}>
              {item.displayName}
            </option>
          ))}
        </select>
      </label>
      <label>
        Tanggal
        <input name="date" type="date" required />
      </label>
      <label>
        Mulai
        <input name="startTime" type="time" required />
      </label>
      <label>
        Selesai eksklusif
        <input name="endTime" type="time" required />
      </label>
      <Feedback kind="info">
        Timezone: {timezone}. {summary}
      </Feedback>
      <button type="submit" disabled={busy || classTypes.length === 0}>
        Buat draft
      </button>
    </form>
  );
}

function DetailPanel({
  slot,
  classTypeName,
  instructorName,
  instructors,
  canManage,
  hasMfa,
  busy,
  onAssign,
  onPublish,
  onCancel,
}: {
  slot: ClassSlot;
  classTypeName: string;
  instructorName: string;
  instructors: InstructorOption[];
  canManage: boolean;
  hasMfa: boolean;
  busy: boolean;
  onAssign(id: string): Promise<void>;
  onPublish(): Promise<void>;
  onCancel(reason: CancellationReason): Promise<void>;
}) {
  const [instructorId, setInstructorId] = useState(slot.instructorUserId ?? '');
  const [reason, setReason] = useState<CancellationReason>('OTHER_REVIEW_REQUIRED');
  return (
    <div className="class-detail">
      <StatusBadge tone={tone(slot.status)}>{statusLabels[slot.status]}</StatusBadge>
      <dl>
        <div>
          <dt>Class type</dt>
          <dd>{classTypeName}</dd>
        </div>
        <div>
          <dt>Waktu</dt>
          <dd>
            {formatBranchTime(slot.startAt, slot.timezone)}–
            {formatBranchTime(slot.endAt, slot.timezone)}
          </dd>
        </div>
        <div>
          <dt>Instructor</dt>
          <dd>{instructorName}</dd>
        </div>
        <div>
          <dt>Kapasitas</dt>
          <dd>
            {slot.bookedCount}/{slot.capacity}; minimum {slot.minimumQuota}
          </dd>
        </div>
        <div>
          <dt>Versi</dt>
          <dd>{slot.version}</dd>
        </div>
      </dl>
      {slot.status === 'DRAFT' && (
        <section>
          <h3>Tetapkan instructor</h3>
          <label>
            Instructor
            <select
              aria-label="Instructor"
              value={instructorId}
              onChange={(event) => setInstructorId(event.target.value)}
            >
              <option value="">Pilih instructor</option>
              {instructors.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.displayName}
                </option>
              ))}
            </select>
          </label>
          <button
            disabled={busy || !canManage || !instructorId}
            onClick={() => void onAssign(instructorId)}
          >
            Tetapkan instructor
          </button>
        </section>
      )}
      {slot.status === 'DRAFT' && (
        <section>
          <h3>Publish kelas</h3>
          {!hasMfa && <Feedback kind="warning">Lakukan step-up MFA sebelum publish.</Feedback>}
          <button
            disabled={busy || !canManage || !hasMfa || !slot.instructorUserId}
            onClick={() => void onPublish()}
          >
            Publish kelas
          </button>
        </section>
      )}
      {['DRAFT', 'PUBLISHED'].includes(slot.status) && (
        <section>
          <h3>Batalkan kelas</h3>
          <label>
            Alasan
            <select
              aria-label="Alasan pembatalan"
              value={reason}
              onChange={(event) => setReason(event.target.value as CancellationReason)}
            >
              {Object.entries(cancellationLabels).map(([value, label]) => (
                <option value={value} key={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <Feedback kind="warning">
            Cancellation melepaskan reservation aktif. Konfirmasi hanya jika konsekuensi sudah
            ditinjau.
          </Feedback>
          <button disabled={busy || !canManage || !hasMfa} onClick={() => void onCancel(reason)}>
            Konfirmasi pembatalan
          </button>
        </section>
      )}
    </div>
  );
}
