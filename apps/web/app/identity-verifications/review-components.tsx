'use client';

import { AlertTriangle, Eye, ShieldCheck, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type {
  DocumentKind,
  DocumentReviewStatus,
  DocumentScanStatus,
  VerificationDocument,
} from '../identity-verification-client';
import { Button } from '../components/actions';
import { AlertBanner, Modal } from '../components/app-feedback';
import { Badge, Panel } from '../components/admin/admin-ui';
import { SelectInput, Textarea } from '../components/forms';

export const statusLabels: Record<DocumentReviewStatus, string> = {
  PENDING: 'Menunggu pemeriksaan',
  APPROVED: 'Disetujui',
  REJECTED: 'Perlu diperbaiki',
  PENDING_DELETION: 'Sedang dihapus',
  DELETE_FAILED: 'Penghapusan gagal',
  DELETED: 'Telah dihapus',
};

export const scanLabels: Record<DocumentScanStatus, string> = {
  PENDING: 'Menunggu pemindaian',
  CLEAN: 'Aman diperiksa',
  REJECTED: 'File ditolak',
  INFECTED: 'File tidak aman',
  ERROR: 'Pemindaian bermasalah',
};

const reasonLabels = {
  BLURRY: 'Foto buram',
  GLARE: 'Pantulan cahaya berlebihan',
  CROPPED: 'Dokumen terpotong',
  DOCUMENT_UNREADABLE: 'Dokumen tidak dapat dibaca',
  FACE_MISMATCH: 'Wajah tidak sesuai',
  WRONG_DOCUMENT: 'Dokumen yang diunggah salah',
  OTHER_REQUIRES_NOTE: 'Alasan lain',
} as const;
export type RejectionReason = keyof typeof reasonLabels;

export function kindLabel(kind: DocumentKind) {
  return kind === 'SELFIE' ? 'Selfie' : 'KTP depan';
}

function badgeTone(status: DocumentReviewStatus) {
  if (status === 'APPROVED') return 'success' as const;
  if (status === 'REJECTED' || status === 'PENDING_DELETION') return 'warning' as const;
  if (status === 'DELETE_FAILED') return 'danger' as const;
  return 'neutral' as const;
}

export function ageLabel(value: string | null) {
  if (!value) return 'Waktu tidak tersedia';
  const hours = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 3_600_000));
  if (hours < 24) return `${hours} jam`;
  return `${Math.floor(hours / 24)} hari`;
}

export function SummaryButton({
  label,
  value,
  active,
  tone = 'neutral',
  onClick,
}: {
  label: string;
  value: number;
  active: boolean;
  tone?: 'neutral' | 'danger';
  onClick(): void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-dd-lg border p-5 text-left shadow-sm transition ${active ? 'border-dd-forest bg-dd-forest text-white' : tone === 'danger' ? 'border-red-200 bg-red-50 text-red-900' : 'border-dd-line bg-white text-dd-ink hover:border-dd-forest/50'}`}
    >
      <span className="block text-xs font-bold uppercase tracking-[0.12em] opacity-70">
        {label}
      </span>
      <strong className="mt-3 block text-2xl">{value.toLocaleString('id-ID')}</strong>
    </button>
  );
}

export function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[][];
  onChange(value: string): void;
}) {
  return (
    <SelectInput
      label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      wrapperClassName="min-w-40"
    >
      <option value="">Semua</option>
      {options.map(([optionValue, optionLabel]) => (
        <option key={optionValue} value={optionValue}>
          {optionLabel}
        </option>
      ))}
    </SelectInput>
  );
}

export function DocumentBadge({ document }: { document?: VerificationDocument }) {
  if (!document) return <Badge tone="neutral">Belum tersedia</Badge>;
  return (
    <div className="flex flex-wrap gap-1">
      <Badge tone={badgeTone(document.status)}>
        {kindLabel(document.kind)} · {statusLabels[document.status]}
      </Badge>
      {document.scanStatus !== 'CLEAN' && (
        <Badge tone="warning">{scanLabels[document.scanStatus]}</Badge>
      )}
    </div>
  );
}

export function DocumentReviewCard({
  document,
  previewUrl,
  previewError,
  previewLoading,
  onPreview,
  onApprove,
  onReject,
  canDelete,
  mayDecide,
  onDelete,
}: {
  document?: VerificationDocument;
  previewUrl?: string;
  previewError?: { title: string; message: string };
  previewLoading: boolean;
  onPreview(document: VerificationDocument): void;
  onApprove(document: VerificationDocument): void;
  onReject(document: VerificationDocument): void;
  canDelete: boolean;
  mayDecide: boolean;
  onDelete(document: VerificationDocument): void;
}) {
  if (!document)
    return (
      <Panel className="grid min-h-72 place-items-center border-dashed p-6 text-center">
        <div>
          <ShieldCheck className="mx-auto size-8 text-dd-muted" />
          <strong className="mt-3 block">Dokumen belum tersedia</strong>
          <p className="mt-2 text-sm text-dd-muted">
            Customer belum memiliki dokumen aktif untuk jenis ini.
          </p>
        </div>
      </Panel>
    );
  const canDecide =
    document.status === 'PENDING' &&
    document.scanStatus === 'CLEAN' &&
    document.uploadStatus === 'FINALIZED';
  return (
    <Panel className="space-y-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{kindLabel(document.kind)}</h3>
          <p className="mt-1 text-xs text-dd-muted">
            {(document.sizeBytes / 1024).toFixed(0)} KB · versi {document.version}
          </p>
        </div>
        <Badge tone={badgeTone(document.status)}>{statusLabels[document.status]}</Badge>
      </div>
      <div className="grid min-h-52 place-items-center overflow-hidden rounded-dd-md border border-dd-line bg-dd-surface-muted">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={`Preview privat ${kindLabel(document.kind)}`}
            className="max-h-80 w-full object-contain"
          />
        ) : (
          <div className="p-5 text-center">
            <Eye className="mx-auto size-8 text-dd-muted" />
            <p className="mt-2 text-sm text-dd-muted">Preview privat belum dimuat.</p>
          </div>
        )}
      </div>
      {previewError && (
        <AlertBanner tone="danger" title={previewError.title} message={previewError.message} />
      )}
      {!['DELETED', 'PENDING_DELETION'].includes(document.status) && (
        <Button
          variant="secondary"
          leadingIcon={<Eye className="size-4" aria-hidden="true" />}
          disabled={previewLoading}
          onClick={() => void onPreview(document)}
        >
          {previewLoading
            ? 'Memuat…'
            : previewError
              ? 'Coba lagi preview'
              : previewUrl
                ? 'Terbitkan ulang preview'
                : 'Lihat dokumen'}
        </Button>
      )}
      <div className="rounded-dd-md border border-dd-line p-3 text-xs text-dd-muted">
        <strong className="text-dd-ink">Lifecycle</strong>
        <p className="mt-1">
          Upload: {document.uploadStatus} · Scan: {scanLabels[document.scanStatus]} · Status:{' '}
          {statusLabels[document.status]}
        </p>
        {document.rejectionReasonCode && (
          <p className="mt-1">
            Alasan:{' '}
            {reasonLabels[document.rejectionReasonCode as RejectionReason] ?? 'Perlu perbaikan'}
          </p>
        )}
      </div>
      {document.status === 'DELETE_FAILED' && (
        <AlertBanner
          tone="warning"
          title="Penghapusan gagal"
          message="File belum dapat dihapus. Tindakan dapat dicoba ulang oleh Super Admin."
        />
      )}
      {document.status === 'PENDING' && !canDecide && (
        <AlertBanner
          tone="warning"
          title="Belum dapat diputuskan"
          message="File harus selesai diunggah dan berstatus aman sebelum reviewer mengambil keputusan."
        />
      )}
      {canDecide && mayDecide && (
        <div className="grid gap-2 sm:grid-cols-2">
          <Button onClick={() => onApprove(document)}>Setujui dokumen</Button>
          <Button variant="secondary" onClick={() => onReject(document)}>
            Minta perbaikan
          </Button>
        </div>
      )}
      {canDelete && document.status !== 'DELETED' && (
        <details className="border-t border-dd-line pt-4">
          <summary className="cursor-pointer text-sm font-bold text-dd-danger">
            Tindakan lanjutan
          </summary>
          <Button
            className="mt-3"
            variant="danger"
            leadingIcon={<Trash2 className="size-4" aria-hidden="true" />}
            onClick={() => onDelete(document)}
          >
            Hapus file permanen
          </Button>
        </details>
      )}
    </Panel>
  );
}

export function DecisionDialog({
  decision,
  submitting,
  onClose,
  onSubmit,
}: {
  decision?: { document: VerificationDocument; kind: 'approve' | 'reject' };
  submitting: boolean;
  onClose(): void;
  onSubmit(
    document: VerificationDocument,
    kind: 'approve' | 'reject',
    reasonCode?: RejectionReason,
    note?: string,
  ): Promise<void>;
}) {
  const [reason, setReason] = useState<RejectionReason>('BLURRY');
  useEffect(() => {
    if (decision) setReason('BLURRY');
  }, [decision]);
  if (!decision) return null;
  return (
    <Modal
      open
      title={decision.kind === 'approve' ? 'Setujui dokumen' : 'Minta perbaikan dokumen'}
      description={`${kindLabel(decision.document.kind)} · versi ${decision.document.version}`}
      onClose={onClose}
      busy={submitting}
      footer={
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" disabled={submitting} onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" form="verification-decision-form" loading={submitting}>
            {decision.kind === 'approve' ? 'Lanjutkan persetujuan' : 'Lanjutkan perbaikan'}
          </Button>
        </div>
      }
    >
      <form
        id="verification-decision-form"
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          void onSubmit(
            decision.document,
            decision.kind,
            decision.kind === 'reject' ? reason : undefined,
            String(data.get('note') ?? ''),
          );
        }}
      >
        {decision.kind === 'reject' && (
          <>
            <SelectInput
              label="Alasan"
              value={reason}
              onChange={(event) => setReason(event.target.value as RejectionReason)}
            >
              {Object.entries(reasonLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </SelectInput>
            <Textarea
              label="Catatan"
              name="note"
              maxLength={500}
              required={reason === 'OTHER_REQUIRES_NOTE'}
              placeholder={
                reason === 'OTHER_REQUIRES_NOTE' ? 'Jelaskan alasan perbaikan' : 'Opsional'
              }
            />
          </>
        )}
        <div className="rounded-dd-md border border-amber-200 bg-dd-warning-soft p-4 text-sm text-dd-warning">
          <AlertTriangle className="mr-2 inline size-4" />
          Keputusan dicatat dalam audit dan memberitahu customer.
        </div>
      </form>
    </Modal>
  );
}
