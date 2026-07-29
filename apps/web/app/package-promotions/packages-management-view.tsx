'use client';

import { useEffect, useState } from 'react';
import { Badge, DataTable, Panel } from '../components/admin/admin-ui';
import { AlertBanner } from '../components/app-feedback';
import { Button } from '../components/actions';
import { Skeleton } from '../ui';
import { useSessionContext } from '../session-context';
import {
  browserPackagePromotionClient,
  type InternalPackageRecord,
} from '../package-promotion-client';
import { useTrackedRouter } from '../components/app-loading';

const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export function PackagesManagementView() {
  const session = useSessionContext();
  const router = useTrackedRouter();
  const [items, setItems] = useState<InternalPackageRecord[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const canRead =
    session?.status === 'authenticated' &&
    session.hasCapability('package-promotion:read', 'package-promotion:manage');
  useEffect(() => {
    if (!canRead) return;
    setBusy(true);
    setError('');
    void browserPackagePromotionClient
      .packages(session.activeBranchId || undefined)
      .then((page) => setItems(page.items))
      .catch(() => setError('Daftar paket belum dapat dimuat.'))
      .finally(() => setBusy(false));
  }, [canRead, session?.activeBranchId]);
  if (!session || session.status === 'loading') return <Skeleton label="Memuat paket" />;
  if (!canRead)
    return (
      <AlertBanner
        tone="danger"
        title="Akses terbatas"
        message="Anda tidak memiliki akses membaca promo paket."
      />
    );
  return (
    <section className="grid gap-5" aria-labelledby="packages-management-title">
      <header className="border-b border-dd-line pb-5">
        <p className="text-xs font-bold tracking-[0.16em] text-dd-forest uppercase">Master data</p>
        <h1 id="packages-management-title" className="mt-1 text-3xl font-semibold">
          Paket & promo harga
        </h1>
        <p className="mt-2 text-sm text-dd-muted">
          Pilih paket untuk mengelola harga normal, promo aktif, dan histori pemakaiannya.
        </p>
      </header>
      {error && <AlertBanner tone="danger" title="Paket tidak tersedia" message={error} />}
      <Panel className="p-0">
        <DataTable
          items={items}
          loading={busy}
          rowKey={(item) => item.id}
          onRowClick={(item) => router.push(`/workspace/packages/${item.id}`)}
          rowDescription={(item) => `Buka detail ${item.name}`}
          emptyTitle="Belum ada paket"
          emptyDescription="Paket pada scope cabang Anda akan tampil di sini."
          columns={[
            {
              id: 'package',
              header: 'Paket',
              cell: (item) => (
                <div>
                  <strong>{item.name}</strong>
                  <p className="text-xs text-dd-muted">
                    {item.sessionCount} sesi · {item.durationDays} hari
                  </p>
                </div>
              ),
            },
            {
              id: 'branch',
              header: 'Cabang',
              cell: (item) => item.branch?.name ?? item.branchId,
            },
            {
              id: 'price',
              header: 'Harga normal',
              cell: (item) => rupiah.format(item.priceRp),
            },
            {
              id: 'status',
              header: 'Status',
              cell: (item) => (
                <Badge tone={item.status === 'ACTIVE' ? 'success' : 'neutral'}>
                  {item.status === 'ACTIVE' ? 'Aktif' : 'Tidak aktif'}
                </Badge>
              ),
            },
            {
              id: 'action',
              header: 'Tindakan',
              cell: (item) => (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(event) => {
                    event.stopPropagation();
                    router.push(`/workspace/packages/${item.id}`);
                  }}
                >
                  Kelola promo
                </Button>
              ),
            },
          ]}
          mobileCard={(item) => (
            <div className="grid gap-2">
              <strong>{item.name}</strong>
              <span className="text-sm text-dd-muted">{item.branch?.name}</span>
              <span className="font-semibold">{rupiah.format(item.priceRp)}</span>
            </div>
          )}
        />
      </Panel>
    </section>
  );
}
