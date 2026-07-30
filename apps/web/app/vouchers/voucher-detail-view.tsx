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
import { Button } from '../components/actions';
import { AlertBanner, Drawer, useAppFeedback } from '../components/app-feedback';
import { Badge, Pagination, Panel } from '../components/admin/admin-ui';
import { Skeleton } from '../ui';
import {
  MultiSearchSelect,
  SearchSelect,
  SelectInput,
  Textarea,
  TextInput,
} from '../components/forms';
import {
  browserPackagePromotionClient,
  type InternalPackageRecord,
} from '../package-promotion-client';
import { browserMasterClient } from '../master-client';

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
  const [redemptionCursor, setRedemptionCursor] = useState<string>();
  const [redemptionHistory, setRedemptionHistory] = useState<Array<string | undefined>>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editDirty, setEditDirty] = useState(false);
  const [editFailure, setEditFailure] = useState('');
  const [packageOptions, setPackageOptions] = useState<InternalPackageRecord[]>([]);
  const [classTypes, setClassTypes] = useState<Array<{ id: string; name: string }>>([]);
  const [editBranchId, setEditBranchId] = useState('');
  const [selectedPackageIds, setSelectedPackageIds] = useState<string[]>([]);
  const feedback = useAppFeedback();
  const canManage = session?.status === 'authenticated' && session.hasCapability('voucher:manage');
  useEffect(() => {
    void browserVoucherClient
      .detail(id)
      .then(setVoucher)
      .catch(() => setError('Voucher tidak dapat dimuat.'));
  }, [id]);
  useEffect(() => {
    void browserVoucherClient
      .redemptions(id, redemptionCursor)
      .then(setRedemptions)
      .catch(() => undefined);
  }, [id, redemptionCursor]);
  useEffect(() => {
    if (!editOpen || !voucher) return;
    setEditDirty(false);
    setEditFailure('');
    const branchId = voucher.branch?.id ?? '';
    setEditBranchId(branchId);
    setSelectedPackageIds(voucher.packageIds);
    const branchIds = branchId
      ? [branchId]
      : (session?.session?.branches ?? []).map((branch) => branch.id);
    void Promise.all(
      branchIds.map((value) => browserPackagePromotionClient.packages({ branchId: value })),
    ).then((pages) => setPackageOptions(pages.flatMap((page) => page.items)));
    if (branchId) void browserMasterClient.listClassTypes(branchId).then(setClassTypes);
    else setClassTypes([]);
  }, [editOpen, session?.session?.branches, voucher]);
  const confirmDiscardEdit = () =>
    feedback.confirm({
      tone: 'warning',
      title: 'Batalkan perubahan voucher?',
      message: 'Perubahan yang belum disimpan akan hilang.',
      confirmLabel: 'Buang perubahan',
    });
  const closeEdit = async () => {
    if (!editDirty || (await confirmDiscardEdit())) {
      setEditDirty(false);
      setEditOpen(false);
    }
  };
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
        <div>
          <span className="text-xs text-dd-muted">Scope tipe kelas</span>
          <strong className="mt-1 block">{voucher.classType?.name ?? 'Semua tipe kelas'}</strong>
        </div>
        <div>
          <span className="text-xs text-dd-muted">Sisa kuota</span>
          <strong className="mt-1 block">
            {voucher.totalUsageLimit === null
              ? 'Tanpa batas'
              : Math.max(0, voucher.totalUsageLimit - voucher.redeemedCount)}
          </strong>
        </div>
        {voucher.description && (
          <div className="sm:col-span-2">
            <span className="text-xs text-dd-muted">Deskripsi</span>
            <p className="mt-1 text-sm">{voucher.description}</p>
          </div>
        )}
      </Panel>
      {canManage && voucher.status !== 'ARCHIVED' && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            leadingIcon={<Pencil className="size-4" aria-hidden="true" />}
            onClick={() => setEditOpen(true)}
          >
            Edit konfigurasi
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
        <div className="border-t border-dd-line p-4">
          <Pagination
            hasPrevious={redemptionHistory.length > 0}
            hasNext={Boolean(redemptions?.page.hasMore && redemptions.page.nextCursor)}
            totalLabel={`Halaman penggunaan ${redemptionHistory.length + 1}`}
            onPrevious={() => {
              const previous = redemptionHistory.at(-1);
              setRedemptionHistory((current) => current.slice(0, -1));
              setRedemptionCursor(previous);
            }}
            onNext={() => {
              const next = redemptions?.page.nextCursor;
              if (!next) return;
              setRedemptionHistory((current) => [...current, redemptionCursor]);
              setRedemptionCursor(next);
            }}
          />
        </div>
      </Panel>
      <Panel className="p-5">
        <h2 className="text-lg font-semibold">Aktivitas audit</h2>
        {!voucher.auditActivity?.length ? (
          <p className="mt-3 text-sm text-dd-muted">Belum ada perubahan tercatat.</p>
        ) : (
          <ol className="mt-3 grid gap-2">
            {voucher.auditActivity.map((item) => (
              <li key={item.id} className="flex justify-between gap-3 border-b border-dd-line py-2">
                <span className="text-sm font-medium">
                  {item.action
                    .replaceAll('.', ' ')
                    .toLowerCase()
                    .replace(/^./u, (value) => value.toUpperCase())}
                </span>
                <time className="text-xs text-dd-muted">
                  {new Date(item.occurredAt).toLocaleString('id-ID')}
                </time>
              </li>
            ))}
          </ol>
        )}
      </Panel>
      <Drawer
        open={editOpen}
        title="Edit voucher"
        onClose={() => {
          setEditDirty(false);
          setEditOpen(false);
        }}
        busy={busy}
        dirty={editDirty}
        onDirtyClose={confirmDiscardEdit}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => void closeEdit()}
              disabled={busy}
            >
              Batal
            </Button>
            <Button type="submit" form="voucher-edit-form" loading={busy}>
              Simpan perubahan
            </Button>
          </div>
        }
      >
        <form
          id="voucher-edit-form"
          className="grid gap-4"
          onChange={() => setEditDirty(true)}
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
            setEditFailure('');
            try {
              const updated = await browserVoucherClient.update(voucher.id, {
                code: String(data.get('code')),
                name: String(data.get('name')),
                description: String(data.get('description')),
                discountType: String(data.get('discountType')),
                discountValue: Number(data.get('discountValue')),
                maxDiscountRp: data.get('maxDiscountRp') ? Number(data.get('maxDiscountRp')) : null,
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
                packageIds: selectedPackageIds,
                branchId: editBranchId || null,
                classTypeId: String(data.get('classTypeId')) || null,
                expectedVersion: voucher.version,
                reason: String(data.get('reason')),
              });
              setVoucher(updated);
              setEditDirty(false);
              setEditOpen(false);
              feedback.showToast({
                tone: 'success',
                title: 'Voucher diperbarui',
                message: 'Konfigurasi baru berlaku untuk validasi berikutnya.',
              });
            } catch {
              setEditFailure('Data mungkin telah berubah. Muat ulang lalu coba kembali.');
            } finally {
              setBusy(false);
            }
          }}
        >
          {editFailure && (
            <AlertBanner tone="danger" title="Voucher belum diperbarui" message={editFailure} />
          )}
          <TextInput name="code" label="Kode voucher" required defaultValue={voucher.code} />
          <TextInput name="name" label="Nama voucher" required defaultValue={voucher.name} />
          <Textarea name="description" label="Deskripsi" defaultValue={voucher.description ?? ''} />
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
            name="maxDiscountRp"
            label="Batas maksimum diskon"
            type="number"
            min={0}
            defaultValue={voucher.maxDiscountRp ?? ''}
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
          <SearchSelect
            label="Scope cabang"
            value={editBranchId}
            placeholder="Semua cabang"
            options={(session.session?.branches ?? []).map((branch) => ({
              id: branch.id,
              label: branch.name,
              description: branch.code,
            }))}
            onChange={(branchId) => {
              setEditBranchId(branchId);
              setSelectedPackageIds([]);
              if (branchId) {
                void browserMasterClient.listClassTypes(branchId).then(setClassTypes);
                void browserPackagePromotionClient
                  .packages({ branchId })
                  .then((page) => setPackageOptions(page.items));
              } else {
                setClassTypes([]);
                void Promise.all(
                  (session.session?.branches ?? []).map((branch) =>
                    browserPackagePromotionClient.packages({ branchId: branch.id }),
                  ),
                ).then((pages) => setPackageOptions(pages.flatMap((page) => page.items)));
              }
            }}
          />
          <SearchSelect
            name="classTypeId"
            label="Scope tipe kelas"
            defaultValue={voucher.classType?.id ?? ''}
            placeholder="Semua tipe kelas"
            options={classTypes.map((item) => ({ id: item.id, label: item.name }))}
          />
          <MultiSearchSelect
            label="Scope paket"
            description="Tanpa pilihan berarti semua paket dalam scope cabang dan tipe kelas."
            placeholder="Cari dan pilih paket"
            value={selectedPackageIds}
            options={packageOptions.map((item) => ({
              id: item.id,
              label: item.name,
              description: item.branch?.name,
            }))}
            onChange={(ids) => setSelectedPackageIds(ids)}
          />
          <TextInput
            name="reason"
            label="Alasan perubahan"
            minLength={3}
            required
            placeholder="Contoh: Penyesuaian promo Agustus"
          />
        </form>
      </Drawer>
    </section>
  );
}
