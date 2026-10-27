'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarClock, CheckCircle2, ListChecks, Search, UserPlus } from 'lucide-react';
import {
  browserClassSlotClient,
  type ClassSlot,
  type ClassSlotClient,
  type ClassWorkspace,
} from '../api-clients/class-slot-client';
import {
  browserBookingClient,
  type BookingClient,
  type CustomerBookingRecord,
} from '../api-clients/booking-client';
import {
  browserDashboardClient,
  type DashboardClient,
  type DashboardQueueSummary,
} from '../api-clients/dashboard-client';
import { useSessionContext } from '../session-context';
import { EmptyWeeksNotice } from './empty-weeks-notice';
import { Button, ButtonLink } from '../components/actions';
import { Modal, useAppFeedback } from '../components/app-feedback';
import { Textarea } from '../components/forms';
import { Feedback, Skeleton, StatusBadge } from '../ui';
import { formatBranchTime, localDateKey, zonedLocalDateTime } from '../lib/class-time';
import {
  ATTENDANCE_REASON_PRESETS,
  attendanceWindow,
  liveSlots,
  pickLastEnded,
  pickRunningAndNext,
  slotPhase,
} from './front-desk-today';

export interface FrontDeskTodayViewProps {
  client?: ClassSlotClient;
  bookingClient?: BookingClient;
  dashboardClient?: DashboardClient;
  /**
   * Antrean cabang yang sudah dimuat induknya (null = masih memuat). Bila diisi, halaman ini tidak memanggil
   * ringkasan dashboard sendiri.
   */
  queues?: DashboardQueueSummary[] | null;
  /** Hanya untuk tes: jam acuan. */
  initialNow?: Date;
}

/**
 * Halaman "Hari Ini" petugas meja depan: kelas berjalan dan berikutnya, daftar hadir yang bisa langsung
 * ditandai, tiga aksi besar, dan hal yang perlu dibereskan di cabang ini. Tanpa kartu statistik.
 */
export function FrontDeskTodayView({
  client = browserClassSlotClient,
  bookingClient = browserBookingClient,
  dashboardClient = browserDashboardClient,
  queues: queuesFromParent,
  initialNow,
}: FrontDeskTodayViewProps) {
  const feedback = useAppFeedback();
  const sessionContext = useSessionContext();
  const session = sessionContext?.session;
  const branch = sessionContext?.activeBranch ?? (session?.branches?.length === 1 ? session.branches[0] : null);
  const timezone = branch?.timezone ?? 'Asia/Jakarta';
  const canMark = Boolean(sessionContext?.hasCapability('attendance:manage'));

  const [now, setNow] = useState(() => initialNow ?? new Date());
  const [workspace, setWorkspace] = useState<ClassWorkspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [attendees, setAttendees] = useState<CustomerBookingRecord[]>([]);
  const [attendeesLoading, setAttendeesLoading] = useState(false);
  const [attendeesError, setAttendeesError] = useState<string | null>(null);
  const [fetchedQueues, setFetchedQueues] = useState<DashboardQueueSummary[] | null>(null);
  const queues = queuesFromParent !== undefined ? queuesFromParent : fetchedQueues;
  const [markTarget, setMarkTarget] = useState<CustomerBookingRecord | null>(null);
  const [reason, setReason] = useState('');
  const [marking, setMarking] = useState(false);
  const [markError, setMarkError] = useState('');

  useEffect(() => {
    if (initialNow) return;
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, [initialNow]);

  const todayKey = localDateKey(now, timezone);

  const loadClasses = useCallback(async () => {
    if (!branch?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setWorkspace(
        await client.discover({
          branchId: branch.id,
          branches: [{ id: branch.id, timezone }],
          timezone,
          from: zonedLocalDateTime(todayKey, '00:00', timezone),
          until: zonedLocalDateTime(todayKey, '23:59', timezone),
        }),
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Jadwal hari ini belum dapat dimuat.');
      setWorkspace(null);
    } finally {
      setLoading(false);
    }
  }, [branch?.id, client, timezone, todayKey]);

  useEffect(() => {
    void loadClasses();
  }, [loadClasses]);

  useEffect(() => {
    if (!branch?.id || queuesFromParent !== undefined) return;
    let cancelled = false;
    dashboardClient
      .overview({ branchId: branch.id })
      .then((overview) => {
        if (!cancelled) setFetchedQueues(overview.queues.filter((queue) => queue.count > 0));
      })
      .catch(() => {
        if (!cancelled) setFetchedQueues([]);
      });
    return () => {
      cancelled = true;
    };
  }, [branch?.id, dashboardClient, queuesFromParent]);

  const slots = useMemo(() => liveSlots(workspace?.slots ?? []), [workspace?.slots]);
  const { running, next } = useMemo(() => pickRunningAndNext(slots, now), [slots, now]);
  const selected =
    slots.find((slot) => slot.id === selectedSlotId) ?? running ?? next ?? pickLastEnded(slots, now);

  const loadAttendees = useCallback(async () => {
    if (!selected) {
      setAttendees([]);
      return;
    }
    setAttendeesLoading(true);
    setAttendeesError(null);
    try {
      setAttendees((await bookingClient.list({ classSlotId: selected.id, limit: 50 })).items);
    } catch (cause) {
      setAttendees([]);
      setAttendeesError(cause instanceof Error ? cause.message : 'Daftar peserta belum dapat dimuat.');
    } finally {
      setAttendeesLoading(false);
    }
  }, [bookingClient, selected]);

  useEffect(() => {
    void loadAttendees();
  }, [loadAttendees]);

  const className = (slot: ClassSlot) =>
    workspace?.classTypes.find((type) => type.id === slot.classTypeId)?.name ?? 'Kelas Pilates';
  const studioName = (slot: ClassSlot) =>
    workspace?.studios.find((studio) => studio.id === slot.studioId)?.name ?? branch?.name ?? 'Studio';
  const instructorName = (slot: ClassSlot) =>
    (slot as { instructor?: { displayName?: string | null } | null }).instructor?.displayName ??
    workspace?.instructors.find((instructor) => instructor.id === slot.instructorUserId)?.displayName ??
    'Belum ada instruktur';
  const time = (slot: ClassSlot) => `${formatBranchTime(slot.startAt, timezone)} – ${formatBranchTime(slot.endAt, timezone)}`;

  const window = selected ? attendanceWindow(selected, now) : { open: false };

  const confirmMark = async () => {
    if (!markTarget || !bookingClient.backfillAttendance) return;
    setMarking(true);
    setMarkError('');
    try {
      await bookingClient.backfillAttendance(markTarget.id, reason.trim(), markTarget.version, crypto.randomUUID());
      feedback.showToast({
        tone: 'success',
        title: 'Kehadiran dicatat',
        message: `${markTarget.customer?.displayName ?? 'Pelanggan'} ditandai hadir.`,
      });
      setMarkTarget(null);
      setReason('');
      await loadAttendees();
    } catch {
      setMarkError('Kehadiran belum bisa dicatat. Periksa batas waktu 2 jam setelah kelas selesai, lalu coba lagi.');
    } finally {
      setMarking(false);
    }
  };

  const formattedToday = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: timezone,
  }).format(now);

  if (!branch)
    return (
      <Feedback kind="info">
        Pilih cabang aktif di bagian atas supaya jadwal dan daftar hadir cabang itu tampil.
      </Feedback>
    );

  const classCard = (label: string, slot: ClassSlot | null, emptyText: string) => (
    <section
      aria-label={label}
      className={`space-y-1 rounded-dd-xl border bg-white p-5 shadow-dd-card ${
        selected?.id === slot?.id ? 'border-2 border-dd-forest' : 'border-dd-border-interactive'
      }`}
    >
      <p className="text-xs font-bold uppercase tracking-wider text-dd-muted">{label}</p>
      {slot ? (
        <>
          <button type="button" className="text-left" onClick={() => setSelectedSlotId(slot.id)} aria-label={`Lihat peserta ${className(slot)} ${time(slot)}`}>
            <span className="block text-2xl font-bold text-dd-ink">{time(slot)}</span>
            <span className="block text-lg font-semibold text-dd-ink">{className(slot)}</span>
          </button>
          <p className="text-sm text-dd-muted">
            {instructorName(slot)} · {studioName(slot)}
          </p>
          <p className="text-sm font-semibold text-dd-ink">
            Terisi {slot.bookedCount} dari {slot.capacity}
          </p>
        </>
      ) : (
        <p className="text-sm text-dd-muted">{emptyText}</p>
      )}
    </section>
  );

  const aside = (
      <aside className="space-y-5">
        <section aria-label="Aksi cepat" className="grid gap-3">
          <ButtonLink href="/workspace/bookings" className="min-h-14 justify-start text-base" leadingIcon={<UserPlus className="size-5" aria-hidden="true" />}>
            Buat booking manual
          </ButtonLink>
          <ButtonLink href="/workspace/bookings?tab=reschedules" variant="secondary" className="min-h-14 justify-start text-base" leadingIcon={<CalendarClock className="size-5" aria-hidden="true" />}>
            Pindahkan jadwal booking
          </ButtonLink>
          <ButtonLink href="/customers" variant="secondary" className="min-h-14 justify-start text-base" leadingIcon={<Search className="size-5" aria-hidden="true" />}>
            Cari pelanggan
          </ButtonLink>
        </section>

        <section aria-labelledby="todo-heading" className="space-y-3 rounded-dd-xl border border-dd-border-interactive bg-white p-5">
          <h2 id="todo-heading" className="flex items-center gap-2 text-lg font-bold">
            <ListChecks className="size-5" aria-hidden="true" /> Perlu dibereskan di cabang ini
          </h2>
          {queues === null ? (
            <Skeleton label="Memuat daftar" />
          ) : queues.length === 0 ? (
            <p className="text-sm text-dd-muted">Tidak ada yang perlu dibereskan di cabang ini.</p>
          ) : (
            <ul className="m-0 grid list-none gap-2 p-0">
              {queues.map((queue) => (
                <li key={queue.key}>
                  <Link href={queue.href} className="flex items-center justify-between gap-3 rounded-dd-md border border-dd-border-interactive px-3 py-3 font-semibold text-dd-ink no-underline">
                    <span>{queue.label}</span>
                    <span className="rounded-full bg-dd-forest px-2.5 py-0.5 text-sm text-white">{queue.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </aside>
  );

  return (
    <div className="space-y-6 font-sans text-dd-ink" aria-label="Hari ini di meja depan">
      <header className="space-y-1">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Hari ini</h1>
        <p className="text-sm font-medium text-dd-muted">
          {formattedToday} · {branch.name}
        </p>
      </header>

      <EmptyWeeksNotice
        branchId={branch.id}
        timezone={timezone}
        client={client}
        initialNow={initialNow}
        canFill={Boolean(sessionContext?.hasCapability('class-slot:manage'))}
      />

      {error && (
        <Feedback kind="error">
          {error}{' '}
          <button type="button" onClick={() => void loadClasses()} className="ml-1 font-semibold underline">
            Coba lagi
          </button>
        </Feedback>
      )}

      {loading ? (
        <Skeleton label="Memuat jadwal hari ini" />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          {slots.length === 0 && !error ? (
            <section className="space-y-3 self-start rounded-dd-xl border border-dd-border-interactive bg-white p-6">
              <p className="text-base font-medium">Tidak ada kelas hari ini di {branch.name}.</p>
              <ButtonLink href="/workspace/classes" variant="secondary">
                Buka jadwal kelas
              </ButtonLink>
            </section>
          ) : (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {classCard('Berjalan sekarang', running, 'Tidak ada kelas yang sedang berjalan.')}
              {classCard('Berikutnya', next, 'Tidak ada kelas lagi hari ini.')}
            </div>

            <section aria-labelledby="all-classes-heading" className="space-y-3 rounded-dd-xl border border-dd-border-interactive bg-white p-5">
              <h2 id="all-classes-heading" className="text-lg font-bold">
                Semua kelas hari ini
              </h2>
              <ul className="m-0 grid list-none gap-2 p-0">
                {slots.map((slot) => (
                  <li key={slot.id}>
                    <button
                      type="button"
                      aria-pressed={selected?.id === slot.id}
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`flex min-h-[44px] w-full flex-wrap items-center justify-between gap-2 rounded-dd-md border px-3 py-2 text-left text-sm font-semibold transition ${
                        selected?.id === slot.id
                          ? 'border-2 border-dd-forest bg-white text-dd-ink'
                          : 'border-dd-border-interactive bg-white text-dd-ink hover:bg-dd-surface-muted'
                      }`}
                    >
                      <span>
                        {time(slot)} · {className(slot)}
                      </span>
                      <span className="text-dd-muted">{slotPhase(slot, now)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="attendance-heading" className="space-y-3 rounded-dd-xl border border-dd-border-interactive bg-white p-5">
              <h2 id="attendance-heading" className="text-lg font-bold">
                {selected ? `Daftar hadir ${className(selected)} ${time(selected)}` : 'Daftar hadir'}
              </h2>
              {selected && !window.open && 'reason' in window && window.reason && (
                <p className="text-sm text-dd-muted" role="note">
                  {window.reason}
                </p>
              )}
              {attendeesError && <Feedback kind="error">{attendeesError}</Feedback>}
              {attendeesLoading ? (
                <Skeleton label="Memuat daftar peserta" />
              ) : attendees.length === 0 ? (
                <p className="text-sm text-dd-muted">Belum ada peserta terdaftar di kelas ini.</p>
              ) : (
                <ul className="m-0 list-none divide-y divide-dd-line p-0">
                  {attendees.map((booking) => {
                    const present = Boolean(booking.attendance) || booking.status === 'ATTENDED';
                    const cancelled = booking.status === 'CANCELLED';
                    return (
                      <li key={booking.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                        <div>
                          <p className="font-semibold">{booking.customer?.displayName ?? 'Pelanggan'}</p>
                          <p className="text-sm text-dd-muted">
                            {booking.package?.name ?? 'Paket'}
                            {booking.sessionBalance ? ` · sisa ${booking.sessionBalance.available} sesi` : ''}
                          </p>
                        </div>
                        {present ? (
                          <StatusBadge tone="success">Hadir</StatusBadge>
                        ) : cancelled ? (
                          <StatusBadge tone="neutral">Dibatalkan</StatusBadge>
                        ) : canMark && window.open && booking.status === 'BOOKED' ? (
                          <Button
                            size="sm"
                            leadingIcon={<CheckCircle2 className="size-4" aria-hidden="true" />}
                            onClick={() => {
                              setMarkError('');
                              setReason('');
                              setMarkTarget(booking);
                            }}
                          >
                            Tandai hadir
                          </Button>
                        ) : (
                          <StatusBadge tone="warning">Belum hadir</StatusBadge>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>
          )}

          {aside}
        </div>
      )}

      <Modal
        open={markTarget !== null}
        title="Tandai hadir"
        description={markTarget ? `${markTarget.customer?.displayName ?? 'Pelanggan'} · alasan dicatat di audit` : undefined}
        busy={marking}
        onClose={() => setMarkTarget(null)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" disabled={marking} onClick={() => setMarkTarget(null)}>
              Batal
            </Button>
            <Button loading={marking} disabled={reason.trim().length < 3} onClick={() => void confirmMark()}>
              Catat kehadiran
            </Button>
          </div>
        }
      >
        <div className="grid gap-3">
          <p className="text-sm text-dd-muted">Pilih alasan, atau tulis sendiri di bawah.</p>
          <div className="flex flex-wrap gap-2">
            {ATTENDANCE_REASON_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                aria-pressed={reason === preset}
                onClick={() => setReason(preset)}
                className={`rounded-dd-md border px-3 py-2 text-left text-sm ${
                  reason === preset ? 'border-dd-forest bg-dd-forest/10 font-semibold' : 'border-dd-border-interactive bg-white'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
          <Textarea label="Alasan" value={reason} maxLength={500} onChange={(event) => setReason(event.target.value)} />
          {markError && <Feedback kind="error">{markError}</Feedback>}
        </div>
      </Modal>
    </div>
  );
}
