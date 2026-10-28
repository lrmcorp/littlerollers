'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Pencil } from 'lucide-react';
import Link from 'next/link';
import {
  browserVoucherClient,
  type VoucherRecord,
  type VoucherRedemptionPage,
} from '@/api-clients/voucher-client';
import { useSessionContext } from '../session-context';
import { Button } from '../components/actions';
import { AlertBanner, Drawer, useAppFeedback } from '../components/app-feedback';
import { Badge, Pagination, Panel } from '../components/admin/admin-ui';
import { Skeleton } from '../ui';
import { useTrackedRouter } from '../components/app-loading';
import { useVoucherLifecycle } from './use-voucher-lifecycle';
import {
  AsyncMultiSearchSelect,
  SearchSelect,
  SelectInput,
  Textarea,
  TextInput,
} from '../components/forms';
import {
  browserPackagePromotionClient,
  type InternalPackageRecord,
} from '@/api-clients/package-promotion-client';
import { browserMasterClient } from '@/api-clients/master-client';

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
  const [editClassTypeId, setEditClassTypeId] = useState('');
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
    setEditClassTypeId(voucher.classType?.id ?? '');
    setSelectedPackageIds(voucher.packageIds);
    void Promise.all(
      voucher.packageIds.map((packageId) => browserPackagePromotionClient.detail(packageId)),
    )
      .then(setPackageOptions)
      .catch(() => setPackageOptions([]));
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
  const router = useTrackedRouter();
  const lifecycle = useVoucherLifecycle(async (action, updated) => {
    if (action === 'delete') {
      router.push('/workspace/vouchers');
      return;
    }
    if (updated) setVoucher(updated);
    else await browserVoucherClient.detail(id).then(setVoucher);
  });
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
          <p className="text-[13px] font-bold text-dd-forest">
            Voucher & promo
          </p>
          <h1 id="voucher-detail-title" className="mt-1 text-3xl font-semibold">
            {voucher.code}
          </h1>
          <p className="mt-2 text-sm text-dd-muted">
            {voucher.name} · {voucher.branch?.name ?? 'Semua cabang'}
          </p>
        </div>
        <Badge
          tone={
            voucher.status === 'ACTIVE'
              ? 'success'
              : voucher.status === 'EXPIRED' || voucher.status === 'EXHAUSTED'
                ? 'danger'
                : 'warning'
          }
        >
          {statusLabel[voucher.status]}
        </Badge>
      </header>
      <Panel className="grid gap-4 p-5 sm:grid-cols-2">
        <div>
          <span className="text-xs text-dd-muted">Diskon</span>
          <strong className="mt-1 block">
            {(String(voucher.discountType).toUpperCase() === 'PERCENTAGE' ||
            String(voucher.discountType).toUpperCase() === 'PERCENT' ||
            String(voucher.discountType) === '%')
              ? `${voucher.discountValue ?? 0}%`
              : `Rp ${(voucher.discountValue ?? 0).toLocaleString('id-ID')}`}
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
            Rp {(voucher.minimumPurchaseRp ?? 0).toLocaleString('id-ID')}
          </strong>
        </div>
        <div>
          <span className="text-xs text-dd-muted">Penggunaan</span>
          <strong className="mt-1 block">
            {voucher.redeemedCount ?? 0}
            {(voucher.totalUsageLimit ?? 0) > 0 ? ` / ${voucher.totalUsageLimit}` : ''}
          </strong>
        </div>
        <div className="sm:col-span-2">
          <span className="text-xs text-dd-muted">Cakupan paket</span>
          <strong className="mt-1 block">
            {voucher.packages?.length
              ? voucher.packages.map((item) => item.name).join(', ')
              : 'Semua paket'}
          </strong>
        </div>
        <div>
          <span className="text-xs text-dd-muted">Cakupan tipe kelas</span>
          <strong className="mt-1 block">{voucher.classType?.name ?? 'Semua tipe kelas'}</strong>
        </div>
        <div>
          <span className="text-xs text-dd-muted">Sisa kuota</span>
          <strong className="mt-1 block">
            {voucher.totalUsageLimit == null || voucher.totalUsageLimit === 0
              ? 'Tanpa batas'
              : Math.max(0, (voucher.totalUsageLimit ?? 0) - (voucher.redeemedCount ?? 0))}
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
          {/* Kedaluwarsa/kuota habis tetap "menyala" di data, jadi hanya PAUSED yang perlu diaktifkan. */}
          {voucher.status === 'PAUSED' && (
            <Button disabled={busy} onClick={() => void lifecycle.activate(voucher)}>
              Aktifkan
            </Button>
          )}
          {voucher.status === 'ACTIVE' && (
            <Button variant="secondary" disabled={busy} onClick={() => lifecycle.open(voucher, 'deactivate')}>
              Jeda
            </Button>
          )}
          <Button variant="secondary" disabled={busy} onClick={() => lifecycle.open(voucher, 'archive')}>
            Arsipkan
          </Button>
          <Button variant="danger" disabled={busy} onClick={() => lifecycle.open(voucher, 'delete')}>
            Hapus
          </Button>
        </div>
      )}
      {canManage && voucher.status === 'ARCHIVED' && (
        <div className="flex flex-wrap gap-2">
          <Button disabled={busy} onClick={() => void lifecycle.activate(voucher)}>
            Buka arsip &amp; aktifkan
          </Button>
          <Button variant="danger" disabled={busy} onClick={() => lifecycle.open(voucher, 'delete')}>
            Hapus
          </Button>
        </div>
      )}
      {lifecycle.dialog}
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
                  − Rp {(item.discountRp ?? 0).toLocaleString('id-ID')}
                </strong>
              </div>
            ))}
          </div>
        )}
        <div className="border-t border-dd-line p-4">
          <Pagination
            hasPrevious={redemptionHistory.length > 0}
            hasNext={Boolean(redemptions?.page.hasMore && redemptions.page.nextCursor)}
            currentPage={redemptionHistory.length + 1}
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
            // Capture FormData BEFORE any await to prevent loss of event.currentTarget
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
            // Safe date parser: returns ISO string or null for invalid/empty values
            const safeISOString = (value: string | null | undefined): string | null => {
              if (!value) return null;
              const d = new Date(value);
              return isNaN(d.getTime()) ? null : d.toISOString();
            };
            try {
              const updated = await browserVoucherClient.update(voucher.id, {
                code: String(data.get('code')),
                name: String(data.get('name')),
                description: String(data.get('description')),
                discountType: String(data.get('discountType')),
                discountValue: Number(data.get('discountValue')),
                maxDiscountRp: data.get('maxDiscountRp') ? Number(data.get('maxDiscountRp')) : null,
                minimumPurchaseRp: Number(data.get('minimumPurchaseRp') || 0),
                activeFrom:
                  safeISOString(String(data.get('activeFrom'))) ??
                  safeISOString(voucher.activeFrom) ??
                  new Date().toISOString(),
                activeUntil: data.get('activeUntil')
                  ? safeISOString(String(data.get('activeUntil')))
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
            defaultValue={(() => {
              const d = new Date(voucher.activeFrom);
              return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 16);
            })()}
          />
          <TextInput
            name="activeUntil"
            label="Berakhir"
            type="datetime-local"
            defaultValue={
              voucher.activeUntil
                ? (() => {
                    const d = new Date(voucher.activeUntil);
                    return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 16);
                  })()
                : ''
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
            label="Batas per pelanggan"
            type="number"
            min={0}
            defaultValue={voucher.perCustomerUsageLimit ?? ''}
          />
          <SearchSelect
            label="Cakupan cabang"
            value={editBranchId}
            placeholder="Semua cabang"
            options={(session.session?.branches ?? []).map((branch) => ({
              id: branch.id,
              label: branch.name,
              description: branch.code,
            }))}
            onChange={(branchId) => {
              void (async () => {
                if (
                  selectedPackageIds.length > 0 &&
                  !(await feedback.confirm({
                    tone: 'warning',
                    title: 'Ganti cakupan cabang?',
                    message: 'Pilihan paket yang sudah dipilih akan dikosongkan.',
                    confirmLabel: 'Ganti cabang',
                  }))
                )
                  return;
                setEditBranchId(branchId);
                setEditClassTypeId('');
                setSelectedPackageIds([]);
                setPackageOptions([]);
                if (branchId) void browserMasterClient.listClassTypes(branchId).then(setClassTypes);
                else setClassTypes([]);
              })();
            }}
          />
          <SearchSelect
            name="classTypeId"
            label="Cakupan tipe kelas"
            value={editClassTypeId}
            placeholder="Semua tipe kelas"
            options={classTypes.map((item) => ({ id: item.id, label: item.name }))}
            onChange={(classTypeId) => {
              void (async () => {
                if (
                  selectedPackageIds.length > 0 &&
                  !(await feedback.confirm({
                    tone: 'warning',
                    title: 'Ganti cakupan tipe kelas?',
                    message: 'Pilihan paket yang sudah dipilih akan dikosongkan.',
                    confirmLabel: 'Ganti tipe kelas',
                  }))
                )
                  return;
                setEditClassTypeId(classTypeId);
                setSelectedPackageIds([]);
                setPackageOptions([]);
              })();
            }}
          />
          <AsyncMultiSearchSelect
            label="Cakupan paket"
            description="Tanpa pilihan berarti semua paket dalam cakupan cabang dan tipe kelas."
            placeholder="Cari dan pilih paket"
            value={selectedPackageIds}
            selectedOptions={packageOptions.map((item) => ({
              id: item.id,
              label: item.name,
              description:
                item.branchScopes
                  ?.map((scope) => scope.branch?.name)
                  .filter(Boolean)
                  .join(', ') || undefined,
            }))}
            loadOptions={async (query, cursor) => {
              const page = await browserPackagePromotionClient.packages({
                branchId: editBranchId || undefined,
                classTypeId: editClassTypeId || undefined,
                status: 'ACTIVE',
                q: query.trim() || undefined,
                cursor,
              });
              return {
                items: page.items.map((item) => ({
                  id: item.id,
                  label: item.name,
                  description:
                    item.branchScopes
                      ?.map((scope) => scope.branch?.name)
                      .filter(Boolean)
                      .join(', ') || undefined,
                })),
                nextCursor: page.page.nextCursor ?? undefined,
              };
            }}
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
