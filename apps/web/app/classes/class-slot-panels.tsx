'use client';

import { useState } from 'react';
import { browserBookingClient, bookingFailure, type CheckInIssue } from '../booking-client';
import type { ClassSlot, ClassTypeOption, InstructorOption } from '../class-slot-client';
import { formatBranchTime, zonedLocalDateTime } from '../class-time';
import { Feedback, StatusBadge } from '../ui';
import { controlClassName } from '../components/forms';
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
        <select className={controlClassName} name="classTypeId" required defaultValue="">
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
        <select className={controlClassName} name="instructorUserId" defaultValue="">
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
        <input className={controlClassName} name="date" type="date" required />
      </label>
      <label>
        Mulai
        <input className={controlClassName} name="startTime" type="time" required />
      </label>
      <label>
        Selesai eksklusif
        <input className={controlClassName} name="endTime" type="time" required />
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

export function DetailPanel({
  slot,
  classTypeName,
  instructorName,
  instructors,
  canManage,
  canManageAttendance,
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
  canManageAttendance: boolean;
  busy: boolean;
  onAssign(id: string): Promise<void>;
  onPublish(): Promise<void>;
  onCancel(reason: CancellationReason): Promise<void>;
}) {
  const [instructorId, setInstructorId] = useState(slot.instructorUserId ?? '');
  const [reason, setReason] = useState<CancellationReason>('OTHER_REVIEW_REQUIRED');
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
          <button
            disabled={busy || issuing || !canManageAttendance}
            onClick={() => {
              const issueBulk = browserBookingClient.issueBulkCheckIns;
              if (!issueBulk) return;
              setIssuing(true);
              setIssueFailure('');
              void issueBulk(slot.id, undefined, crypto.randomUUID())
                .then((response) => {
                  setIssues(
                    response.items.flatMap((item) => (item.ok && item.result ? [item.result] : [])),
                  );
                  const failures = response.items.filter((item) => !item.ok);
                  if (failures.length)
                    setIssueFailure(
                      `${failures.length} booking tidak dapat diterbitkan. Booking lain tetap berhasil.`,
                    );
                })
                .catch(async (error) => setIssueFailure(await bookingFailure(error)))
                .finally(() => setIssuing(false));
            }}
          >
            {issuing ? 'Menerbitkan…' : 'Buat QR untuk roster'}
          </button>
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
                      <a
                        className="button-primary"
                        href={issue.whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Buka WhatsApp
                      </a>
                    )}
                    {issue.passUrl && (
                      <button
                        type="button"
                        className="button-quiet"
                        onClick={() => void navigator.clipboard.writeText(issue.passUrl!)}
                      >
                        Salin link
                      </button>
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
          <h3>Tetapkan instructor</h3>
          <label>
            Instructor
            <select
              className={controlClassName}
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
          <button
            disabled={busy || !canManage || !slot.instructorUserId}
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
              className={controlClassName}
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
          <button disabled={busy || !canManage} onClick={() => void onCancel(reason)}>
            Konfirmasi pembatalan
          </button>
        </section>
      )}
    </div>
  );
}
