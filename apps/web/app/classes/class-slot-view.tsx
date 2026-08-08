'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  browserClassSlotClient,
  classSlotFailure,
  type ClassSlot,
  type ClassSlotClient,
  type ClassTypeOption,
  type InstructorOption,
  type StudioOption,
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
import { SearchSelect, SelectInput } from '../components/forms';
import { Button } from '../components/actions';
import { Drawer, useAppFeedback } from '../components/app-feedback';
import { browserBookingClient, type BookingClient } from '../booking-client';

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
  bookingClient = browserBookingClient,
}: {
  client?: ClassSlotClient;
  branchOverride?: BranchOption;
  branchesOverride?: BranchOption[];
  capabilitiesOverride?: readonly string[];
  bookingClient?: Pick<BookingClient, 'list'> & Partial<Pick<BookingClient, 'issueBulkCheckIns'>>;
}) {
  const sessionContext = useSessionContext();
  const feedback = useAppFeedback();
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
  const canCompleteClass = canManage || capabilities.includes('attendance:self');
  const canReadBookings = capabilities.includes('booking:read');
  const canViewAllBranches = capabilities.includes('branch:all');
  const globalMode = !branch && canViewAllBranches;
  const canOperate = Boolean(branch && canManage);
  const canOperateAttendance = Boolean(branch && canManageAttendance);
  const [reference, setReference] = useState(new Date());
  const [slots, setSlots] = useState<ClassSlot[]>([]);
  const [classTypes, setClassTypes] = useState<ClassTypeOption[]>([]);
  const [instructors, setInstructors] = useState<InstructorOption[]>([]);
  const [studios, setStudios] = useState<StudioOption[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [classTypeFilter, setClassTypeFilter] = useState('');
  const [instructorFilter, setInstructorFilter] = useState('');
  const [panel, setPanel] = useState<Panel>(null);
  const [message, setMessage] = useState<string>();
  const [failure, setFailure] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [panelDirty, setPanelDirty] = useState(false);
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
      setStudios(workspace.studios);
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
    setStudios([]);
    setClassTypeFilter('');
    setInstructorFilter('');
    setPanel(null);
    setMessage(undefined);
    setFailure(undefined);
  }, [branch?.id, authorityKey]);

  useEffect(() => {
    void load();
  }, [load]);

  const openPanel = (next: NonNullable<Panel>) => {
    setPanelDirty(false);
    setPanel(next);
  };
  const closePanel = () => {
    setPanelDirty(false);
    setPanel(null);
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
      onClick={() => openPanel({ kind: 'detail', slot })}
    >
      <span>
        {formatBranchTime(slot.startAt, slot.timezone)}–
        {formatBranchTime(slot.endAt, slot.timezone)}
      </span>
      <StatusBadge tone="info">
        <span>Tipe kelas ·</span> <span>{classTypeName(slot.classTypeId)}</span>
      </StatusBadge>
      <small>{instructorName(slot.instructorUserId)}</small>
      {globalMode && <small>{branchName(slot.branchId)}</small>}
      <small>
        {slot.bookedCount} peserta · {Math.max(0, slot.capacity - slot.bookedCount)} tempat tersedia
        {' · '}min. {slot.minimumQuota}
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
          <Button variant="secondary" onClick={() => setReference(shiftWeek(reference, -1))}>
            ← Minggu sebelumnya
          </Button>
          <Button variant="secondary" onClick={() => setReference(new Date())}>
            Hari ini
          </Button>
          <Button variant="secondary" onClick={() => setReference(shiftWeek(reference, 1))}>
            Minggu berikutnya →
          </Button>
        </div>
        <strong aria-live="polite">{week?.label}</strong>
        <Button
          disabled={!canOperate}
          title={globalMode ? 'Pilih cabang aktif untuk membuat kelas' : undefined}
          onClick={() => openPanel({ kind: 'create' })}
        >
          Buat kelas
        </Button>
      </div>

      <div className="calendar-filters" aria-label="Filter timetable">
        <SelectInput
          label="Status"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          {statuses.map((status) => (
            <option value={status} key={status}>
              {status === 'ALL' ? 'Semua status' : statusLabels[status]}
            </option>
          ))}
        </SelectInput>
        <SearchSelect
          label="Tipe kelas"
          value={classTypeFilter}
          placeholder="Semua tipe kelas"
          options={classTypes.map((item) => ({
            id: item.id,
            label: item.name,
            description: `${globalMode && item.branchId ? `${branchName(item.branchId)} · ` : ''}${item.code}`,
          }))}
          onChange={setClassTypeFilter}
        />
        <SearchSelect
          label="Instruktur"
          value={instructorFilter}
          placeholder="Semua instruktur"
          options={instructors.map((item) => ({
            id: item.id,
            label: item.displayName,
            description: globalMode && item.branchId ? branchName(item.branchId) : undefined,
          }))}
          onChange={setInstructorFilter}
        />
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

      <Drawer
        open={Boolean(panel)}
        title={
          panel?.kind === 'create'
            ? 'Buat draft kelas'
            : panel?.kind === 'detail'
              ? classTypeName(panel.slot.classTypeId)
              : 'Kelas'
        }
        description={
          panel
            ? `${panel.kind === 'detail' ? branchName(panel.slot.branchId) : branch?.name} · ${
                panel.kind === 'detail' ? panel.slot.timezone : branch?.timezone
              }`
            : undefined
        }
        busy={busy}
        className={panel?.kind === 'detail' ? 'max-w-4xl' : undefined}
        dirty={panel?.kind === 'create' && panelDirty}
        onDirtyClose={() =>
          feedback.confirm({
            tone: 'warning',
            title: 'Batalkan pembuatan kelas?',
            message: 'Jadwal yang belum disimpan akan hilang.',
            confirmLabel: 'Buang input',
          })
        }
        onClose={closePanel}
        footer={
          panel?.kind === 'create' ? (
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={busy}
                onClick={() =>
                  void (async () => {
                    if (
                      !panelDirty ||
                      (await feedback.confirm({
                        tone: 'warning',
                        title: 'Batalkan pembuatan kelas?',
                        message: 'Jadwal yang belum disimpan akan hilang.',
                        confirmLabel: 'Buang input',
                      }))
                    )
                      closePanel();
                  })()
                }
              >
                Batal
              </Button>
              <Button
                type="submit"
                form="class-slot-create-form"
                loading={busy}
                disabled={classTypes.length === 0 || studios.length === 0}
              >
                Buat draft
              </Button>
            </div>
          ) : undefined
        }
      >
        {panel?.kind === 'create' && branch ? (
          <CreatePanel
            branchId={branch.id}
            timezone={branch.timezone}
            classTypes={classTypes}
            instructors={instructors}
            studios={studios.filter((studio) => studio.branchId === branch.id)}
            busy={busy}
            onDirty={() => setPanelDirty(true)}
            onCreate={async (input) => {
              const accepted = await feedback.confirm({
                tone: 'warning',
                title: 'Buat draft kelas?',
                message: 'Jadwal akan dibuat sebagai draft pada cabang aktif.',
                confirmLabel: 'Buat draft',
              });
              if (!accepted) return;
              await run(() => client.create(input), 'Draft kelas berhasil dibuat.');
              closePanel();
            }}
          />
        ) : panel?.kind === 'detail' ? (
          <DetailPanel
            slot={panel.slot}
            classTypeName={classTypeName(panel.slot.classTypeId)}
            instructorName={instructorName(panel.slot.instructorUserId)}
            classTypes={classTypes}
            instructors={instructors}
            canManage={canOperate}
            canComplete={canCompleteClass}
            canManageAttendance={canOperateAttendance}
            canReadBookings={canReadBookings}
            bookingClient={bookingClient}
            busy={busy}
            onAssign={async (instructorId) => {
              const accepted = await feedback.confirm({
                tone: 'warning',
                title: 'Tetapkan instruktur?',
                message: 'Instruktur terpilih akan ditetapkan pada kelas ini.',
                confirmLabel: 'Tetapkan',
              });
              if (accepted)
                await run(
                  () => client.assign(panel.slot.id, instructorId, panel.slot.version),
                  'Instructor berhasil ditetapkan.',
                );
            }}
            onUpdate={async (input) => {
              const accepted = await feedback.confirm({
                tone: 'warning',
                title: 'Simpan perubahan kelas?',
                message:
                  'Jadwal draft dan konfigurasi kapasitas akan dihitung ulang. Perubahan dicatat dalam audit.',
                confirmLabel: 'Simpan perubahan',
              });
              if (accepted)
                await run(
                  () =>
                    client.update(panel.slot.id, {
                      ...input,
                      expectedVersion: panel.slot.version,
                    }),
                  'Draft kelas berhasil diperbarui.',
                );
            }}
            onPublish={async () => {
              const accepted = await feedback.confirm({
                tone: 'warning',
                title: 'Publikasikan kelas?',
                message: 'Kelas akan tersedia pada katalog dan workflow booking.',
                confirmLabel: 'Publikasikan',
              });
              if (accepted)
                await run(
                  () => client.publish(panel.slot.id, panel.slot.version),
                  'Kelas berhasil dipublikasikan.',
                );
            }}
            onCancel={async (reason) => {
              const accepted = await feedback.confirm({
                tone: 'danger',
                title: 'Batalkan kelas?',
                message: 'Reservasi aktif akan dilepaskan dan tindakan dicatat dalam audit.',
                confirmLabel: 'Batalkan kelas',
              });
              if (accepted)
                await run(
                  () => client.cancel(panel.slot.id, reason, panel.slot.version),
                  'Kelas berhasil dibatalkan.',
                );
            }}
            onComplete={async (reason) => {
              setBusy(true);
              setFailure(undefined);
              try {
                const control = await client.completionControl(panel.slot.id);
                const accepted = await feedback.confirm({
                  tone: 'danger',
                  title: 'Selesaikan kelas?',
                  message: `${control.attendanceCount} hadir dan ${control.noShowCount} no-show akan diposting. ${control.activeReservationCount} reservation aktif akan dikonsumsi satu kali.`,
                  confirmLabel: 'Selesaikan kelas',
                });
                if (!accepted) return;
                const result = await client.complete(
                  panel.slot.id,
                  control.expectedVersion,
                  control.controlHash,
                  reason,
                );
                const updated = {
                  ...panel.slot,
                  status: 'COMPLETED' as const,
                  bookedCount: 0,
                  version: panel.slot.version + 1,
                };
                setSlots((current) =>
                  current.map((slot) => (slot.id === updated.id ? updated : slot)),
                );
                setPanel({ kind: 'detail', slot: updated });
                setMessage(
                  `Kelas selesai: ${result.attendanceCount} hadir, ${result.noShowCount ?? 0} no-show.`,
                );
              } catch (error) {
                setFailure(classSlotFailure(error));
              } finally {
                setBusy(false);
              }
            }}
          />
        ) : null}
      </Drawer>
    </section>
  );
}
