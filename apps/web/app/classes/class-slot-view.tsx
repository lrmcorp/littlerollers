'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, SlidersHorizontal, Tv } from 'lucide-react';
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
  formatBranchLongDate,
  formatBranchTime,
  localDateKey,
  shiftWeek,
  weekWindow,
} from '@/lib/class-time';
import { EmptyState, Feedback, Skeleton, StatusBadge } from '../ui';
import { AdminPageHeader } from '../components/admin/admin-page-header';
import { useSessionContext } from '../session-context';
import { CreatePanel, DetailPanel, type CreateTemplate } from './class-slot-panels';
import { LifecycleDialog } from '../components/admin/lifecycle-dialog';
import { classStatusTone, statusLabels, timezoneLabel } from './class-slot-presenters';
import { SearchSelect, SelectInput } from '../components/forms';
import { Button, ButtonLink } from '../components/actions';
import { Drawer, useAppFeedback } from '../components/app-feedback';
import { browserBookingClient, type BookingClient } from '@/api-clients/booking-client';

type Panel = { kind: 'create'; template?: CreateTemplate } | { kind: 'detail'; slot: ClassSlot } | null;
type BranchOption = { id: string; code?: string; name: string; timezone: string };
/** Nama yang dikirim API bersama slot (tidak ada di tipe ter-generate). */
type SlotNames = {
  classType?: { name?: string | null } | null;
  instructor?: { displayName?: string | null } | null;
  branch?: { name?: string | null } | null;
};

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
  branchOverride?: BranchOption | null;
  branchesOverride?: BranchOption[];
  capabilitiesOverride?: readonly string[];
  bookingClient?: Pick<BookingClient, 'list'> &
    Partial<Pick<BookingClient, 'issueBulkCheckIns' | 'issueInstructorCheckIn'>>;
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
  const canCreateSlot = Boolean((branch || (globalMode && branches.length > 0)) && canManage);
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
  const [slotToDelete, setSlotToDelete] = useState<ClassSlot | null>(null);
  const [selectedMobileDay, setSelectedMobileDay] = useState<string>('ALL');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const displayTimezone = branch?.timezone ?? branches[0]?.timezone ?? 'Asia/Jakarta';
  const week = useMemo(
    () => (branch || globalMode ? weekWindow(reference, displayTimezone) : null),
    [branch, displayTimezone, globalMode, reference],
  );
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== 'ALL') count++;
    if (classTypeFilter) count++;
    if (instructorFilter) count++;
    return count;
  }, [statusFilter, classTypeFilter, instructorFilter]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branch?.id, branches.length, canRead, client, displayTimezone, globalMode, statusFilter, week?.start, week?.end]);

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
  /** Nilai awal draft baru dari kelas yang ada: sama persis, satu minggu kemudian. */
  const duplicateTemplate = (slot: ClassSlot): CreateTemplate => {
    const next = new Date(slot.startAt.getTime() + 7 * 86_400_000);
    const clock = (value: Date) =>
      new Intl.DateTimeFormat('en-GB', {
        timeZone: slot.timezone,
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      }).format(value);
    return {
      classTypeId: slot.classTypeId,
      studioId: slot.studioId,
      roomId: slot.roomId,
      instructorUserId: slot.instructorUserId,
      date: localDateKey(next, slot.timezone),
      startTime: clock(slot.startAt),
      endTime: clock(slot.endAt),
      instructorFeeRp: slot.isManualFee ? slot.instructorFeeRp : undefined,
    };
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
  // API sudah menyertakan nama tipe kelas/instruktur/cabang pada slot; daftar lokal hanya cadangan.
  const classTypeName = (id: string, slot?: ClassSlot) =>
    (slot as SlotNames | undefined)?.classType?.name ??
    classTypes.find((item) => item.id === id)?.name ??
    'Tipe kelas';
  const instructorName = (id?: string | null, slot?: ClassSlot) =>
    id
      ? ((slot as SlotNames | undefined)?.instructor?.displayName ??
        instructors.find((item) => item.id === id)?.displayName ??
        'Instruktur belum dimuat')
      : 'Belum ditetapkan';
  const branchName = (id: string, slot?: ClassSlot) =>
    (slot as SlotNames | undefined)?.branch?.name ??
    branches.find((item) => item.id === id)?.name ??
    'Cabang';
  // Role baca-saja (Owner/instruktur) tidak punya akses katalog; opsi filter diambil dari slot yang tampil.
  const classTypeOptions = classTypes.length
    ? classTypes.map((item) => ({
        id: item.id,
        label: item.name,
        description: `${globalMode && item.branchId ? `${branchName(item.branchId)} · ` : ''}${item.code}`,
      }))
    : [...new Map(slots.map((slot) => [slot.classTypeId, slot])).values()].map((slot) => ({
        id: slot.classTypeId,
        label: classTypeName(slot.classTypeId, slot),
        description: undefined,
      }));
  const instructorOptions = instructors.length
    ? instructors.map((item) => ({
        id: item.id,
        label: item.displayName,
        description: globalMode && item.branchId ? branchName(item.branchId) : undefined,
      }))
    : [
        ...new Map(
          slots.filter((slot) => slot.instructorUserId).map((slot) => [slot.instructorUserId!, slot]),
        ).values(),
      ].map((slot) => ({
        id: slot.instructorUserId!,
        label: instructorName(slot.instructorUserId, slot),
        description: undefined,
      }));
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
            ? 'border-dd-danger/30 bg-dd-danger-soft/40 text-dd-danger opacity-80'
            : isDraft
              ? 'border-dd-warning/30 bg-dd-warning-soft/30 hover:border-dd-warning'
              : 'border-dd-line/80 bg-white hover:border-dd-forest/60'
        }`}
        key={slot.id}
        onClick={() => openPanel({ kind: 'detail', slot })}
      >
        <div className="flex items-center justify-between gap-1.5 w-full flex-wrap xl:flex-col xl:items-start 2xl:flex-row 2xl:items-center 2xl:justify-between text-xs font-bold text-dd-ink">
          <span className="whitespace-nowrap">
            {formatBranchTime(slot.startAt, slot.timezone)}–
            {formatBranchTime(slot.endAt, slot.timezone)}
          </span>
          <StatusBadge tone={classStatusTone(slot.status)}>
            {statusLabels[slot.status]}
          </StatusBadge>
        </div>
        <div className="font-semibold text-sm text-dd-forest leading-snug">
          {classTypeName(slot.classTypeId, slot)}
        </div>
        <div className="text-xs text-dd-ink font-medium">
          {instructorName(slot.instructorUserId, slot)}
        </div>
        {globalMode && (
          <div className="text-[11px] text-dd-muted">
            {branchName(slot.branchId, slot)}
          </div>
        )}
        <div className={`mt-1 pt-1.5 border-t border-dd-line/60 text-[11px] flex items-center justify-between ${
          slot.bookedCount > slot.capacity
            ? 'text-red-700 font-semibold'
            : slot.bookedCount >= slot.capacity
              ? 'text-amber-700 font-medium'
              : 'text-dd-muted'
        }`}>
          {slot.bookedCount > slot.capacity ? (
            <span className="rounded bg-red-100 text-red-700 px-1 py-0.5 font-bold inline-flex items-center gap-0.5">
              <span>⚠️</span> {slot.bookedCount}/{slot.capacity} lewat kapasitas
            </span>
          ) : (
            <span>{slot.bookedCount}/{slot.capacity} terisi</span>
          )}
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
            ? 'Pantau jadwal seluruh cabang. Anda dapat membuat kelas langsung dengan memilih cabang studio tujuan pada formulir.'
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
          Anda sedang melihat seluruh cabang. Klik tombol &ldquo;Buat kelas&rdquo; untuk menjadwalkan
          kelas di cabang pilihan Anda, atau pilih cabang spesifik untuk fokus operasional.
        </Feedback>
      )}

      {/* Toolbar & Filter Panel */}
      <div className="rounded-2xl border border-dd-line/80 bg-white p-4 sm:p-5 shadow-dd-card space-y-4">
        <div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-4 border-b border-dd-line/60"
          aria-label="Kontrol timetable"
        >
          <div className="flex items-center justify-between gap-2 sm:gap-4 flex-1">
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                variant="secondary"
                size="sm"
                aria-label="Minggu sebelumnya"
                onClick={() => setReference(shiftWeek(reference, -1))}
              >
                <span className="inline-flex items-center gap-1">
                  <ChevronLeft className="size-4" />
                  <span className="hidden sm:inline">Minggu sebelumnya</span>
                </span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setReference(new Date())}
              >
                Hari ini
              </Button>
              <Button
                variant="secondary"
                size="sm"
                aria-label="Minggu berikutnya"
                onClick={() => setReference(shiftWeek(reference, 1))}
              >
                <span className="inline-flex items-center gap-1">
                  <span className="hidden sm:inline">Minggu berikutnya</span>
                  <ChevronRight className="size-4" />
                </span>
              </Button>
            </div>
            <strong
              className="text-xs sm:text-base font-bold text-dd-ink text-right sm:text-center flex-1"
              aria-live="polite"
            >
              {week?.label}
            </strong>
          </div>
          <div className="shrink-0 w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2">
            {canManageAttendance && (
              <ButtonLink
                variant="secondary"
                size="sm"
                href={branch?.code ? `/kiosk/${encodeURIComponent(branch.code.toLowerCase())}` : '/kiosk'}
                target="_blank"
                rel="noopener noreferrer"
                title="Buka Layar Kiosk Studio di tab baru untuk tablet meja resepsionis"
                className="w-full sm:w-auto min-h-[40px] sm:min-h-0 inline-flex items-center gap-1.5"
              >
                <Tv className="size-4 shrink-0" />
                <span>Layar Kiosk Studio</span>
              </ButtonLink>
            )}
            <Button
              className="w-full sm:w-auto min-h-[40px] sm:min-h-0"
              disabled={!canCreateSlot}
              title={
                !canManage
                  ? 'Akses membuat kelas memerlukan izin class-slot:manage'
                  : undefined
              }
              onClick={() => openPanel({ kind: 'create' })}
            >
              Buat kelas
            </Button>
          </div>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="sm:hidden flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsFilterOpen((prev) => !prev)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-dd-forest bg-dd-forest/10 hover:bg-dd-forest/20 px-3 py-2 rounded-lg transition"
            aria-expanded={isFilterOpen}
          >
            <SlidersHorizontal className="size-3.5" />
            <span>{isFilterOpen ? 'Tutup filter' : 'Filter & pencarian'}</span>
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-dd-forest text-white text-[10px] px-1.5 py-0.5 font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter('ALL');
                setClassTypeFilter('');
                setInstructorFilter('');
              }}
              className="text-xs text-dd-muted hover:text-dd-ink underline"
            >
              Reset filter
            </button>
          )}
        </div>

        <div
          className={`${isFilterOpen ? 'grid' : 'hidden sm:grid'} grid-cols-1 sm:grid-cols-3 gap-3`}
          aria-label="Filter timetable"
        >
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
            options={classTypeOptions}
            onChange={setClassTypeFilter}
          />
          <SearchSelect
            label="Instruktur"
            value={instructorFilter}
            placeholder="Semua instruktur"
            options={instructorOptions}
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
          {/* Desktop 7-Column Grid (≥ xl, 1280px+) */}
          <div className="hidden xl:block overflow-x-auto pb-4 -mx-2 px-2 sm:mx-0 sm:px-0">
            <div
              className="grid grid-cols-7 gap-3 items-start min-w-[940px] xl:min-w-0"
              role="region"
              aria-label="Kalender kelas tujuh hari"
            >
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
          </div>

          {/* Mobile & Tablet Agenda View with 1-Tap Day Filter (< xl) */}
          <div className="xl:hidden flex flex-col gap-4" aria-label="Agenda kelas mingguan">
            {/* Quick Day Selector Strip */}
            <div
              className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar"
              role="group"
              aria-label="Pilih hari jadwal"
            >
              <button
                type="button"
                onClick={() => setSelectedMobileDay('ALL')}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  selectedMobileDay === 'ALL'
                    ? 'bg-dd-forest text-white shadow-xs'
                    : 'bg-dd-surface-muted text-dd-muted hover:text-dd-ink border border-dd-line/60'
                }`}
              >
                Semua ({visible.length})
              </button>
              {week?.days.map((day) => {
                const daySlots = grouped.get(day) ?? [];
                const isSelected = selectedMobileDay === day;
                const dayNum = day.slice(8, 10);
                const dayName = formatBranchDay(day, displayTimezone).slice(0, 3);
                const isToday = localDateKey(new Date(), displayTimezone) === day;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedMobileDay(day)}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-dd-forest text-white shadow-xs'
                        : 'bg-dd-surface-muted text-dd-muted hover:text-dd-ink border border-dd-line/60'
                    }`}
                  >
                    {isToday && (
                      <span
                        className={`size-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-dd-forest'}`}
                        title="Hari ini"
                      />
                    )}
                    <span>{dayName}, {dayNum}</span>
                    <span
                      className={`text-[10px] px-1 rounded-full ${
                        isSelected ? 'bg-white/25 text-white' : 'bg-dd-line text-dd-muted'
                      }`}
                    >
                      {daySlots.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Day Cards: 1-col on mobile, 2-col on tablet if ALL is active */}
            <div
              className={
                selectedMobileDay === 'ALL'
                  ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
                  : 'flex flex-col gap-4'
              }
            >
              {week?.days
                .filter((day) => selectedMobileDay === 'ALL' || selectedMobileDay === day)
                .map((day) => {
                  const daySlots = grouped.get(day) ?? [];
                  const isToday = localDateKey(new Date(), displayTimezone) === day;
                  return (
                    <section
                      key={day}
                      className={`rounded-2xl border bg-white p-4 shadow-xs flex flex-col gap-3 ${
                        isToday ? 'border-dd-forest/40 ring-1 ring-dd-forest/20' : 'border-dd-line'
                      }`}
                    >
                      <h2 className="text-sm font-bold text-dd-ink pb-2 border-b border-dd-line flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          {formatBranchDay(day, displayTimezone)}
                          {isToday && (
                            <span className="rounded-full bg-dd-forest/10 text-dd-forest text-[10px] font-semibold px-2 py-0.5">
                              Hari ini
                            </span>
                          )}
                        </span>
                        <span className="text-xs font-normal text-dd-muted">
                          {daySlots.length} sesi
                        </span>
                      </h2>
                      <div className="flex flex-col gap-2.5">
                        {daySlots.length ? (
                          daySlots.map(slotCard)
                        ) : (
                          <p className="text-xs text-dd-muted italic py-2">
                            Tidak ada kelas pada hari ini.
                          </p>
                        )}
                      </div>
                    </section>
                  );
                })}
            </div>
          </div>
        </>
      )}

      <Drawer
        open={Boolean(panel)}
        title={
          panel?.kind === 'create'
            ? panel.template
              ? 'Duplikat kelas'
              : 'Buat draft kelas'
            : panel?.kind === 'detail'
              ? classTypeName(panel.slot.classTypeId, panel.slot)
              : 'Kelas'
        }
        description={
          panel?.kind === 'detail'
            ? `${formatBranchLongDate(panel.slot.startAt, panel.slot.timezone)} · ${branchName(panel.slot.branchId, panel.slot)}`
            : panel?.kind === 'create'
              ? branch?.name
                ? `${branch.name} · ${timezoneLabel(branch.timezone)}`
                : 'Pilih cabang dan konfigurasi jadwal kelas baru'
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
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={busy}
                className="w-full sm:w-auto"
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
                className="w-full sm:w-auto"
              >
                Buat draft
              </Button>
            </div>
          ) : undefined
        }
      >
        {panel?.kind === 'create' && (branch || (globalMode && branches.length > 0)) ? (
          <CreatePanel
            branchId={branch?.id ?? branches[0]?.id ?? ''}
            branches={branches}
            timezone={branch?.timezone ?? branches[0]?.timezone ?? displayTimezone}
            classTypes={classTypes}
            instructors={instructors}
            studios={studios}
            busy={busy}
            template={panel.template}
            onDirty={() => setPanelDirty(true)}
            onBranchChange={async (selectedBranchId) => {
              if (client.getBranchStudios) {
                try {
                  const branchStudios = await client.getBranchStudios(selectedBranchId);
                  setStudios((prev) => {
                    const others = prev.filter((s) => s.branchId !== selectedBranchId);
                    return [...others, ...branchStudios];
                  });
                } catch (err) {
                  console.error('Gagal memuat studio cabang:', err);
                }
              }
            }}
            onCreate={async (input) => {
              const accepted = await feedback.confirm({
                tone: 'warning',
                title: 'Buat draft kelas?',
                message: 'Jadwal akan dibuat sebagai draft.',
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
            branchCode={branch?.code ?? branches.find((b) => b.id === panel.slot.branchId)?.code}
            instructorName={instructorName(panel.slot.instructorUserId, panel.slot)}
            classTypes={classTypes}
            instructors={instructors}
            studios={studios}
            canManage={canOperate}
            canComplete={canCompleteClass}
            canManageAttendance={canOperateAttendance}
            canReadBookings={canReadBookings}
            canVerifyInstructor={canOperateAttendance && Boolean(client.verifyInstructorAttendance)}
            bookingClient={bookingClient}
            busy={busy}
            onDuplicate={() => openPanel({ kind: 'create', template: duplicateTemplate(panel.slot) })}
            onDelete={() => setSlotToDelete(panel.slot)}
            onVerifyInstructor={async (notes) => {
              const accepted = await feedback.confirm({
                tone: 'warning',
                title: 'Verifikasi presensi instruktur?',
                message:
                  'Instruktur dicatat hadir pada kelas ini dan honornya dihitung sebagai terverifikasi. Tindakan ini tercatat atas nama Anda.',
                confirmLabel: 'Verifikasi',
              });
              if (!accepted) return;
              await run(async () => {
                const result = await client.verifyInstructorAttendance!(panel.slot.id, notes);
                return {
                  ...panel.slot,
                  instructorAttendance: { checkedInAt: result.checkedInAt, method: result.method },
                };
              }, 'Presensi instruktur berhasil dicatat.');
            }}
            onAssign={async (instructorId) => {
              const accepted = await feedback.confirm({
                tone: 'warning',
                title: 'Tetapkan instruktur?',
                message:
                  panel.slot.status === 'DRAFT'
                    ? 'Instruktur terpilih akan ditetapkan pada kelas ini.'
                    : 'Instruktur kelas akan diganti. Peserta yang sudah memesan akan melihat instruktur yang baru.',
                confirmLabel: 'Tetapkan',
              });
              if (accepted)
                await run(
                  () => client.assign(panel.slot.id, instructorId),
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
                    client.update(panel.slot.id, input),
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
            onCancel={async (reason, note) => {
              const accepted = await feedback.confirm({
                tone: 'danger',
                title: 'Batalkan kelas?',
                message: 'Reservasi aktif akan dilepaskan dan tindakan dicatat dalam audit.',
                confirmLabel: 'Batalkan kelas',
              });
              if (accepted)
                await run(
                  () => client.cancel(panel.slot.id, reason, panel.slot.version, note || undefined),
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
                  message: `${control.attendanceCount} hadir dan ${control.noShowCount} tidak hadir akan dicatat. ${control.activeReservationCount} reservasi aktif akan dipakai satu kali.`,
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

      <LifecycleDialog
        request={
          slotToDelete
            ? {
                kind: 'class-slot',
                id: slotToDelete.id,
                name: `${classTypeName(slotToDelete.classTypeId, slotToDelete)} · ${formatBranchLongDate(slotToDelete.startAt, slotToDelete.timezone)} ${formatBranchTime(slotToDelete.startAt, slotToDelete.timezone)}`,
                action: 'delete',
              }
            : null
        }
        onClose={() => setSlotToDelete(null)}
        onDone={async (done) => {
          const removed = slotToDelete;
          setSlotToDelete(null);
          if (removed) setSlots((current) => current.filter((slot) => slot.id !== removed.id));
          closePanel();
          setFailure(undefined);
          setMessage(done);
        }}
      />
    </section>
  );
}
