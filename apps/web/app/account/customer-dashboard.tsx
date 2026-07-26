'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { verificationClient, type VerificationSummary } from '../identity-verification-client';
import { useSessionContext } from '../session-context';
import { Feedback, PageHeader, StatusBadge } from '../ui';

const documentLabels = {
  SELFIE: 'Selfie',
  KTP_FRONT: 'KTP depan',
} as const;

export function CustomerDashboard() {
  const context = useSessionContext();
  const session = context?.session;
  const [verification, setVerification] = useState<VerificationSummary | null>(null);
  const [failed, setFailed] = useState(false);
  const approved = session?.identityVerificationStatus === 'APPROVED';

  useEffect(() => {
    verificationClient
      .mine()
      .then(setVerification)
      .catch(() => setFailed(true));
  }, []);

  if (!session) return null;

  return (
    <div className="customer-dashboard">
      <PageHeader
        eyebrow="Dashboard saya"
        title={`Halo, ${session.displayName}`}
        description="Kelola verifikasi, lihat jadwal, dan akses kebutuhan latihan Anda dalam satu tempat."
        context={
          <StatusBadge tone={approved ? 'success' : 'warning'}>
            {approved ? 'Identitas terverifikasi' : 'Verifikasi berlangsung'}
          </StatusBadge>
        }
      />

      {!approved && (
        <Feedback kind="info">
          Jadwal tetap dapat dilihat. Booking dan pembelian paket akan terbuka setelah selfie dan
          KTP disetujui.
        </Feedback>
      )}
      {failed && <Feedback kind="error">Detail status verifikasi belum dapat dimuat.</Feedback>}

      <section className="customer-status-card" aria-labelledby="customer-verification-title">
        <div>
          <p className="eyebrow">Verifikasi identitas</p>
          <h2 id="customer-verification-title">
            {approved ? 'Semua dokumen telah disetujui' : 'Lengkapi akses akun Anda'}
          </h2>
          <p>Selfie dan KTP diperiksa terpisah oleh tim Daily Dose melalui penyimpanan privat.</p>
        </div>
        <div className="customer-document-progress">
          {verification?.documents.map((document) => (
            <div key={document.id}>
              <span>{documentLabels[document.kind]}</span>
              <StatusBadge
                tone={
                  document.status === 'APPROVED'
                    ? 'success'
                    : document.status === 'REJECTED'
                      ? 'danger'
                      : 'neutral'
                }
              >
                {document.status}
              </StatusBadge>
            </div>
          ))}
        </div>
        <Link className="customer-card-action" href="/account/verification">
          Lihat detail verifikasi
        </Link>
      </section>

      <section aria-labelledby="customer-actions-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Akses customer</p>
            <h2 id="customer-actions-title">Kebutuhan Anda</h2>
          </div>
        </div>
        <div className="customer-action-grid">
          <Link href="/classes">
            <span className="customer-action-number">01</span>
            <strong>Jadwal kelas</strong>
            <span>Lihat kelas dan waktu latihan yang tersedia.</span>
            <b>Lihat jadwal →</b>
          </Link>
          <Link href="/packages">
            <span className="customer-action-number">02</span>
            <strong>Paket latihan</strong>
            <span>Pelajari membership dan paket Daily Dose.</span>
            <b>{approved ? 'Pilih paket →' : 'Lihat pilihan →'}</b>
          </Link>
          {approved ? (
            <Link href="/ledger">
              <span className="customer-action-number">03</span>
              <strong>Paket saya</strong>
              <span>Lihat saldo sesi, masa berlaku, dan riwayat penggunaan.</span>
              <b>Lihat saldo →</b>
            </Link>
          ) : (
            <div className="is-locked" aria-label="Paket saya terkunci">
              <span className="customer-action-number">03</span>
              <strong>Paket saya</strong>
              <span>Tersedia setelah identitas Anda disetujui.</span>
              <b>Terkunci</b>
            </div>
          )}
          {approved ? (
            <Link href="/bookings">
              <span className="customer-action-number">04</span>
              <strong>Booking</strong>
              <span>Buat booking dan kelola jadwal latihan Anda.</span>
              <b>Buka booking →</b>
            </Link>
          ) : (
            <div className="is-locked" aria-label="Booking terkunci">
              <span className="customer-action-number">04</span>
              <strong>Booking</strong>
              <span>Menunggu selfie dan KTP disetujui.</span>
              <b>Terkunci</b>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
