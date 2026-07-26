'use client';

import { useEffect, useState } from 'react';
import {
  fileMetadata,
  verificationClient,
  type DocumentKind,
  type VerificationSummary,
} from '../../identity-verification-client';
import { Feedback, PageHeader, StatusBadge } from '../../ui';
import { useSessionContext } from '../../session-context';

const labels: Record<DocumentKind, string> = { SELFIE: 'Foto selfie', KTP_FRONT: 'Foto KTP depan' };

export function VerificationView() {
  const [summary, setSummary] = useState<VerificationSummary | null>(null);
  const [message, setMessage] = useState('');
  const session = useSessionContext();
  const load = () =>
    verificationClient
      .mine()
      .then(setSummary)
      .catch(() => setMessage('Status verifikasi tidak dapat dimuat.'));
  useEffect(() => void load(), []);
  return (
    <>
      <PageHeader
        eyebrow="Akun customer"
        title="Verifikasi identitas"
        description="Selfie dan KTP diperiksa secara terpisah. Dokumen hanya tersedia melalui akses privat untuk reviewer berwenang."
        context={
          <StatusBadge
            tone={
              summary?.status === 'APPROVED'
                ? 'success'
                : summary?.status === 'ACTION_REQUIRED'
                  ? 'warning'
                  : 'neutral'
            }
          >
            {summary?.status ?? 'MEMUAT'}
          </StatusBadge>
        }
      />
      {summary?.status !== 'APPROVED' && (
        <Feedback kind="info">
          Anda tetap dapat melihat profil dan jadwal. Pembelian paket dan booking tersedia setelah
          kedua bukti disetujui.
        </Feedback>
      )}
      {message && <Feedback kind="error">{message}</Feedback>}
      <section className="verification-grid" aria-label="Status dokumen">
        {summary?.documents.map((document) => (
          <article className="card" key={document.id}>
            <h2>{labels[document.kind]}</h2>
            <StatusBadge
              tone={
                document.status === 'APPROVED'
                  ? 'success'
                  : document.status === 'REJECTED'
                    ? 'warning'
                    : 'neutral'
              }
            >
              {document.status}
            </StatusBadge>
            <p>{document.fileName}</p>
            {document.rejectionReasonCode && (
              <Feedback kind="error">
                {document.rejectionReasonCode.replaceAll('_', ' ')}
                {document.rejectionNote ? ` — ${document.rejectionNote}` : ''}
              </Feedback>
            )}
            {document.status === 'REJECTED' && (
              <form
                onSubmit={async (event) => {
                  event.preventDefault();
                  const file = new FormData(event.currentTarget).get('replacement');
                  if (!(file instanceof File) || !file.size) return;
                  setMessage('');
                  try {
                    await verificationClient.replace(document.kind, {
                      ...(await fileMetadata(file)),
                      expectedVersion: document.version,
                    });
                    await load();
                    await session?.refresh();
                  } catch {
                    setMessage('Dokumen pengganti belum dapat disimpan.');
                  }
                }}
              >
                <label>
                  Unggah bukti pengganti
                  <input
                    name="replacement"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    required
                  />
                </label>
                <button>Unggah ulang</button>
              </form>
            )}
          </article>
        ))}
      </section>
    </>
  );
}
