'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  browserClassSlotClient,
  classSlotFailure,
  type ClassSlot,
  type ClassSlotClient,
  type ClassTypeOption,
  type InstructorOption,
  type StudioOption,
} from '@/api-clients/class-slot-client';
import {
  formatBranchDay,
  formatBranchTime,
  localDateKey,
  shiftWeek,
  weekWindow,
} from '@/lib/class-time';
import { EmptyState, Feedback, Skeleton, StatusBadge } from '../ui';
import { AdminPageHeader } from '../components/admin/admin-page-header';
import { useSessionContext } from '../session-context';
import { CreatePanel, DetailPanel } from './class-slot-panels';
import { classStatusTone, statusLabels } from './class-slot-presenters';
import { SearchSelect, SelectInput } from '../components/forms';
import { Button } from '../components/actions';
import { Drawer, useAppFeedback } from '../components/app-feedback';
import { browserBookingClient, type BookingClient } from '@/api-clients/booking-client';

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
      ? (instructors.find((item) => item.id === id)?.displayName ?? `Instruktur ${id.slice(0, 8)}`)
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
        <AdminPageHeader
          title="Timetable kelas"
          titleId="classes-title"
          description="Anda tidak memiliki izin untuk membaca jadwal kelas."
        />
        <Feedback kind="error">Akses kelas memerlukan izin class-slot:read.</Feedback>
      </section>
    );
  }

  if (!branch && !globalMode) {
    return (
      <section
        className="rounded-dd-lg border border-dd-line bg-dd-surface p-6 shadow-dd-card"
        aria-labelledby="classes-title"
      >
        <AdminPageHeader
          title="Timetable kelas"
          titleId="classes-title"
          description="Pilih cabang aktif pada bagian atas workspace untuk membuka jadwal."
        />
        <Feedback kind="warning">
          Pilih cabang aktif untuk membuka timetable sesuai cakupan Anda.
        </Feedback>
      </section>
    );
  }

  const slotCard = (slot: ClassSlot) => {
    const isCancelled = slot.status === 'CANCELLED' || slot.status === 'AUTO_CANCELLED';
    const isDraft = slot.status === 'DRAFT';
    return (
      <button
        type="button"
        className={`w-full text-left rounded-xl border p-3 shadow-xs transition-all duration-200 flex flex-col gap-1.5 focus-visible:ring-2 focus-visible:ring-dd-forest cursor-pointer hover:shadow-md ${
          isCancelled
            ? 'border-red-200 bg-red-50/40 text-red-950 opacity-80'
            : isDraft
              ? 'border-amber-200 bg-amber-50/30 hover:border-amber-400'
              : 'border-dd-line/80 bg-white hover:border-dd-forest/60'
        }`}
        key={slot.id}
        onClick={() => openPanel({ kind: 'detail', slot })}
      >
        <div className="flex items-center justify-between gap-1 text-xs font-bold text-dd-ink">
          <span>
            {formatBranchTime(slot.startAt, slot.timezone)}–
            {formatBranchTime(slot.endAt, slot.timezone)}
          </span>
          <StatusBadge tone={classStatusTone(slot.status)}>
            {statusLabels[slot.status]}
          </StatusBadge>
        </div>
        <div className="font-semibold text-sm text-dd-forest leading-snug">
          {classTypeName(slot.classTypeId)}
        </div>
        <div className="text-xs text-dd-ink font-medium">
          {instructorName(slot.instructorUserId)}
        </div>
        {globalMode && (
          <div className="text-[11px] text-dd-muted">
            {branchName(slot.branchId)}
          </div>
        )}
        <div className="mt-1 pt-1.5 border-t border-dd-line/60 text-[11px] text-dd-muted flex items-center justify-between">
          <span>{slot.bookedCount}/{slot.capacity} terisi</span>
          <span>min. {slot.minimumQuota}</span>
        </div>
      </button>
    );
  };

  return (
    <section className="space-y-6" aria-labelledby="classes-title">
      <AdminPageHeader
        title="Timetable kelas mingguan"
        titleId="classes-title"
        description={
          globalMode
            ? 'Pantau jadwal seluruh cabang. Pilih cabang aktif di topbar untuk menjalankan tindakan operasional.'
            : 'Kelola draft, instruktur, publish, dan pembatalan pada waktu lokal cabang.'
        }
        actions={
          <>
            <StatusBadge tone={canOperate ? 'success' : 'neutral'}>
              {canOperate ? 'Dapat mengelola' : 'Hanya lihat'}
            </StatusBadge>
            {!globalMode && (
              <StatusBadge tone="neutral">Zona waktu {branch?.timezone}</StatusBadge>
            )}
          </>
        }
      />

      {globalMode && (
        <Feedback kind="info">
          Anda sedang melihat seluruh cabang. Pilih satu cabang pada topbar untuk membuat atau
          mengubah kelas.
        </Feedback>
      )}

      {/* Toolbar & Filter Panel */}
      <div className="rounded-2xl border border-dd-line/80 bg-white p-5 shadow-dd-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-dd-line/60" aria-label="Kontrol timetable">
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setReference(shiftWeek(reference, -1))}>
              <span className="inline-flex items-center gap-1">
                <ChevronLeft className="size-4" />
                <span className="hidden sm:inline">Minggu sebelumnya</span>
              </span>
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setReference(new Date())}>
              Hari ini
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setReference(shiftWeek(reference, 1))}>
              <span className="inline-flex items-center gap-1">
                <span className="hidden sm:inline">Minggu berikutnya</span>
                <ChevronRight className="size-4" />
              </span>
            </Button>
          </div>
          <strong className="text-base font-bold text-dd-ink" aria-live="polite">{week?.label}</strong>
          <Button
            disabled={!canOperate}
            title={globalMode ? 'Pilih cabang aktif untuk membuat kelas' : undefined}
            onClick={() => openPanel({ kind: 'create' })}
          >
            Buat kelas
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" aria-label="Filter timetable">
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
          description="Ubah status, class type, atau instruktur."
        />
      ) : (
        <>
          {/* Desktop 7-Column Grid */}
          <div className="hidden md:grid md:grid-cols-7 gap-3 items-start" role="region" aria-label="Kalender kelas tujuh hari">
            {week?.days.map((day) => {
              const daySlots = grouped.get(day) ?? [];
              return (
                <section
                  className="flex flex-col gap-2 rounded-2xl border border-dd-line/80 bg-white/95 p-3 shadow-xs min-h-[380px]"
                  aria-labelledby={`day-${day}`}
                  key={day}
                >
                  <h2
                    id={`day-${day}`}
                    className="text-xs font-bold uppercase tracking-wider text-dd-forest pb-2.5 border-b border-dd-line text-center"
                  >
                    {formatBranchDay(day, displayTimezone)}
                  </h2>
                  <div className="flex flex-col gap-2.5 flex-1 pt-1">
                    {daySlots.length ? (
                      daySlots.map(slotCard)
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-center p-3 text-xs text-dd-muted italic">
                        Tidak ada kelas
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>

          {/* Mobile Agenda View */}
          <div className="md:hidden flex flex-col gap-4" aria-label="Agenda kelas mingguan">
            {week?.days.map((day) => {
              const daySlots = grouped.get(day) ?? [];
              return (
                <section key={day} className="rounded-2xl border border-dd-line bg-white p-4 shadow-xs flex flex-col gap-3">
                  <h2 className="text-sm font-bold text-dd-ink pb-2 border-b border-dd-line flex items-center justify-between">
                    <span>{formatBranchDay(day, displayTimezone)}</span>
                    <span className="text-xs font-normal text-dd-muted">{daySlots.length} sesi</span>
                  </h2>
                  <div className="flex flex-col gap-2.5">
                    {daySlots.length ? (
                      daySlots.map(slotCard)
                    ) : (
                      <p className="text-xs text-dd-muted italic py-2">Tidak ada kelas pada hari ini.</p>
                    )}
                  </div>
                </section>
              );
            })}
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
                  'Instruktur berhasil ditetapkan.',
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
