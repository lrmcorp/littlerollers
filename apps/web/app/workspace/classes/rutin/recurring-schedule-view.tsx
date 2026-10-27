'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CalendarRange } from 'lucide-react';
import {
  browserClassSlotClient,
  type ClassSlotClient,
  type ClassWorkspace,
} from '../../../api-clients/class-slot-client';
import { AdminPageHeader } from '../../../components/admin/admin-page-header';
import { Panel } from '../../../components/admin/admin-ui';
import { Button } from '../../../components/actions';
import { useAppFeedback } from '../../../components/app-feedback';
import { DateInput, SelectInput } from '../../../components/forms';
import { Feedback, Skeleton } from '../../../ui';
import { formatBranchTime, localDateKey, zonedLocalDateTime } from '../../../lib/class-time';
import { useSessionContext } from '../../../session-context';
import { EmptyWeeksNotice } from '../../empty-weeks-notice';
import {
  DECISION_LABEL,
  planRecurring,
  runPool,
  summarizeCopy,
  validateRecurring,
  WEEKDAYS,
  type PlannedRecurring,
  type RecurringTemplate,
} from '../../schedule-weeks';

const CONCURRENCY = 3;
const DAY_MS = 86_400_000;
const DURATIONS = [45, 50, 55, 60, 75, 90];
/** Jam mulai 05.00 sampai 22.00 per 15 menit, ditulis 24 jam dengan titik. */
const START_TIMES = Array.from({ length: 69 }, (_, index) => {
  const minutes = 5 * 60 + index * 15;
  const hh = String(Math.floor(minutes / 60)).padStart(2, '0');
  const mm = String(minutes % 60).padStart(2, '0');
  return { value: `${hh}:${mm}`, label: `${hh}.${mm}` };
});

/** `2 Nov 2026` */
const formatDate = (value: Date, timeZone: string) =>
  new Intl.DateTimeFormat('id-ID', { timeZone, day: 'numeric', month: 'short', year: 'numeric' }).format(value);
const formatWeekday = (value: Date, timeZone: string) =>
  new Intl.DateTimeFormat('id-ID', { timeZone, weekday: 'short' }).format(value);

interface Preview {
  plan: PlannedRecurring[];
  partialCheck: boolean;
  template: RecurringTemplate;
}

/**
 * Jadwal rutin: pilih hari, jam, studio, tipe kelas, dan instruktur sekali, lalu semua kelasnya dibuat sampai
 * tiga bulan ke depan. Sebelum menyimpan ditampilkan berapa kelas yang akan dibuat dan mana yang sudah ada atau
 * bentrok. Hanya membuat kelas baru; kelas yang sudah ada (termasuk yang sudah dipesan) tidak pernah ditimpa.
 */
export function RecurringScheduleView({
  client = browserClassSlotClient,
  initialNow,
}: {
  client?: ClassSlotClient;
  initialNow?: Date;
}) {
  const feedback = useAppFeedback();
  const sessionContext = useSessionContext();
  const branch =
    sessionContext?.activeBranch ??
    (sessionContext?.session?.branches?.length === 1 ? sessionContext.session.branches[0] : null);
  const timezone = branch?.timezone ?? 'Asia/Jakarta';
  const canManage = Boolean(sessionContext?.hasCapability('class-slot:manage'));
  const now = useMemo(() => initialNow ?? new Date(), [initialNow]);

  const [options, setOptions] = useState<ClassWorkspace | null>(null);
  const [optionsError, setOptionsError] = useState('');
  const [days, setDays] = useState<number[]>([]);
  const [startTime, setStartTime] = useState('09:00');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [classTypeId, setClassTypeId] = useState('');
  const [studioId, setStudioId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [instructorUserId, setInstructorUserId] = useState('');
  const [from, setFrom] = useState(() => localDateKey(new Date(now.getTime() + DAY_MS), timezone));
  const [until, setUntil] = useState(() => localDateKey(new Date(now.getTime() + 84 * DAY_MS), timezone));

  const [preview, setPreview] = useState<Preview | null>(null);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [publish, setPublish] = useState(true);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [failures, setFailures] = useState<string[]>([]);
  const [finished, setFinished] = useState<{ created: number } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!branch?.id) return;
    let active = true;
    client
      .discover({
        branchId: branch.id,
        branches: [{ id: branch.id, timezone }],
        timezone,
        from: now,
        until: new Date(now.getTime() + DAY_MS),
      })
      .then((workspace) => {
        if (active) setOptions(workspace);
      })
      .catch(() => {
        if (active) setOptionsError('Pilihan studio, tipe kelas, dan instruktur belum dapat dimuat. Muat ulang halaman ini.');
      });
    return () => {
      active = false;
    };
  }, [branch?.id, client, now, timezone]);

  const studio = options?.studios.find((item) => item.id === studioId);
  const toggleDay = (value: number) =>
    setDays((current) => (current.includes(value) ? current.filter((day) => day !== value) : [...current, value]));
  const changed = () => {
    setPreview(null);
    setFinished(null);
    setFailures([]);
  };

  const template: RecurringTemplate = {
    days,
    startTime,
    durationMinutes,
    classTypeId,
    studioId,
    roomId: roomId || null,
    instructorUserId: instructorUserId || null,
    from,
    until,
  };

  const buildPreview = useCallback(async () => {
    if (!branch?.id) return;
    const problem = validateRecurring(template);
    setFormError(problem ?? '');
    setPreview(null);
    setFinished(null);
    setFailures([]);
    if (problem) return;
    setLoading(true);
    try {
      const rangeEnd = new Date(zonedLocalDateTime(template.until, '23:59', timezone).getTime() + 60_000);
      const existing = await client.discover({
        branchId: branch.id,
        branches: [{ id: branch.id, timezone }],
        timezone,
        from: zonedLocalDateTime(template.from, '00:00', timezone),
        until: rangeEnd,
      });
      setPreview({
        plan: planRecurring(template, existing.slots, now, timezone),
        partialCheck: Boolean(existing.nextCursor),
        template,
      });
    } catch {
      setFormError('Jadwal yang sudah ada belum dapat dimuat. Periksa koneksi lalu coba lagi.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branch?.id, client, now, timezone, days, startTime, durationMinutes, classTypeId, studioId, roomId, instructorUserId, from, until]);

  const execute = async () => {
    if (!preview || !branch?.id) return;
    const items = preview.plan.filter((item) => item.decision.kind === 'CREATE');
    const accepted = await feedback.confirm({
      tone: 'warning',
      title: `Buat ${items.length} kelas?`,
      message: `Kelas dibuat dari ${formatDate(zonedLocalDateTime(preview.template.from, '12:00', timezone), timezone)} sampai ${formatDate(zonedLocalDateTime(preview.template.until, '12:00', timezone), timezone)}. Kelas yang sudah ada tidak diubah.${publish && preview.template.instructorUserId ? ' Kelas langsung diterbitkan.' : ' Kelas dibuat sebagai draf.'}`,
      confirmLabel: `Buat ${items.length} kelas`,
    });
    if (!accepted) return;
    setProgress({ done: 0, total: items.length });
    setFailures([]);
    let created = 0;
    const problems: string[] = [];
    await runPool(items, CONCURRENCY, async (item) => {
      const label = `${formatDate(item.startAt, timezone)} ${formatBranchTime(item.startAt, timezone)}`;
      try {
        const slot = await client.create({
          branchId: branch.id,
          classTypeId: item.classTypeId,
          studioId: item.studioId,
          roomId: item.roomId ?? undefined,
          instructorUserId: item.instructorUserId ?? undefined,
          startAt: item.startAt,
          endAt: item.endAt,
        });
        created += 1;
        if (publish && item.instructorUserId) await client.publish(slot.id, slot.version);
      } catch {
        problems.push(label);
      } finally {
        setProgress((current) => (current ? { ...current, done: current.done + 1 } : current));
      }
    });
    setProgress(null);
    setFailures(problems);
    setFinished({ created });
    setPreview(null);
    setRefreshKey((value) => value + 1);
  };

  if (!branch)
    return <Feedback kind="info">Pilih cabang aktif di bagian atas supaya jadwal rutin cabang itu bisa dibuat.</Feedback>;
  if (!canManage)
    return <Feedback kind="error">Anda tidak memiliki izin mengelola kelas di cabang ini.</Feedback>;

  const summary = preview ? summarizeCopy(preview.plan as never) : null;
  const notCreated = preview ? preview.plan.filter((item) => item.decision.kind !== 'CREATE') : [];
  const className = (id: string) => options?.classTypes.find((type) => type.id === id)?.name ?? 'Kelas Pilates';

  return (
    <section className="space-y-6" aria-labelledby="recurring-title">
      <AdminPageHeader
        title="Jadwal rutin"
        titleId="recurring-title"
        description="Isi hari, jam, studio, tipe kelas, dan instruktur sekali. Semua kelasnya dibuat sampai tiga bulan ke depan."
        actions={
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/workspace/classes/salin" className="text-sm font-semibold text-dd-forest">
              Salin minggu
            </Link>
            <Link href="/workspace/classes" className="inline-flex items-center gap-1.5 text-sm font-semibold text-dd-forest">
              <ArrowLeft className="size-4" aria-hidden="true" /> Kembali ke timetable
            </Link>
          </div>
        }
      />

      <EmptyWeeksNotice branchId={branch.id} timezone={timezone} initialNow={initialNow} refreshKey={refreshKey} />

      <Panel className="space-y-5 p-5">
        {optionsError && <Feedback kind="error">{optionsError}</Feedback>}
        {!options && !optionsError && <Skeleton label="Memuat pilihan jadwal" />}
        {options && (
          <>
            <fieldset className="grid gap-2">
              <legend className="text-sm font-semibold text-dd-ink">Hari</legend>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    aria-pressed={days.includes(day.value)}
                    aria-label={day.long}
                    onClick={() => {
                      toggleDay(day.value);
                      changed();
                    }}
                    className={`min-h-[44px] min-w-[56px] rounded-dd-sm border px-3 text-sm font-bold transition ${
                      days.includes(day.value)
                        ? 'border-dd-forest bg-dd-forest text-white'
                        : 'border-dd-border-interactive bg-white text-dd-ink hover:bg-dd-surface-muted'
                    }`}
                  >
                    {day.short}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" onChange={changed}>
              <SelectInput label="Jam mulai" value={startTime} onChange={(event) => setStartTime(event.target.value)}>
                {START_TIMES.map((time) => (
                  <option key={time.value} value={time.value}>
                    {time.label}
                  </option>
                ))}
              </SelectInput>
              <SelectInput
                label="Durasi"
                value={String(durationMinutes)}
                onChange={(event) => setDurationMinutes(Number(event.target.value))}
              >
                {DURATIONS.map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {minutes} menit
                  </option>
                ))}
              </SelectInput>
              <SelectInput label="Tipe kelas" value={classTypeId} onChange={(event) => setClassTypeId(event.target.value)}>
                <option value="">Pilih tipe kelas</option>
                {options.classTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </SelectInput>
              <SelectInput
                label="Studio"
                value={studioId}
                onChange={(event) => {
                  setStudioId(event.target.value);
                  setRoomId('');
                }}
              >
                <option value="">Pilih studio</option>
                {options.studios.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </SelectInput>
              <SelectInput
                label="Ruangan"
                value={roomId}
                disabled={!studio || studio.rooms.length === 0}
                onChange={(event) => setRoomId(event.target.value)}
              >
                <option value="">Tanpa ruangan tertentu</option>
                {studio?.rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </SelectInput>
              <SelectInput
                label="Instruktur"
                value={instructorUserId}
                onChange={(event) => setInstructorUserId(event.target.value)}
              >
                <option value="">Belum ditentukan</option>
                {options.instructors.map((instructor) => (
                  <option key={instructor.id} value={instructor.id}>
                    {instructor.displayName}
                  </option>
                ))}
              </SelectInput>
              <DateInput label="Tanggal mulai" value={from} onChange={(event) => setFrom(event.target.value)} />
              <DateInput label="Tanggal akhir" value={until} onChange={(event) => setUntil(event.target.value)} />
            </div>

            {formError && <Feedback kind="error">{formError}</Feedback>}
            <div>
              <Button
                leadingIcon={<CalendarRange className="size-4" aria-hidden="true" />}
                disabled={loading || progress !== null}
                onClick={() => void buildPreview()}
              >
                Lihat rencana
              </Button>
            </div>
            {loading && <Skeleton label="Menyusun rencana jadwal" />}
          </>
        )}
      </Panel>

      {preview && summary && (
        <Panel className="space-y-4 p-5" role="region" aria-label="Rencana jadwal rutin">
          <h2 className="text-lg font-bold">Rencana jadwal rutin</h2>
          <p className="text-base" role="status">
            <strong>{summary.create} kelas akan dibuat</strong>
            {summary.exists > 0 && `, ${summary.exists} sudah ada`}
            {summary.conflicts > 0 && `, ${summary.conflicts} bentrok`}
            {summary.past > 0 && `, ${summary.past} sudah lewat`}.
          </p>
          {preview.partialCheck && (
            <Feedback kind="info">
              Jadwal cabang di rentang ini sangat padat, jadi tidak semua kelas yang sudah ada ikut diperiksa. Bentrok yang
              terlewat tetap ditolak saat kelas dibuat dan akan disebutkan setelahnya.
            </Feedback>
          )}
          {notCreated.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm font-semibold text-dd-ink">Yang tidak akan dibuat</p>
              <ul className="m-0 list-none space-y-1 p-0 text-sm">
                {notCreated.slice(0, 30).map((item) => (
                  <li key={item.startAt.toISOString()} className="text-dd-muted">
                    {formatWeekday(item.startAt, timezone)} {formatDate(item.startAt, timezone)} {formatBranchTime(item.startAt, timezone)} ·{' '}
                    {className(item.classTypeId)}:{' '}
                    <strong className={item.decision.kind === 'EXISTS' || item.decision.kind === 'PAST' ? 'text-dd-muted' : 'text-dd-danger'}>
                      {DECISION_LABEL[item.decision.kind]}
                    </strong>
                  </li>
                ))}
              </ul>
              {notCreated.length > 30 && <p className="text-sm text-dd-muted">dan {notCreated.length - 30} lainnya.</p>}
            </div>
          )}
          {summary.create > 0 && (
            <>
              {preview.template.instructorUserId && (
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" checked={publish} onChange={(event) => setPublish(event.target.checked)} />
                  Terbitkan kelas setelah dibuat
                </label>
              )}
              <div className="flex flex-wrap gap-2">
                <Button disabled={progress !== null} onClick={() => void execute()}>
                  Buat {summary.create} kelas
                </Button>
                <Button variant="ghost" disabled={progress !== null} onClick={() => setPreview(null)}>
                  Batal
                </Button>
              </div>
            </>
          )}
        </Panel>
      )}

      {progress && (
        <p role="status" className="text-sm font-semibold">
          Membuat kelas… {progress.done} dari {progress.total}
        </p>
      )}
      {finished && (
        <Panel className="space-y-2 p-5" role="status">
          <p className="font-semibold">{finished.created} kelas dibuat.</p>
          {failures.length > 0 && (
            <Feedback kind="error">
              {failures.length} kelas tidak dapat dibuat (kemungkinan bentrok jadwal yang baru muncul): {failures.join(', ')}.
            </Feedback>
          )}
        </Panel>
      )}
    </section>
  );
}
