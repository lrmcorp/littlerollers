'use client';

import { useEffect, useState } from 'react';
import { verificationClient, type VerificationDocument } from '../identity-verification-client';
import { Feedback, PageHeader, StatusBadge } from '../ui';
import { useSessionContext } from '../session-context';
import { Badge, Button, FilterBar, Panel, StatCard } from '../components/admin/admin-ui';

const reasons = [
  'BLURRY',
  'GLARE',
  'CROPPED',
  'DOCUMENT_UNREADABLE',
  'FACE_MISMATCH',
  'WRONG_DOCUMENT',
  'OTHER_REQUIRES_NOTE',
];

const statusLabels: Record<string, string> = {
  PENDING: 'Menunggu pemeriksaan',
  APPROVED: 'Disetujui',
  REJECTED: 'Perlu diperbaiki',
  PENDING_DELETION: 'Sedang dihapus',
  DELETE_FAILED: 'Penghapusan gagal',
  DELETED: 'Telah dihapus',
};

export function IdentityReviewView() {
  const [items, setItems] = useState<VerificationDocument[]>([]);
  const [status, setStatus] = useState('PENDING');
  const [message, setMessage] = useState('');
  const [previewAuthorization, setPreviewAuthorization] = useState<{
    documentId: string;
    url: string;
    expiresAt: string;
  }>();
  const session = useSessionContext();
  const load = () =>
    verificationClient
      .reviewQueue(status)
      .then((value) => setItems(value.items))
      .catch(() => setMessage('Antrean verifikasi tidak dapat dimuat.'));
  useEffect(() => void load(), [status]);
  return (
    <>
      <Panel className="mb-6 p-6 sm:p-8">
        <PageHeader
          eyebrow="Administrasi"
          title="Verifikasi customer"
          description="Periksa selfie dan KTP secara terpisah. Semua keputusan membutuhkan permission dan dicatat dalam audit."
          context={<StatusBadge tone="neutral">{items.length} dokumen</StatusBadge>}
        />
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <StatCard
            label="Dalam antrean"
            value={String(items.filter((item) => item.status === 'PENDING').length)}
            tone="warning"
          />
          <StatCard
            label="Disetujui"
            value={String(items.filter((item) => item.status === 'APPROVED').length)}
            tone="success"
          />
          <StatCard
            label="Ditolak"
            value={String(items.filter((item) => item.status === 'REJECTED').length)}
          />
        </div>
      </Panel>
      <FilterBar>
        <label className="filter-field">
          Status
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            {[
              'PENDING',
              'APPROVED',
              'REJECTED',
              'PENDING_DELETION',
              'DELETE_FAILED',
              'DELETED',
            ].map((value) => (
              <option key={value} value={value}>
                {statusLabels[value]}
              </option>
            ))}
          </select>
        </label>
      </FilterBar>
      {message && <Feedback kind="error">{message}</Feedback>}
      <section className="verification-review-list" aria-label="Antrean verifikasi">
        {items.map((document) => (
          <Panel className="p-5" key={document.id}>
            <h2>{document.kind === 'SELFIE' ? 'Selfie' : 'KTP depan'}</h2>
            <p>
              <strong>{document.user?.displayName}</strong>
              <br />
              {document.user?.phoneE164}
            </p>
            <p>Gambar privat · {(document.sizeBytes / 1024).toFixed(0)} KB</p>
            <Badge
              tone={
                document.status === 'APPROVED'
                  ? 'success'
                  : document.status === 'REJECTED'
                    ? 'warning'
                    : 'neutral'
              }
            >
              {statusLabels[document.status] ?? 'Status tidak tersedia'}
            </Badge>
            {!['DELETED', 'PENDING_DELETION', 'DELETE_FAILED'].includes(document.status) && (
              <Button
                variant="secondary"
                onClick={async () => {
                  try {
                    const authorization = await verificationClient.authorizeView(document.id);
                    setPreviewAuthorization({ documentId: document.id, ...authorization });
                  } catch {
                    setMessage('Preview privat tidak dapat diotorisasi.');
                  }
                }}
              >
                Otorisasi preview privat
              </Button>
            )}
            {previewAuthorization?.documentId === document.id && (
              <a
                href={previewAuthorization.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-dd-md bg-dd-forest px-4 text-sm font-bold text-white no-underline"
              >
                Buka preview sekali pakai
              </a>
            )}
            {document.status === 'PENDING' && (
              <form
                onSubmit={async (event) => {
                  event.preventDefault();
                  const data = new FormData(event.currentTarget);
                  const decision = String(data.get('decision')) as 'approve' | 'reject';
                  try {
                    await verificationClient.decide(document.id, decision, {
                      expectedVersion: document.version,
                      reasonCode: decision === 'reject' ? String(data.get('reason')) : undefined,
                      note: String(data.get('note') ?? ''),
                    });
                    await load();
                  } catch {
                    setMessage(
                      'Keputusan gagal. Pastikan permission sesuai dan data belum berubah.',
                    );
                  }
                }}
              >
                <label>
                  Keputusan
                  <select name="decision" required>
                    <option value="approve">Setujui</option>
                    <option value="reject">Tolak</option>
                  </select>
                </label>
                <label>
                  Alasan penolakan
                  <select name="reason">
                    <option value="">Tidak ada</option>
                    {reasons.map((reason) => (
                      <option key={reason}>{reason}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Catatan
                  <textarea name="note" maxLength={500} />
                </label>
                <Button>Simpan keputusan</Button>
              </form>
            )}
            {session?.hasCapability('identity-verification:delete') &&
              document.status !== 'DELETED' && (
                <form
                  onSubmit={async (event) => {
                    event.preventDefault();
                    const reason = String(new FormData(event.currentTarget).get('reason'));
                    try {
                      await verificationClient.delete(document.id, {
                        expectedVersion: document.version,
                        reason,
                      });
                      await load();
                    } catch {
                      setMessage('Penghapusan hanya dapat dilakukan Super Owner yang berizin.');
                    }
                  }}
                >
                  <label>
                    Alasan penghapusan permanen
                    <input name="reason" minLength={3} required />
                  </label>
                  <Button variant="danger">Hapus file secara permanen</Button>
                </form>
              )}
          </Panel>
        ))}
      </section>
    </>
  );
}
