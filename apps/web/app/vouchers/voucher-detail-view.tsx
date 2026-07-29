'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Pencil } from 'lucide-react';
import Link from 'next/link';
import {
  browserVoucherClient,
  type VoucherRecord,
  type VoucherRedemptionPage,
} from '../voucher-client';
import { useSessionContext } from '../session-context';
import { AlertBanner, useAppFeedback } from '../components/app-feedback';
import { Badge, Button, Drawer, Panel } from '../components/admin/admin-ui';
import { Skeleton } from '../ui';
import { SelectInput, TextInput } from '../components/forms';

const statusLabel: Record<string, string> = {
  DRAFT: 'Draft',
  ACTIVE: 'Aktif',
  PAUSED: 'Dijeda',
  EXPIRED: 'Kedaluwarsa',
  EXHAUSTED: 'Kuota habis',
  ARCHIVED: 'Diarsipkan',
};

export function VoucherDetailView({ id }: { id: string }) {
  const session = useSessionContext();
  const [voucher, setVoucher] = useState<VoucherRecord | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [redemptions, setRedemptions] = useState<VoucherRedemptionPage | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const feedback = useAppFeedback();
  const canManage = session?.status === 'authenticated' && session.hasCapability('voucher:manage');
  useEffect(() => {
    void browserVoucherClient
      .detail(id)
      .then(setVoucher)
      .catch(() => setError('Voucher tidak dapat dimuat.'));
    void browserVoucherClient
      .redemptions(id)
      .then(setRedemptions)
      .catch(() => undefined);
  }, [id]);
  const transition = async (action: 'activate' | 'pause' | 'archive') => {
    if (!voucher || busy) return;
    const labels = {
      activate: ['Aktifkan voucher?', 'Voucher dapat digunakan customer yang memenuhi syarat.'],
      pause: ['Jeda voucher?', 'Voucher tidak dapat dipakai untuk pesanan baru selama dijeda.'],
      archive: [
        'Arsipkan voucher?',
        'Voucher tidak dapat diaktifkan kembali melalui workflow ini.',
      ],
    } as const;
    const accepted = await feedback.confirm({
      tone: action === 'archive' ? 'danger' : 'warning',
      title: labels[action][0],
      message: `${labels[action][1]} Scope: ${voucher.branch?.name ?? 'semua cabang'}.`,
      confirmLabel: action === 'archive' ? 'Arsipkan' : 'Lanjutkan',
    });
    if (!accepted) return;
    setBusy(true);
    try {
      const updated = await browserVoucherClient.transition(voucher.id, action, voucher.version);
      setVoucher(updated);
      feedback.showToast({
        tone: 'success',
        title: 'Status voucher diperbarui',
        message: `${updated.code} sekarang berstatus ${statusLabel[updated.status]}.`,
      });
    } catch {
      feedback.showAlert({
        tone: 'danger',
        title: 'Perubahan belum tersimpan',
        message: 'Muat ulang data voucher lalu coba kembali.',
      });
    } finally {
      setBusy(false);
    }
  };
  if (!session || session.status === 'loading') return <Skeleton label="Memuat detail voucher" />;
  if (error) return <AlertBanner tone="danger" title="Voucher tidak tersedia" message={error} />;
  if (!voucher) return <Skeleton label="Memuat detail voucher" />;
  return (
    <section className="grid gap-5" aria-labelledby="voucher-detail-title">
      <Link
        href="/workspace/vouchers"
        className="inline-flex items-center gap-2 text-sm font-semibold text-dd-forest no-underline"
      >
        <ArrowLeft className="size-4" /> Kembali ke voucher
      </Link>
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-dd-line pb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-dd-forest">
            Voucher & promo
          </p>
          <h1 id="voucher-detail-title" className="mt-1 text-3xl font-semibold">
            {voucher.code}
          </h1>
          <p className="mt-2 text-sm text-dd-muted">
            {voucher.name} · {voucher.branch?.name ?? 'Semua cabang'}
          </p>
        </div>
        <Badge tone={voucher.status === 'ACTIVE' ? 'success' : 'warning'}>
          {statusLabel[voucher.status]}
        </Badge>
      </header>
      <Panel className="grid gap-4 p-5 sm:grid-cols-2">
        <div>
          <span className="text-xs text-dd-muted">Diskon</span>
          <strong className="mt-1 block">
            {voucher.discountType === 'PERCENTAGE'
              ? `${voucher.discountValue}%`
              : `Rp ${voucher.discountValue.toLocaleString('id-ID')}`}
          </strong>
        </div>
        <div>
          <span className="text-xs text-dd-muted">Periode</span>
          <strong className="mt-1 block">
            {new Date(voucher.activeFrom).toLocaleString('id-ID')} –{' '}
            {voucher.activeUntil
              ? new Date(voucher.activeUntil).toLocaleString('id-ID')
              : 'tanpa batas'}
          </strong>
        </div>
        <div>
          <span className="text-xs text-dd-muted">Minimum pembelian</span>
          <strong className="mt-1 block">
            Rp {voucher.minimumPurchaseRp.toLocaleString('id-ID')}
          </strong>
        </div>
        <div>
          <span className="text-xs text-dd-muted">Penggunaan</span>
          <strong className="mt-1 block">
            {voucher.redeemedCount}
            {voucher.totalUsageLimit ? ` / ${voucher.totalUsageLimit}` : ''}
          </strong>
        </div>
        <div className="sm:col-span-2">
          <span className="text-xs text-dd-muted">Scope paket</span>
          <strong className="mt-1 block">
            {voucher.packages?.length
              ? voucher.packages.map((item) => item.name).join(', ')
              : 'Semua paket'}
          </strong>
        </div>
      </Panel>
      {canManage && voucher.status !== 'ARCHIVED' && (
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" /> Edit konfigurasi
          </Button>
          {voucher.status !== 'ACTIVE' && (
            <Button disabled={busy} onClick={() => void transition('activate')}>
              Aktifkan
            </Button>
          )}
          {voucher.status === 'ACTIVE' && (
            <Button variant="secondary" disabled={busy} onClick={() => void transition('pause')}>
              Jeda
            </Button>
          )}
          <Button variant="danger" disabled={busy} onClick={() => void transition('archive')}>
            Arsipkan
          </Button>
        </div>
      )}
      <Panel className="overflow-hidden p-0">
        <div className="border-b border-dd-line px-5 py-4">
          <h2 className="text-lg font-semibold">Riwayat penggunaan</h2>
          <p className="mt-1 text-sm text-dd-muted">
            Pesanan yang menggunakan snapshot voucher ini.
          </p>
        </div>
        {!redemptions?.items.length ? (
          <p className="px-5 py-6 text-sm text-dd-muted">Belum ada penggunaan voucher.</p>
        ) : (
          <div className="divide-y divide-dd-line">
            {redemptions.items.map((item) => (
              <div
                key={item.id}
                className="grid gap-2 px-5 py-4 text-sm sm:grid-cols-[1fr_1fr_auto]"
              >
                <div>
                  <strong className="block">{item.customer.displayName}</strong>
                  <span className="text-dd-muted">{item.purchase.package.name}</span>
                </div>
                <div>
                  <strong className="block">{item.purchase.branch.name}</strong>
                  <span className="text-dd-muted">
                    {new Date(item.redeemedAt).toLocaleString('id-ID')}
                  </span>
                </div>
                <strong className="text-dd-forest">
                  − Rp {item.discountRp.toLocaleString('id-ID')}
                </strong>
              </div>
            ))}
          </div>
        )}
      </Panel>
      <Drawer open={editOpen} title="Edit voucher" onClose={() => setEditOpen(false)}>
        <form
          className="grid gap-4"
          onSubmit={async (event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            const accepted = await feedback.confirm({
              tone: 'warning',
              title: 'Simpan perubahan voucher?',
              message:
                'Pesanan lama tetap memakai snapshot sebelumnya. Perubahan hanya berlaku untuk pemakaian berikutnya.',
              confirmLabel: 'Simpan perubahan',
            });
            if (!accepted) return;
            setBusy(true);
            try {
              const updated = await browserVoucherClient.update(voucher.id, {
                code: String(data.get('code')),
                name: String(data.get('name')),
                discountType: String(data.get('discountType')),
                discountValue: Number(data.get('discountValue')),
                minimumPurchaseRp: Number(data.get('minimumPurchaseRp') || 0),
                activeFrom: new Date(String(data.get('activeFrom'))).toISOString(),
                activeUntil: data.get('activeUntil')
                  ? new Date(String(data.get('activeUntil'))).toISOString()
                  : null,
                totalUsageLimit: data.get('totalUsageLimit')
                  ? Number(data.get('totalUsageLimit'))
                  : null,
                perCustomerUsageLimit: data.get('perCustomerUsageLimit')
                  ? Number(data.get('perCustomerUsageLimit'))
                  : null,
                packageIds: voucher.packageIds,
                branchId: voucher.branch?.id ?? null,
                classTypeId: voucher.classType?.id ?? null,
                expectedVersion: voucher.version,
                reason: 'Konfigurasi voucher diperbarui dari workspace',
              });
              setVoucher(updated);
              setEditOpen(false);
              feedback.showToast({
                tone: 'success',
                title: 'Voucher diperbarui',
                message: 'Konfigurasi baru berlaku untuk validasi berikutnya.',
              });
            } catch {
              feedback.showAlert({
                tone: 'danger',
                title: 'Voucher belum diperbarui',
                message: 'Data mungkin telah berubah. Muat ulang lalu coba kembali.',
              });
            } finally {
              setBusy(false);
            }
          }}
        >
          <TextInput name="code" label="Kode voucher" required defaultValue={voucher.code} />
          <TextInput name="name" label="Nama voucher" required defaultValue={voucher.name} />
          <SelectInput name="discountType" label="Tipe diskon" defaultValue={voucher.discountType}>
            <option value="PERCENTAGE">Persentase</option>
            <option value="FIXED_AMOUNT">Nominal tetap</option>
          </SelectInput>
          <TextInput
            name="discountValue"
            label="Nilai diskon"
            type="number"
            min={1}
            required
            defaultValue={voucher.discountValue}
          />
          <TextInput
            name="minimumPurchaseRp"
            label="Minimum pembelian"
            type="number"
            min={0}
            defaultValue={voucher.minimumPurchaseRp}
          />
          <TextInput
            name="activeFrom"
            label="Mulai aktif"
            type="datetime-local"
            required
            defaultValue={new Date(voucher.activeFrom).toISOString().slice(0, 16)}
          />
          <TextInput
            name="activeUntil"
            label="Berakhir"
            type="datetime-local"
            defaultValue={
              voucher.activeUntil ? new Date(voucher.activeUntil).toISOString().slice(0, 16) : ''
            }
          />
          <TextInput
            name="totalUsageLimit"
            label="Kuota total"
            type="number"
            min={0}
            defaultValue={voucher.totalUsageLimit ?? ''}
          />
          <TextInput
            name="perCustomerUsageLimit"
            label="Batas per customer"
            type="number"
            min={0}
            defaultValue={voucher.perCustomerUsageLimit ?? ''}
          />
          <Button type="submit" disabled={busy}>
            Simpan perubahan
          </Button>
        </form>
      </Drawer>
    </section>
  );
}
