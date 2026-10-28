'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ListChecks,
  QrCode,
  Search,
  UserPlus,
} from 'lucide-react';
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
  formatAttendanceTime,
  liveSlots,
  nextClassLabel,
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
 * Halaman "Hari Ini" petugas meja depan:
 * - Jam digital real-time di header
 * - Dua kartu utama di atas (Berjalan sekarang & Berikutnya / Mulai X menit lagi)
 * - Daftar hadir in-place dengan jam kehadiran dan modal alasan cepat
 * - Sisa kelas hari ini dengan deteksi kelebihan kapasitas (overcapacity)
 * - Tiga aksi besar (min-h-14)
 * - Masalah yang perlu dibereskan di cabang ini (hangat/krem, tanpa kartu statistik pasif)
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
  const [qrModalSlot, setQrModalSlot] = useState<ClassSlot | null>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

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

  const overcapacitySlots = useMemo(
    () => slots.filter((slot) => slot.bookedCount > slot.capacity),
    [slots],
  );

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

  useEffect(() => {
    if (!qrModalSlot || !qrCanvasRef.current) return;
    const payload = `dd-checkin:v1:slot:${qrModalSlot.id}:branch:${branch?.id ?? ''}`;
    void QRCode.toCanvas(qrCanvasRef.current, payload, {
      width: 220,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#17392d', light: '#ffffff' },
    }).catch(() => {
      // Gracefully continue if canvas context is unavailable (e.g. test environment)
    });
  }, [qrModalSlot, branch?.id]);

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

  const aside = (
    <aside className="space-y-5">
      <section aria-label="Aksi cepat" className="grid gap-3">
        <ButtonLink
          href="/workspace/bookings"
          className="min-h-14 justify-start text-base font-semibold"
          leadingIcon={<UserPlus className="size-5" aria-hidden="true" />}
        >
          Buat booking manual
        </ButtonLink>
        <ButtonLink
          href="/workspace/bookings?tab=reschedules"
          variant="secondary"
          className="min-h-14 justify-start text-base font-semibold"
          leadingIcon={<CalendarClock className="size-5" aria-hidden="true" />}
        >
          Pindahkan jadwal booking
        </ButtonLink>
        <ButtonLink
          href="/customers"
          variant="secondary"
          className="min-h-14 justify-start text-base font-semibold"
          leadingIcon={<Search className="size-5" aria-hidden="true" />}
        >
          Cari pelanggan
        </ButtonLink>
      </section>

      <section
        aria-labelledby="todo-heading"
        className="space-y-3 rounded-dd-xl border border-dd-border-interactive bg-[#fffdf7] p-5 shadow-sm"
      >
        <h2 id="todo-heading" className="flex items-center gap-2 text-lg font-bold text-dd-ink">
          <ListChecks className="size-5 text-dd-forest" aria-hidden="true" /> Perlu dibereskan di cabang ini
        </h2>
        {queues === null ? (
          <Skeleton label="Memuat daftar" />
        ) : queues.length === 0 && overcapacitySlots.length === 0 ? (
          <p className="text-sm text-dd-muted">Tidak ada yang perlu dibereskan di cabang ini.</p>
        ) : (
          <ul className="m-0 grid list-none gap-2 p-0">
            {overcapacitySlots.length > 0 && overcapacitySlots[0] && (
              <li>
                <button
                  type="button"
                  onClick={() => setSelectedSlotId(overcapacitySlots[0]!.id)}
                  className="flex w-full items-center justify-between gap-3 rounded-dd-md border border-red-300 bg-red-50 px-3 py-3 text-left font-semibold text-red-800 transition hover:bg-red-100"
                >
                  <span className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="size-4 shrink-0 text-red-600" aria-hidden="true" />
                    <span>{overcapacitySlots.length} kelas kelebihan kapasitas</span>
                  </span>
                  <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-xs text-white">
                    {overcapacitySlots.length}
                  </span>
                </button>
              </li>
            )}
            {queues.map((queue) => (
              <li key={queue.key}>
                <Link
                  href={queue.href}
                  className="flex items-center justify-between gap-3 rounded-dd-md border border-dd-border-interactive bg-white px-3 py-3 font-semibold text-dd-ink no-underline transition hover:bg-dd-surface-muted"
                >
                  <span className="text-sm">{queue.label}</span>
                  <span className="rounded-full bg-dd-forest px-2.5 py-0.5 text-sm text-white">
                    {queue.count}
                  </span>
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
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Hari ini</h1>
          <p className="text-sm font-medium text-dd-muted">
            {formattedToday} · {branch.name}
          </p>
        </div>
        <div
          className="flex items-baseline gap-2 self-start rounded-dd-lg border border-dd-border-interactive bg-white px-4 py-2 shadow-sm sm:self-auto"
          aria-label="Jam digital"
        >
          <span className="text-3xl font-extrabold tracking-tight text-dd-forest tabular-nums sm:text-4xl">
            {formatAttendanceTime(now, timezone)}
          </span>
          <span className="text-[13px] font-bold text-dd-muted">
            {timezone === 'Asia/Makassar' ? 'WITA' : timezone === 'Asia/Jayapura' ? 'WIT' : 'WIB'}
          </span>
        </div>
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
              {/* Dua kartu utama di atas */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Kartu 1: Berjalan sekarang */}
                <section
                  aria-label="Berjalan sekarang"
                  className={`flex flex-col justify-between space-y-3 rounded-dd-xl border p-5 shadow-dd-card ${
                    selected?.id === running?.id ? 'border-2 border-dd-forest bg-white' : 'border-dd-border-interactive bg-white'
                  }`}
                >
                  <div className="space-y-1">
                    <p className="text-[13px] font-bold text-dd-muted">Berjalan sekarang</p>
                    {running ? (
                      <>
                        <button
                          type="button"
                          className="text-left"
                          onClick={() => setSelectedSlotId(running.id)}
                          aria-label={`Lihat peserta ${className(running)} ${time(running)}`}
                        >
                          <span className="block text-2xl font-bold text-dd-ink">{time(running)}</span>
                          <span className="block text-lg font-semibold text-dd-ink">{className(running)}</span>
                        </button>
                        <p className="text-sm text-dd-muted">
                          {instructorName(running)} · {studioName(running)}
                        </p>
                        <p className="text-sm font-semibold text-dd-ink">
                          Terisi {running.bookedCount} dari {running.capacity}
                          {running.bookedCount >= running.capacity ? ' (Penuh)' : ''}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-dd-muted">Tidak ada kelas yang sedang berjalan.</p>
                    )}
                  </div>
                  {running && (
                    <div className="flex flex-wrap items-center gap-2 border-t border-dd-line pt-3">
                      <Button
                        size="sm"
                        variant={selected?.id === running.id ? 'primary' : 'secondary'}
                        onClick={() => setSelectedSlotId(running.id)}
                      >
                        Buka daftar hadir
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        leadingIcon={<QrCode className="size-4" aria-hidden="true" />}
                        onClick={() => setQrModalSlot(running)}
                      >
                        Tampilkan QR check-in
                      </Button>
                    </div>
                  )}
                </section>

                {/* Kartu 2: Mulai X menit lagi / Berikutnya */}
                <section
                  aria-label="Berikutnya"
                  className={`flex flex-col justify-between space-y-3 rounded-dd-xl border p-5 shadow-dd-card ${
                    selected?.id === next?.id ? 'border-2 border-dd-forest bg-white' : 'border-dd-border-interactive bg-white'
                  }`}
                >
                  <div className="space-y-1">
                    <p className="text-[13px] font-bold text-dd-muted">
                      {nextClassLabel(next, now)}
                    </p>
                    {next ? (
                      <>
                        <button
                          type="button"
                          className="text-left"
                          onClick={() => setSelectedSlotId(next.id)}
                          aria-label={`Lihat peserta ${className(next)} ${time(next)}`}
                        >
                          <span className="block text-2xl font-bold text-dd-ink">{time(next)}</span>
                          <span className="block text-lg font-semibold text-dd-ink">{className(next)}</span>
                        </button>
                        <p className="text-sm text-dd-muted">
                          {instructorName(next)} · {studioName(next)}
                        </p>
                        <p className="text-sm font-semibold text-dd-ink">
                          Terisi {next.bookedCount} dari {next.capacity}
                          {next.bookedCount >= next.capacity ? ' (Penuh)' : ''}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-dd-muted">Tidak ada kelas lagi hari ini.</p>
                    )}
                  </div>
                  {next && (
                    <div className="flex flex-wrap items-center gap-2 border-t border-dd-line pt-3">
                      <Button
                        size="sm"
                        variant={selected?.id === next.id ? 'primary' : 'secondary'}
                        onClick={() => setSelectedSlotId(next.id)}
                      >
                        Buka daftar hadir
                      </Button>
                    </div>
                  )}
                </section>
              </div>

              {/* Daftar hadir in-place tepat di bawah kartu atas */}
              <section
                aria-labelledby="attendance-heading"
                className="space-y-3 rounded-dd-xl border border-dd-border-interactive bg-white p-5 shadow-dd-card"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-dd-line pb-3">
                  <h2 id="attendance-heading" className="text-lg font-bold text-dd-ink">
                    {selected ? `Daftar hadir kelas ${time(selected)} · ${className(selected)}` : 'Daftar hadir'}
                  </h2>
                  {selected && (
                    <span className="text-xs font-semibold text-dd-muted">
                      {selected.bookedCount} peserta terdaftar
                    </span>
                  )}
                </div>
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
                            <p className="font-semibold text-dd-ink">
                              {booking.customer?.displayName ?? 'Pelanggan'}
                            </p>
                            <p className="text-sm text-dd-muted">
                              {booking.package?.name ?? 'Paket'}
                              {booking.sessionBalance ? ` · sisa ${booking.sessionBalance.available} sesi` : ''}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {present ? (
                              <div className="flex items-center gap-2">
                                <StatusBadge tone="success">Hadir</StatusBadge>
                                {booking.attendance?.checkedInAt && (
                                  <span className="text-xs font-semibold text-dd-muted tabular-nums">
                                    {formatAttendanceTime(booking.attendance.checkedInAt, timezone)}
                                  </span>
                                )}
                              </div>
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
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              {/* Sisa kelas hari ini / Semua kelas hari ini di bawah daftar hadir */}
              <section
                aria-labelledby="all-classes-heading"
                className="space-y-3 rounded-dd-xl border border-dd-border-interactive bg-white p-5 shadow-dd-card"
              >
                <div className="flex items-center justify-between">
                  <h2 id="all-classes-heading" className="text-lg font-bold text-dd-ink">
                    Semua kelas hari ini
                  </h2>
                  <span className="text-xs font-semibold text-dd-muted">{slots.length} kelas</span>
                </div>
                <ul className="m-0 grid list-none gap-2 p-0">
                  {slots.map((slot) => {
                    const isOvercapacity = slot.bookedCount > slot.capacity;
                    return (
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
                          <div className="flex flex-wrap items-center gap-2">
                            <span>
                              {time(slot)} · {className(slot)}
                            </span>
                            {isOvercapacity && (
                              <span className="inline-flex items-center gap-1 rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                                <AlertTriangle className="size-3.5" aria-hidden="true" />
                                Kelebihan kapasitas ({slot.bookedCount}/{slot.capacity})
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-medium text-dd-muted underline decoration-dd-border-interactive">
                              Lihat detail
                            </span>
                            <span className="text-dd-muted">{slotPhase(slot, now)}</span>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </div>
          )}

          {aside}
        </div>
      )}

      {/* Modal QR Check-In Meja Depan */}
      <Modal
        open={qrModalSlot !== null}
        title="QR Check-in Meja Depan"
        description={qrModalSlot ? `${className(qrModalSlot)} · ${time(qrModalSlot)}` : undefined}
        onClose={() => setQrModalSlot(null)}
        footer={
          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setQrModalSlot(null)}>
              Tutup
            </Button>
          </div>
        }
      >
        <div className="flex flex-col items-center justify-center space-y-4 py-2 text-center">
          <p className="text-sm text-dd-muted">
            Arahkan pelanggan untuk memindai kode QR ini dari ponsel mereka untuk konfirmasi kehadiran otomatis.
          </p>
          <div className="flex items-center justify-center rounded-2xl border-2 border-dd-border-interactive bg-white p-4 shadow-sm">
            <canvas ref={qrCanvasRef} className="size-[220px]" />
          </div>
          <p className="text-xs font-medium text-dd-muted">
            Cabang: {branch.name} · Studio: {qrModalSlot ? studioName(qrModalSlot) : ''}
          </p>
        </div>
      </Modal>

      {/* Modal Catat Kehadiran Manual */}
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
