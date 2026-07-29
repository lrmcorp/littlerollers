'use client';

import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../components/actions';
import { Badge, DataTable, Drawer, Panel } from '../components/admin/admin-ui';
import { AlertBanner, useAppFeedback } from '../components/app-feedback';
import { SelectInput, TextInput } from '../components/forms';
import { Skeleton } from '../ui';
import { useSessionContext } from '../session-context';
import {
  browserPackagePromotionClient,
  type InternalPackageRecord,
  type PackagePromotionRecord,
  type PromotionOrderPage,
} from '../package-promotion-client';

const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});
const stateLabels: Record<string, string> = {
  DRAFT: 'Draft',
  ACTIVE: 'Aktif',
  PAUSED: 'Dijeda',
  ARCHIVED: 'Diarsipkan',
  SCHEDULED: 'Terjadwal',
  LIVE: 'Sedang berlangsung',
  EXPIRED: 'Berakhir',
};

export function PackagePromotionDetailView({ id }: { id: string }) {
  const session = useSessionContext();
  const feedback = useAppFeedback();
  const [pkg, setPackage] = useState<InternalPackageRecord | null>(null);
  const [orders, setOrders] = useState<Record<string, PromotionOrderPage>>({});
  const [editor, setEditor] = useState<PackagePromotionRecord | 'new' | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const canManage =
    session?.status === 'authenticated' && session.hasCapability('package-promotion:manage');
  const load = () =>
    browserPackagePromotionClient
      .detail(id)
      .then(setPackage)
      .catch(() => setError('Detail paket tidak dapat dimuat.'));
  useEffect(() => void load(), [id]);
  if (!session || session.status === 'loading') return <Skeleton label="Memuat detail paket" />;
  if (error) return <AlertBanner tone="danger" title="Paket tidak tersedia" message={error} />;
  if (!pkg) return <Skeleton label="Memuat detail paket" />;

  const transition = async (
    promotion: PackagePromotionRecord,
    action: 'activate' | 'pause' | 'archive',
  ) => {
    const accepted = await feedback.confirm({
      tone: action === 'archive' ? 'danger' : 'warning',
      title: `${action === 'activate' ? 'Aktifkan' : action === 'pause' ? 'Jeda' : 'Arsipkan'} promo?`,
      message: `${promotion.name} untuk ${pkg.name}. Harga order lama tidak akan berubah.`,
      confirmLabel: action === 'archive' ? 'Arsipkan' : 'Lanjutkan',
    });
    if (!accepted) return;
    setBusy(true);
    try {
      await browserPackagePromotionClient.transition(promotion.id, action, promotion.version);
      await load();
      feedback.showToast({
        tone: 'success',
        title: 'Status promo diperbarui',
        message: 'Perubahan tercatat pada audit trail.',
      });
    } catch {
      feedback.showAlert({
        tone: 'danger',
        title: 'Perubahan belum tersimpan',
        message: 'Muat ulang detail promo lalu coba kembali.',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="grid gap-5" aria-labelledby="package-promotion-title">
      <Link
        href="/workspace/packages"
        className="inline-flex items-center gap-2 text-sm font-semibold text-dd-forest no-underline"
      >
        <ArrowLeft className="size-4" /> Kembali ke paket
      </Link>
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-dd-line pb-5">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-dd-forest uppercase">
            Paket & promo harga
          </p>
          <h1 id="package-promotion-title" className="mt-1 text-3xl font-semibold">
            {pkg.name}
          </h1>
          <p className="mt-2 text-sm text-dd-muted">
            {pkg.branch?.name} · {pkg.sessionCount} sesi · {pkg.durationDays} hari
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setEditor('new')}>
            <Plus className="size-4" /> Buat promo
          </Button>
        )}
      </header>
      <Panel className="grid gap-4 p-5 sm:grid-cols-3">
        <div>
          <span className="text-xs text-dd-muted">Harga normal</span>
          <strong className="mt-1 block text-xl">{rupiah.format(pkg.priceRp)}</strong>
        </div>
        <div>
          <span className="text-xs text-dd-muted">Status paket</span>
          <strong className="mt-1 block">
            {pkg.status === 'ACTIVE' ? 'Aktif' : 'Tidak aktif'}
          </strong>
        </div>
        <div>
          <span className="text-xs text-dd-muted">Periode paket</span>
          <strong className="mt-1 block text-sm">
            {new Date(pkg.effectiveFrom).toLocaleDateString('id-ID')} –{' '}
            {pkg.effectiveUntil
              ? new Date(pkg.effectiveUntil).toLocaleDateString('id-ID')
              : 'tanpa batas'}
          </strong>
        </div>
      </Panel>
      <Panel className="overflow-hidden p-0">
        <div className="border-b border-dd-line px-5 py-4">
          <h2 className="text-lg font-semibold">Histori promo</h2>
          <p className="mt-1 text-sm text-dd-muted">
            Hanya satu promo dapat efektif pada waktu yang sama.
          </p>
        </div>
        <DataTable
          items={pkg.promotions ?? []}
          rowKey={(item) => item.id}
          emptyTitle="Belum ada promo harga"
          emptyDescription="Buat promo untuk menampilkan harga asli dicoret pada katalog."
          columns={[
            {
              id: 'promotion',
              header: 'Promo',
              cell: (item) => (
                <div>
                  <strong>{item.name}</strong>
                  <p className="text-xs text-dd-muted">{item.label}</p>
                </div>
              ),
            },
            {
              id: 'price',
              header: 'Harga promo',
              cell: (item) => (
                <div>
                  <del className="text-xs text-dd-muted">{rupiah.format(pkg.priceRp)}</del>
                  <strong className="block text-dd-forest">
                    {rupiah.format(item.promotionalPriceRp)}
                  </strong>
                </div>
              ),
            },
            {
              id: 'period',
              header: 'Periode',
              cell: (item) => (
                <span className="text-xs">
                  {new Date(item.activeFrom).toLocaleString('id-ID')} –{' '}
                  {new Date(item.activeUntil).toLocaleString('id-ID')}
                </span>
              ),
            },
            {
              id: 'state',
              header: 'Status',
              cell: (item) => (
                <Badge tone={item.effectiveState === 'LIVE' ? 'success' : 'neutral'}>
                  {stateLabels[item.effectiveState] ?? item.effectiveState}
                </Badge>
              ),
            },
            {
              id: 'actions',
              header: 'Tindakan',
              cell: (item) => (
                <div className="flex flex-wrap gap-2">
                  {canManage && item.status !== 'ARCHIVED' && (
                    <Button size="sm" variant="secondary" onClick={() => setEditor(item)}>
                      Edit
                    </Button>
                  )}
                  {canManage && item.status !== 'ACTIVE' && item.status !== 'ARCHIVED' && (
                    <Button
                      size="sm"
                      disabled={busy}
                      onClick={() => void transition(item, 'activate')}
                    >
                      Aktifkan
                    </Button>
                  )}
                  {canManage && item.status === 'ACTIVE' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busy}
                      onClick={() => void transition(item, 'pause')}
                    >
                      Jeda
                    </Button>
                  )}
                  {canManage && item.status !== 'ARCHIVED' && (
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={busy}
                      onClick={() => void transition(item, 'archive')}
                    >
                      Arsipkan
                    </Button>
                  )}
                  {(item.usageCount ?? 0) > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        void browserPackagePromotionClient
                          .orders(item.id)
                          .then((page) => setOrders((current) => ({ ...current, [item.id]: page })))
                      }
                    >
                      {orders[item.id]
                        ? `${orders[item.id]!.items.length} pesanan`
                        : 'Lihat pesanan'}
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
          mobileCard={(item) => (
            <div className="grid gap-2">
              <div className="flex items-start justify-between gap-2">
                <strong>{item.name}</strong>
                <Badge>{stateLabels[item.effectiveState] ?? item.effectiveState}</Badge>
              </div>
              <span className="text-sm text-dd-muted">{item.label}</span>
              <strong className="text-dd-forest">{rupiah.format(item.promotionalPriceRp)}</strong>
            </div>
          )}
        />
      </Panel>
      <PromotionEditor
        pkg={pkg}
        value={editor}
        onClose={() => setEditor(null)}
        onSaved={async () => {
          setEditor(null);
          await load();
          feedback.showToast({
            tone: 'success',
            title: 'Promo tersimpan',
            message: 'Promo siap ditinjau dan diaktifkan.',
          });
        }}
      />
    </section>
  );
}

function PromotionEditor({
  pkg,
  value,
  onClose,
  onSaved,
}: {
  pkg: InternalPackageRecord;
  value: PackagePromotionRecord | 'new' | null;
  onClose(): void;
  onSaved(): Promise<void>;
}) {
  const current = value && value !== 'new' ? value : null;
  const [busy, setBusy] = useState(false);
  return (
    <Drawer
      open={Boolean(value)}
      title={current ? 'Edit promo paket' : 'Buat promo paket'}
      onClose={onClose}
    >
      <p className="mb-4 text-sm text-dd-muted">
        Harga normal {rupiah.format(pkg.priceRp)}. Promo harus menyisakan minimal Rp1.
      </p>
      <form
        className="grid gap-4"
        onSubmit={async (event) => {
          event.preventDefault();
          if (busy) return;
          const data = new FormData(event.currentTarget);
          const command = {
            name: String(data.get('name')),
            label: String(data.get('label')),
            discountType: String(data.get('discountType')),
            discountValue: Number(data.get('discountValue')),
            activeFrom: new Date(String(data.get('activeFrom'))).toISOString(),
            activeUntil: new Date(String(data.get('activeUntil'))).toISOString(),
            reason: String(data.get('reason')),
            ...(current ? { expectedVersion: current.version } : {}),
          };
          setBusy(true);
          try {
            if (current) await browserPackagePromotionClient.update(current.id, command);
            else await browserPackagePromotionClient.create(pkg.id, command);
            await onSaved();
          } finally {
            setBusy(false);
          }
        }}
      >
        <TextInput label="Nama promo" name="name" defaultValue={current?.name} required />
        <TextInput
          label="Label pada kartu"
          name="label"
          defaultValue={current?.label ?? 'Promo spesial'}
          required
        />
        <SelectInput
          label="Jenis diskon"
          name="discountType"
          defaultValue={current?.discountType ?? 'PERCENTAGE'}
        >
          <option value="PERCENTAGE">Persentase</option>
          <option value="FIXED_AMOUNT">Nominal tetap</option>
        </SelectInput>
        <TextInput
          label="Nilai diskon"
          name="discountValue"
          type="number"
          min="1"
          defaultValue={current?.discountValue ?? 10}
          required
        />
        <TextInput
          label="Mulai aktif"
          name="activeFrom"
          type="datetime-local"
          defaultValue={current ? current.activeFrom.slice(0, 16) : ''}
          required
        />
        <TextInput
          label="Berakhir"
          name="activeUntil"
          type="datetime-local"
          defaultValue={current ? current.activeUntil.slice(0, 16) : ''}
          required
        />
        <TextInput
          label="Alasan perubahan"
          name="reason"
          minLength={3}
          placeholder="Contoh: Promo pembukaan periode Agustus"
          required
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" loading={busy}>
            Simpan promo
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
