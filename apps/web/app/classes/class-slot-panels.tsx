'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  browserBookingClient,
  bookingFailure,
  type BookingClient,
  type CheckInIssue,
  type CustomerBookingRecord,
} from '../booking-client';
import type { ClassSlot, ClassTypeOption, InstructorOption } from '../class-slot-client';
import { formatBranchTime, zonedLocalDateTime } from '../class-time';
import { Feedback, StatusBadge } from '../ui';
import { Button, ButtonLink } from '../components/actions';
import { SearchInput, SearchSelect, SelectInput, DateInput, TextInput } from '../components/forms';
import { useAppFeedback } from '../components/app-feedback';
import { DataTable, Pagination } from '../components/admin/admin-ui';
import {
  cancellationLabels,
  classStatusTone,
  statusLabels,
  type CancellationReason,
} from './class-slot-presenters';

export function CreatePanel({
  branchId,
  timezone,
  classTypes,
  instructors,
  busy,
  formId = 'class-slot-create-form',
  onDirty,
  onCreate,
}: {
  branchId: string;
  timezone: string;
  classTypes: ClassTypeOption[];
  instructors: InstructorOption[];
  busy: boolean;
  formId?: string;
  onDirty?(): void;
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
      id={formId}
      className="grid gap-4"
      aria-label="Form buat kelas"
      aria-busy={busy || undefined}
      onChange={onDirty}
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
      <SearchSelect
        label="Tipe kelas"
        name="classTypeId"
        required
        placeholder="Pilih tipe kelas"
        options={classTypes.map((item) => ({
          id: item.id,
          label: item.name,
          description: item.code,
        }))}
      />
      <SearchSelect
        label="Instruktur"
        name="instructorUserId"
        placeholder="Tetapkan nanti"
        options={instructors.map((item) => ({ id: item.id, label: item.displayName }))}
      />
      <DateInput label="Tanggal" name="date" required />
      <TextInput label="Mulai" name="startTime" type="time" required />
      <TextInput label="Selesai eksklusif" name="endTime" type="time" required />
      <Feedback kind="info">
        Timezone: {timezone}. {summary}
      </Feedback>
    </form>
  );
}

export function DetailPanel({
  slot,
  classTypeName,
  instructorName,
  classTypes,
  instructors,
  canManage,
  canManageAttendance,
  canReadBookings,
  bookingClient = browserBookingClient,
  busy,
  onAssign,
  onUpdate,
  onPublish,
  onCancel,
}: {
  slot: ClassSlot;
  classTypeName: string;
  instructorName: string;
  classTypes: ClassTypeOption[];
  instructors: InstructorOption[];
  canManage: boolean;
  canManageAttendance: boolean;
  canReadBookings: boolean;
  bookingClient?: Pick<BookingClient, 'list'> & Partial<Pick<BookingClient, 'issueBulkCheckIns'>>;
  busy: boolean;
  onAssign(id: string): Promise<void>;
  onUpdate(input: {
    classTypeId: string;
    instructorUserId?: string | null;
    startAt: Date;
    endAt: Date;
    reason: string;
  }): Promise<void>;
  onPublish(): Promise<void>;
  onCancel(reason: CancellationReason): Promise<void>;
}) {
  const feedback = useAppFeedback();
  const [instructorId, setInstructorId] = useState(slot.instructorUserId ?? '');
  const [reason, setReason] = useState<CancellationReason>('OTHER_REVIEW_REQUIRED');
  const [editOpen, setEditOpen] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [issues, setIssues] = useState<CheckInIssue[]>([]);
  const [issueFailure, setIssueFailure] = useState('');
  const [roster, setRoster] = useState<CustomerBookingRecord[]>([]);
  const [rosterSummary, setRosterSummary] =
    useState<Awaited<ReturnType<BookingClient['list']>>['summary']>();
  const [rosterQuery, setRosterQuery] = useState('');
  const [rosterStatus, setRosterStatus] = useState('');
  const [rosterCursor, setRosterCursor] = useState<string>();
  const [rosterCursorHistory, setRosterCursorHistory] = useState<string[]>([]);
  const [rosterNextCursor, setRosterNextCursor] = useState<string | null>();
  const [rosterLoading, setRosterLoading] = useState(false);
  const [rosterFailure, setRosterFailure] = useState('');
  const loadRoster = useCallback(async () => {
    if (!canReadBookings) return;
    setRosterLoading(true);
    setRosterFailure('');
    try {
      const page = await bookingClient.list({
        classSlotId: slot.id,
        q: rosterQuery || undefined,
        status: rosterStatus || undefined,
        cursor: rosterCursor,
        limit: 10,
      });
      setRoster(page.items);
      setRosterSummary(page.summary);
      setRosterNextCursor(page.nextCursor);
    } catch (error) {
      setRosterFailure(await bookingFailure(error));
      setRoster([]);
    } finally {
      setRosterLoading(false);
    }
  }, [bookingClient, canReadBookings, rosterCursor, rosterQuery, rosterStatus, slot.id]);
  useEffect(() => {
    const timer = window.setTimeout(() => void loadRoster(), rosterQuery ? 250 : 0);
    return () => window.clearTimeout(timer);
  }, [loadRoster, rosterQuery]);
  useEffect(() => {
    setRosterCursor(undefined);
    setRosterCursorHistory([]);
  }, [rosterQuery, rosterStatus, slot.id]);
  const bookingStatusLabels: Record<string, string> = {
    BOOKED: 'Aktif',
    RESCHEDULE_PENDING: 'Menunggu reschedule',
    ATTENDED: 'Hadir',
    CANCELLED: 'Dibatalkan',
    NO_SHOW: 'Tidak hadir',
  };
  return (
    <div className="class-detail">
      <StatusBadge tone={classStatusTone(slot.status)}>{statusLabels[slot.status]}</StatusBadge>
      <dl>
        <div>
          <dt>Tipe kelas</dt>
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
          <dt>Instruktur</dt>
          <dd>{instructorName}</dd>
        </div>
        <div>
          <dt>Kapasitas</dt>
          <dd>
            {slot.bookedCount}/{slot.capacity}; minimum {slot.minimumQuota}
          </dd>
        </div>
        <div>
          <dt>Versi data</dt>
          <dd>{slot.version}</dd>
        </div>
      </dl>
      <section className="grid gap-4" aria-labelledby="class-roster-title">
        <div>
          <h3 id="class-roster-title">Daftar peserta</h3>
          <p className="text-sm text-dd-muted">
            Customer dan status booking ditampilkan sesuai scope akses Anda.
          </p>
        </div>
        {!canReadBookings ? (
          <Feedback kind="info">
            Anda dapat melihat jumlah peserta, tetapi detail customer memerlukan akses booking.
          </Feedback>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                ['Aktif', (rosterSummary?.booked ?? 0) + (rosterSummary?.reschedulePending ?? 0)],
                ['Hadir', rosterSummary?.attended ?? 0],
                ['Dibatalkan', rosterSummary?.cancelled ?? 0],
                ['Tersedia', Math.max(0, slot.capacity - slot.bookedCount)],
              ].map(([label, value]) => (
                <div
                  className="rounded-dd-md border border-dd-line bg-dd-surface-muted p-3"
                  key={label}
                >
                  <span className="block text-xs text-dd-muted">{label}</span>
                  <strong className="mt-1 block text-lg">{value}</strong>
                </div>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <SearchInput
                label="Cari peserta"
                value={rosterQuery}
                placeholder="Nama atau telepon"
                onChange={(event) => setRosterQuery(event.target.value)}
              />
              <SelectInput
                label="Status booking"
                value={rosterStatus}
                onChange={(event) => setRosterStatus(event.target.value)}
              >
                <option value="">Semua status</option>
                {Object.entries(bookingStatusLabels).map(([value, label]) => (
                  <option value={value} key={value}>
                    {label}
                  </option>
                ))}
              </SelectInput>
            </div>
            {rosterFailure && (
              <Feedback kind="error">
                {rosterFailure}{' '}
                <Button size="sm" variant="secondary" onClick={() => void loadRoster()}>
                  Coba lagi
                </Button>
              </Feedback>
            )}
            <DataTable
              items={roster}
              loading={rosterLoading}
              rowKey={(item) => item.id}
              emptyTitle="Belum ada peserta"
              emptyDescription="Belum ada booking yang sesuai dengan filter roster."
              columns={[
                {
                  id: 'customer',
                  header: 'Customer',
                  cell: (item) => (
                    <div>
                      <strong className="block">{item.customer?.displayName ?? 'Customer'}</strong>
                      <span className="text-xs text-dd-muted">
                        {item.customer?.phoneMasked ?? 'Kontak termasking'}
                      </span>
                    </div>
                  ),
                },
                {
                  id: 'package',
                  header: 'Paket & sesi',
                  cell: (item) => (
                    <div>
                      <span className="block">{item.package?.name ?? 'Paket customer'}</span>
                      <span className="text-xs text-dd-muted">
                        {item.sessionBalance?.available ?? 0} sesi tersedia
                      </span>
                    </div>
                  ),
                },
                {
                  id: 'status',
                  header: 'Status',
                  cell: (item) => (
                    <StatusBadge
                      tone={
                        item.status === 'CANCELLED' || item.status === 'NO_SHOW'
                          ? 'danger'
                          : item.status === 'ATTENDED'
                            ? 'success'
                            : 'info'
                      }
                    >
                      {bookingStatusLabels[item.status] ?? 'Status booking'}
                    </StatusBadge>
                  ),
                },
                {
                  id: 'action',
                  header: 'Tindakan',
                  cell: (item) => (
                    <ButtonLink
                      size="sm"
                      variant="secondary"
                      href={`/workspace/bookings/${encodeURIComponent(item.id)}?returnTo=${encodeURIComponent('/workspace/classes')}`}
                    >
                      Lihat booking
                    </ButtonLink>
                  ),
                },
              ]}
              mobileCard={(item) => (
                <div className="grid gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <strong className="block">{item.customer?.displayName ?? 'Customer'}</strong>
                      <span className="text-xs text-dd-muted">
                        {item.customer?.phoneMasked ?? 'Kontak termasking'}
                      </span>
                    </div>
                    <StatusBadge
                      tone={
                        item.status === 'CANCELLED' || item.status === 'NO_SHOW'
                          ? 'danger'
                          : item.status === 'ATTENDED'
                            ? 'success'
                            : 'info'
                      }
                    >
                      {bookingStatusLabels[item.status] ?? 'Status booking'}
                    </StatusBadge>
                  </div>
                  <p className="m-0 text-sm">
                    {item.package?.name ?? 'Paket customer'} · {item.sessionBalance?.available ?? 0}{' '}
                    sesi tersedia
                  </p>
                  <ButtonLink
                    size="sm"
                    variant="secondary"
                    href={`/workspace/bookings/${encodeURIComponent(item.id)}?returnTo=${encodeURIComponent('/workspace/classes')}`}
                  >
                    Lihat booking
                  </ButtonLink>
                </div>
              )}
            />
            <Pagination
              hasPrevious={rosterCursorHistory.length > 0}
              hasNext={Boolean(rosterNextCursor)}
              totalLabel={`${rosterSummary?.total ?? roster.length} booking ditemukan`}
              onPrevious={() => {
                const previous = [...rosterCursorHistory];
                const next = previous.pop();
                setRosterCursorHistory(previous);
                setRosterCursor(next);
              }}
              onNext={() => {
                if (!rosterNextCursor) return;
                setRosterCursorHistory((current) => [...current, rosterCursor ?? '']);
                setRosterCursor(rosterNextCursor);
              }}
            />
          </>
        )}
      </section>
      {slot.status === 'CONFIRMED' && (
        <section>
          <h3>QR check-in roster</h3>
          <p className="text-sm text-dd-muted">
            Terbitkan pass untuk seluruh booking aktif. Setiap customer dikirim melalui tombol
            WhatsApp masing-masing; browser tidak membuka popup massal.
          </p>
          <Button
            disabled={busy || issuing || !canManageAttendance}
            onClick={() => {
              const issueBulk = bookingClient.issueBulkCheckIns;
              if (!issueBulk) return;
              void feedback
                .confirm({
                  tone: 'warning',
                  title: 'Buat QR untuk roster?',
                  message:
                    'Pass diterbitkan per booking aktif. Kegagalan satu customer tidak membatalkan hasil lainnya.',
                  confirmLabel: 'Terbitkan QR',
                })
                .then((accepted) => {
                  if (!accepted) return;
                  setIssuing(true);
                  setIssueFailure('');
                  void issueBulk(slot.id, undefined, crypto.randomUUID())
                    .then((response) => {
                      setIssues(
                        response.items.flatMap((item) =>
                          item.ok && item.result ? [item.result] : [],
                        ),
                      );
                      const failures = response.items.filter((item) => !item.ok);
                      if (failures.length)
                        setIssueFailure(
                          `${failures.length} booking tidak dapat diterbitkan. Booking lain tetap berhasil.`,
                        );
                    })
                    .catch(async (error) => setIssueFailure(await bookingFailure(error)))
                    .finally(() => setIssuing(false));
                });
            }}
          >
            {issuing ? 'Menerbitkan…' : 'Buat QR untuk roster'}
          </Button>
          {issueFailure && <Feedback kind="warning">{issueFailure}</Feedback>}
          {issues.length > 0 && (
            <ul className="mt-4 grid list-none gap-2 p-0" aria-label="QR roster siap dikirim">
              {issues.map((issue) => (
                <li
                  key={issue.bookingId}
                  className="rounded-dd-md border border-dd-line bg-dd-surface-muted p-3"
                >
                  <strong className="block text-sm">
                    {issue.maskedCustomerPhone ?? 'Tanpa WhatsApp'}
                  </strong>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {issue.whatsappUrl && (
                      <ButtonLink
                        href={issue.whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        size="sm"
                      >
                        Buka WhatsApp
                      </ButtonLink>
                    )}
                    {issue.passUrl && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => void navigator.clipboard.writeText(issue.passUrl!)}
                      >
                        Salin link
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
      {slot.status === 'DRAFT' && (
        <section>
          <h3>Edit draft kelas</h3>
          <p className="text-sm text-dd-muted">
            Waktu, tipe kelas, dan instruktur dapat diubah selama kelas masih Draft. Kapasitas
            dihitung ulang dari konfigurasi backend.
          </p>
          <Button
            variant="secondary"
            disabled={busy || !canManage}
            onClick={() => setEditOpen((current) => !current)}
          >
            {editOpen ? 'Tutup edit' : 'Edit kelas'}
          </Button>
          {editOpen && (
            <DraftEditForm
              slot={slot}
              classTypes={classTypes}
              instructors={instructors}
              busy={busy}
              onSubmit={async (input) => {
                await onUpdate(input);
                setEditOpen(false);
              }}
            />
          )}
        </section>
      )}
      {slot.status === 'DRAFT' && (
        <section>
          <h3>Tetapkan instructor</h3>
          <SearchSelect
            label="Instruktur"
            value={instructorId}
            placeholder="Pilih instruktur"
            options={instructors.map((item) => ({ id: item.id, label: item.displayName }))}
            onChange={setInstructorId}
          />
          <Button
            disabled={busy || !canManage || !instructorId}
            onClick={() => void onAssign(instructorId)}
          >
            Tetapkan instructor
          </Button>
        </section>
      )}
      {slot.status === 'DRAFT' && (
        <section>
          <h3>Publish kelas</h3>
          <Button
            disabled={busy || !canManage || !slot.instructorUserId}
            onClick={() => void onPublish()}
          >
            Publish kelas
          </Button>
        </section>
      )}
      {['DRAFT', 'PUBLISHED'].includes(slot.status) && (
        <section>
          <h3>Batalkan kelas</h3>
          <SelectInput
            label="Alasan"
            aria-label="Alasan pembatalan"
            value={reason}
            onChange={(event) => setReason(event.target.value as CancellationReason)}
          >
            {Object.entries(cancellationLabels).map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </SelectInput>
          <Feedback kind="warning">
            Cancellation melepaskan reservation aktif. Konfirmasi hanya jika konsekuensi sudah
            ditinjau.
          </Feedback>
          <Button
            variant="danger"
            disabled={busy || !canManage}
            onClick={() => void onCancel(reason)}
          >
            Konfirmasi pembatalan
          </Button>
        </section>
      )}
    </div>
  );
}

function DraftEditForm({
  slot,
  classTypes,
  instructors,
  busy,
  onSubmit,
}: {
  slot: ClassSlot;
  classTypes: ClassTypeOption[];
  instructors: InstructorOption[];
  busy: boolean;
  onSubmit(input: {
    classTypeId: string;
    instructorUserId?: string | null;
    startAt: Date;
    endAt: Date;
    reason: string;
  }): Promise<void>;
}) {
  const parts = (value: Date) => {
    const formatted = new Intl.DateTimeFormat('en-CA', {
      timeZone: slot.timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(value);
    const get = (type: Intl.DateTimeFormatPartTypes) =>
      formatted.find((part) => part.type === type)?.value ?? '';
    return {
      date: `${get('year')}-${get('month')}-${get('day')}`,
      time: `${get('hour')}:${get('minute')}`,
    };
  };
  const start = parts(slot.startAt);
  const end = parts(slot.endAt);
  const [failure, setFailure] = useState('');
  return (
    <form
      className="mt-4 grid gap-3 rounded-dd-md border border-dd-line bg-dd-surface-muted p-4"
      aria-label="Edit draft kelas"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        try {
          const startAt = zonedLocalDateTime(
            String(data.get('date')),
            String(data.get('startTime')),
            slot.timezone,
          );
          let endAt = zonedLocalDateTime(
            String(data.get('date')),
            String(data.get('endTime')),
            slot.timezone,
          );
          if (
            endAt <= startAt &&
            localDatePart(slot.endAt, slot.timezone) !== localDatePart(slot.startAt, slot.timezone)
          ) {
            endAt = new Date(endAt.getTime() + 24 * 60 * 60 * 1000);
          }
          if (endAt <= startAt) throw new Error('INVALID_RANGE');
          setFailure('');
          void onSubmit({
            classTypeId: String(data.get('classTypeId')),
            instructorUserId: String(data.get('instructorUserId')) || null,
            startAt,
            endAt,
            reason: String(data.get('reason')),
          });
        } catch {
          setFailure('Waktu selesai harus setelah waktu mulai.');
        }
      }}
    >
      <SearchSelect
        label="Tipe kelas"
        name="classTypeId"
        defaultValue={slot.classTypeId}
        required
        options={classTypes.map((item) => ({
          id: item.id,
          label: item.name,
          description: item.code,
        }))}
      />
      <SearchSelect
        label="Instruktur"
        name="instructorUserId"
        defaultValue={slot.instructorUserId ?? ''}
        placeholder="Tetapkan nanti"
        options={instructors.map((item) => ({ id: item.id, label: item.displayName }))}
      />
      <DateInput label="Tanggal" name="date" defaultValue={start.date} required />
      <TextInput label="Mulai" name="startTime" type="time" defaultValue={start.time} required />
      <TextInput label="Selesai" name="endTime" type="time" defaultValue={end.time} required />
      <TextInput
        label="Alasan perubahan"
        name="reason"
        minLength={3}
        maxLength={500}
        required
        placeholder="Contoh: penyesuaian jadwal studio"
      />
      {failure && <Feedback kind="error">{failure}</Feedback>}
      <Button type="submit" loading={busy}>
        Simpan perubahan kelas
      </Button>
    </form>
  );
}

function localDatePart(value: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(value);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}
