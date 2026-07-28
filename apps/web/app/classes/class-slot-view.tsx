'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
} from '../class-time';
import { EmptyState, Feedback, PageHeader, Skeleton, StatusBadge } from '../ui';
import { useSessionContext } from '../session-context';
import { CreatePanel, DetailPanel } from './class-slot-panels';
import { classStatusTone, statusLabels } from './class-slot-presenters';
import { controlClassName } from '../components/forms';

type Panel = { kind: 'create' } | { kind: 'detail'; slot: ClassSlot } | null;
type BranchOption = { id: string; code?: string; name: string; timezone: string };

const statuses = [
  'ALL',
  'DRAFT',
  'PUBLISHED',
  'CONFIRMED',
  'AUTO_CANCELLED',
  'CANCELLED',
  'COMPLETED',
];
export function ClassSlotView({
  client = browserClassSlotClient,
  branchOverride,
  branchesOverride,
  capabilitiesOverride,
}: {
  client?: ClassSlotClient;
  branchOverride?: BranchOption;
  branchesOverride?: BranchOption[];
  capabilitiesOverride?: readonly string[];
}) {
  const sessionContext = useSessionContext();
  const branch = branchOverride ?? sessionContext?.activeBranch ?? null;
  const sessionBranches = sessionContext?.session?.branches;
  const branches = useMemo(
    () => branchesOverride ?? sessionBranches ?? (branch ? [branch] : []),
    [branch, branchesOverride, sessionBranches],
  );
  const authorityKey = sessionContext?.session?.id ?? 'test';
  const capabilities = capabilitiesOverride ?? sessionContext?.session?.capabilities ?? [];
  const canRead = capabilities.includes('class-slot:read');
  const canManage = capabilities.includes('class-slot:manage');
  const canManageAttendance = capabilities.includes('attendance:manage');
  const canViewAllBranches = capabilities.includes('branch:all');
  const globalMode = !branch && canViewAllBranches;
  const canOperate = Boolean(branch && canManage);
  const canOperateAttendance = Boolean(branch && canManageAttendance);
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
  const displayTimezone = branch?.timezone ?? branches[0]?.timezone ?? 'Asia/Jakarta';
  const week = useMemo(
    () => (branch || globalMode ? weekWindow(reference, displayTimezone) : null),
    [branch, displayTimezone, globalMode, reference],
  );

  const load = useCallback(async () => {
    if (!canRead || (!branch && !globalMode) || !week) return;
    setBusy(true);
    setFailure(undefined);
    try {
      const workspace = await client.discover({
        branchId: branch?.id,
        branches: globalMode ? branches : undefined,
        timezone: displayTimezone,
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
  }, [branch, branches, canRead, client, displayTimezone, globalMode, statusFilter, week]);

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
    void load();
  }, [load]);

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
  const branchName = (id: string) =>
    branches.find((item) => item.id === id)?.name ?? `Cabang ${id.slice(0, 8)}`;
  const visible = slots
    .filter((slot) => !classTypeFilter || slot.classTypeId === classTypeFilter)
    .filter((slot) => !instructorFilter || slot.instructorUserId === instructorFilter)
    .sort((left, right) => left.startAt.getTime() - right.startAt.getTime());
  const grouped = new Map(
    (week?.days ?? []).map((day) => [
      day,
      visible.filter((slot) => localDateKey(slot.startAt, displayTimezone) === day),
    ]),
  );

  if (!canRead) {
    return (
      <section
        className="rounded-dd-lg border border-dd-danger/30 bg-dd-danger-soft p-6"
        aria-labelledby="classes-title"
      >
        <PageHeader
          eyebrow="Akses terbatas"
          title="Timetable kelas"
          titleId="classes-title"
          description="Anda tidak memiliki capability untuk membaca jadwal kelas."
        />
        <Feedback kind="error">Akses kelas memerlukan capability class-slot:read.</Feedback>
      </section>
    );
  }

  if (!branch && !globalMode) {
    return (
      <section
        className="rounded-dd-lg border border-dd-line bg-dd-surface p-6 shadow-dd-card"
        aria-labelledby="classes-title"
      >
        <PageHeader
          eyebrow="Timetable branch-scoped"
          title="Timetable kelas"
          titleId="classes-title"
          description="Pilih cabang aktif pada bagian atas workspace untuk membuka jadwal."
        />
        <Feedback kind="warning">
          Pilih cabang aktif untuk membuka timetable sesuai scope Anda.
        </Feedback>
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
      {globalMode && <small>{branchName(slot.branchId)}</small>}
      <small>
        {slot.bookedCount}/{slot.capacity} terisi · min. {slot.minimumQuota}
      </small>
      <StatusBadge tone={classStatusTone(slot.status)}>{statusLabels[slot.status]}</StatusBadge>
    </button>
  );

  return (
    <section className="class-workspace" aria-labelledby="classes-title">
      <PageHeader
        eyebrow={
          globalMode ? 'Semua cabang · ringkasan global' : `${branch?.name} · ${branch?.timezone}`
        }
        title="Timetable kelas mingguan"
        titleId="classes-title"
        description={
          globalMode
            ? 'Pantau jadwal seluruh cabang. Pilih cabang aktif di topbar untuk menjalankan tindakan operasional.'
            : 'Kelola draft, instructor, publish, dan pembatalan pada waktu lokal cabang.'
        }
        context={
          <>
            <StatusBadge tone={canOperate ? 'success' : 'neutral'}>
              {canOperate ? 'Dapat mengelola' : 'Read only'}
            </StatusBadge>
            <span>{globalMode ? 'Scope global' : `Scope ${branch?.name}`}</span>
          </>
        }
      />

      {globalMode && (
        <Feedback kind="info">
          Anda sedang melihat seluruh cabang. Pilih satu cabang pada topbar untuk membuat atau
          mengubah kelas.
        </Feedback>
      )}

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
          disabled={!canOperate}
          title={globalMode ? 'Pilih cabang aktif untuk membuat kelas' : undefined}
          onClick={(event) => openPanel({ kind: 'create' }, event.currentTarget)}
        >
          Buat kelas
        </button>
      </div>

      <div className="calendar-filters" aria-label="Filter timetable">
        <label>
          Status
          <select
            className={controlClassName}
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
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
            className={controlClassName}
            value={classTypeFilter}
            onChange={(event) => setClassTypeFilter(event.target.value)}
          >
            <option value="">Semua class type</option>
            {classTypes.map((item) => (
              <option value={item.id} key={item.id}>
                {globalMode && item.branchId ? `${branchName(item.branchId)} · ` : ''}
                {item.code} · {item.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Instructor
          <select
            className={controlClassName}
            value={instructorFilter}
            onChange={(event) => setInstructorFilter(event.target.value)}
          >
            <option value="">Semua instructor</option>
            {instructors.map((item) => (
              <option value={item.id} key={item.id}>
                {globalMode && item.branchId ? `${branchName(item.branchId)} · ` : ''}
                {item.displayName}
              </option>
            ))}
          </select>
        </label>
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
                <h2 id={`day-${day}`}>{formatBranchDay(day, displayTimezone)}</h2>
                <div>{grouped.get(day)?.map(slotCard)}</div>
              </section>
            ))}
          </div>
          <div className="mobile-agenda" aria-label="Agenda kelas mingguan">
            {week?.days.map((day) => (
              <section key={day}>
                <h2>{formatBranchDay(day, displayTimezone)}</h2>
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
          className="fixed inset-0 z-[80] bg-dd-sidebar/50 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closePanel();
          }}
        >
          <div
            className="ml-auto h-full w-full max-w-xl overflow-y-auto border-l border-dd-line bg-dd-surface p-6 shadow-dd-float"
            aria-label={panel.kind === 'create' ? 'Buat kelas' : 'Detail kelas'}
            aria-modal="true"
            role="dialog"
          >
            <div className="mb-6 flex items-start justify-between gap-4 border-b border-dd-line pb-4">
              <div>
                <p className="eyebrow">
                  {panel.kind === 'detail' ? branchName(panel.slot.branchId) : branch?.name} ·{' '}
                  {panel.kind === 'detail' ? panel.slot.timezone : branch?.timezone}
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
                branchId={branch!.id}
                timezone={branch!.timezone}
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
                canManage={canOperate}
                canManageAttendance={canOperateAttendance}
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
