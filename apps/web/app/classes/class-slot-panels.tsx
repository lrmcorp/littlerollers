'use client';

import { useState } from 'react';
import { browserBookingClient, bookingFailure, type CheckInIssue } from '../booking-client';
import type { ClassSlot, ClassTypeOption, InstructorOption } from '../class-slot-client';
import { formatBranchTime, zonedLocalDateTime } from '../class-time';
import { Feedback, StatusBadge } from '../ui';
import { Button, ButtonLink } from '../components/actions';
import { SearchSelect, SelectInput, DateInput, TextInput } from '../components/forms';
import { useAppFeedback } from '../components/app-feedback';
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
  return (
    <div className="class-detail">
      <StatusBadge tone={classStatusTone(slot.status)}>{statusLabels[slot.status]}</StatusBadge>
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
              const issueBulk = browserBookingClient.issueBulkCheckIns;
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
          const endAt = zonedLocalDateTime(
            String(data.get('date')),
            String(data.get('endTime')),
            slot.timezone,
          );
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
