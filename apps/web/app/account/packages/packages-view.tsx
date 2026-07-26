'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { browserLedgerClient, type LedgerBalance } from '../../ledger-client';
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
    <section className="card order-page">
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
        <div className="member-package-grid">
          {items.map((item) => (
            <article className="member-package-card" key={item.id}>
              <div>
                <p className="eyebrow">{item.branchName ?? 'Daily Dose'}</p>
                <h2>{item.packageName ?? 'Paket kelas'}</h2>
                <p>{item.classTypeName ?? 'Kelas Daily Dose'}</p>
              </div>
              <StatusBadge tone={item.status === 'ACTIVE' ? 'success' : 'warning'}>
                {item.status}
              </StatusBadge>
              <dl>
                <div>
                  <dt>Tersedia</dt>
                  <dd>{item.available}</dd>
                </div>
                <div>
                  <dt>Dipesan</dt>
                  <dd>{item.reserved}</dd>
                </div>
                <div>
                  <dt>Total</dt>
                  <dd>{item.ledgerBalance}</dd>
                </div>
              </dl>
              <p>Berlaku sampai {item.expiryAt.toLocaleDateString('id-ID')}</p>
              <Link
                className="button-link"
                href={`/classes?branch=${encodeURIComponent(item.branchId)}#schedule`}
              >
                Booking kelas
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
