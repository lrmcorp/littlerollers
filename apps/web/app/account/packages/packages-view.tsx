'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { browserLedgerClient, type LedgerBalance } from '../../ledger-client';
import { ButtonLink } from '../../components/actions';
import { EmptyState, Feedback, PageHeader, Skeleton, StatusBadge } from '../../ui';

export function CustomerPackagesView() {
  const [items, setItems] = useState<LedgerBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    browserLedgerClient
      .list()
      .then((value) => setItems(value.items))
      .catch(() => setError('Paket Anda belum dapat dimuat.'))
      .finally(() => setLoading(false));
  }, []);
  return (
    <main className="space-y-6">
      <PageHeader
        eyebrow="Member area"
        title="Paket Saya"
        description="Lihat saldo sesi, masa aktif, dan lanjutkan langsung ke jadwal booking."
        context={<Link href="/packages">Tambah paket</Link>}
      />
      {error && <Feedback kind="error">{error}</Feedback>}
      {loading ? (
        <Skeleton />
      ) : items.length === 0 ? (
        <EmptyState
          title="Belum ada paket aktif"
          description="Paket akan tampil setelah bukti pembayaran pesanan disetujui."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <article
              className="rounded-dd-xl border border-dd-line bg-white p-5 shadow-dd-card sm:p-6"
              key={item.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-dd-forest">
                    {item.branchName ?? 'Daily Dose'}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold">
                    {item.packageName ?? 'Paket kelas'}
                  </h2>
                  <p className="mt-1 text-sm text-dd-muted">
                    {item.classTypeName ?? 'Kelas Daily Dose'}
                  </p>
                </div>
                <StatusBadge tone={item.status === 'ACTIVE' ? 'success' : 'warning'}>
                  {item.status === 'ACTIVE' ? 'Aktif' : 'Tidak aktif'}
                </StatusBadge>
              </div>
              <dl className="mt-5 grid grid-cols-3 gap-2">
                <div className="rounded-dd-lg bg-dd-surface-muted p-3">
                  <dt className="text-xs text-dd-muted">Tersedia</dt>
                  <dd className="mt-1 text-xl font-semibold">{item.available}</dd>
                </div>
                <div className="rounded-dd-lg bg-dd-surface-muted p-3">
                  <dt className="text-xs text-dd-muted">Dipesan</dt>
                  <dd className="mt-1 text-xl font-semibold">{item.reserved}</dd>
                </div>
                <div className="rounded-dd-lg bg-dd-surface-muted p-3">
                  <dt className="text-xs text-dd-muted">Total</dt>
                  <dd className="mt-1 text-xl font-semibold">{item.ledgerBalance}</dd>
                </div>
              </dl>
              <p className="mt-4 text-sm text-dd-muted">
                Berlaku sampai {item.expiryAt.toLocaleDateString('id-ID')}
              </p>
              <ButtonLink
                className="mt-5"
                href={`/classes?branch=${encodeURIComponent(item.branchId)}#schedule`}
              >
                Booking kelas
              </ButtonLink>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
