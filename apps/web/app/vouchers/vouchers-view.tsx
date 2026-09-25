'use client';

import { useEffect, useState } from 'react';
import { Plus, TicketPercent } from 'lucide-react';
import { browserVoucherClient, type VoucherRecord } from '@/api-clients/voucher-client';
import { useSessionContext } from '../session-context';
import { Button } from '../components/actions';
import {
  AsyncMultiSearchSelect,
  SearchSelect,
  Textarea,
  TextInput,
  SelectInput,
} from '../components/forms';
import { AlertBanner, Drawer } from '../components/app-feedback';
import { DataTable, Badge, Pagination, Panel, StatCard } from '../components/admin/admin-ui';
import { EmptyState, Skeleton } from '../ui';
import { useTrackedRouter } from '../components/app-loading';
import { useAppFeedback } from '../components/app-feedback';
import { browserPackagePromotionClient } from '@/api-clients/package-promotion-client';
import { browserMasterClient } from '@/api-clients/master-client';

const labels: Record<string, string> = {
  DRAFT: 'Draft',
  ACTIVE: 'Aktif',
  PAUSED: 'Dijeda',
  EXPIRED: 'Kedaluwarsa',
  EXHAUSTED: 'Kuota habis',
  ARCHIVED: 'Diarsipkan',
};

export function VouchersView() {
  const session = useSessionContext();
  const router = useTrackedRouter();
  const feedback = useAppFeedback();
  const canRead = session?.status === 'authenticated' && session.hasCapability('voucher:read');
  const canManage = session?.status === 'authenticated' && session.hasCapability('voucher:manage');
  const [items, setItems] = useState<VoucherRecord[]>([]);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [createDirty, setCreateDirty] = useState(false);
  const [summary, setSummary] = useState<Partial<Record<VoucherRecord['status'], number>>>({});
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string>();
  const [cursorHistory, setCursorHistory] = useState<Array<string | undefined>>([]);
  const [classTypes, setClassTypes] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedPackageIds, setSelectedPackageIds] = useState<string[]>([]);
  const [form, setForm] = useState({
    code: '',
    name: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '10',
    maxDiscountRp: '',
    minimumPurchaseRp: '0',
    activeFrom: new Date().toISOString().slice(0, 16),
    activeUntil: '',
    totalUsageLimit: '',
    perCustomerUsageLimit: '',
    branchId: '',
    classTypeId: '',
    reason: '',
  });
  const confirmDiscardCreate = () =>
    feedback.confirm({
      tone: 'warning',
      title: 'Batalkan pembuatan voucher?',
      message: 'Input voucher yang belum disimpan akan hilang.',
      confirmLabel: 'Buang input',
    });
  const closeCreate = async () => {
    if (!createDirty || (await confirmDiscardCreate())) {
      setCreateDirty(false);
      setCreateOpen(false);
    }
  };
  const load = async (cursor?: string) => {
    if (!canRead) return;
    setBusy(true);
    setError('');
    try {
      const page = await browserVoucherClient.list({ q, status, cursor });
      setItems(page.items);
      setSummary(page.summary ?? {});
      setNextCursor(page.page.nextCursor);
    } catch {
      setError('Voucher belum dapat dimuat. Coba lagi.');
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => void load(cursor), [canRead, cursor, q, status]);

  const handleTransition = async (
    voucher: VoucherRecord,
    action: 'activate' | 'pause' | 'archive',
  ) => {
    if (!canManage || busy) return;
    const actionText =
      action === 'activate' ? 'Aktifkan' : action === 'pause' ? 'Jeda' : 'Arsipkan';
    const accepted = await feedback.confirm({
      tone: action === 'archive' ? 'danger' : 'warning',
      title: `${actionText} voucher ${voucher.code}?`,
      message:
        action === 'activate'
          ? `Voucher "${voucher.name}" akan dapat digunakan oleh pelanggan sesuai kuota dan periode.`
          : action === 'pause'
            ? `Voucher "${voucher.name}" akan dijeda sementara dan tidak dapat digunakan hingga diaktifkan kembali.`
            : `Voucher "${voucher.name}" akan diarsipkan permanen.`,
      confirmLabel: actionText,
    });
    if (!accepted) return;
    setBusy(true);
    try {
      await browserVoucherClient.transition(voucher.id, action, voucher.version);
      feedback.showToast({
        tone: 'success',
        title: `Voucher berhasil ${action === 'activate' ? 'diaktifkan' : action === 'pause' ? 'dijeda' : 'diarsipkan'}`,
      });
      await load(cursor);
    } catch {
      feedback.showToast({
        tone: 'danger',
        title: 'Gagal mengubah status voucher',
        message: 'Silakan muat ulang atau coba beberapa saat lagi.',
      });
    } finally {
      setBusy(false);
    }
  };

  if (!session || session.status === 'loading') return <Skeleton label="Memuat voucher" />;
  if (!canRead)
    return (
      <AlertBanner
        tone="danger"
        title="Akses terbatas"
        message="Anda tidak memiliki akses melihat voucher."
      />
    );

  return (
    <section className="grid gap-5" aria-labelledby="voucher-title">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-dd-line pb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-dd-forest">
            Administrasi
          </p>
          <h1 id="voucher-title" className="mt-1 text-3xl font-semibold">
            Voucher & promo
          </h1>
          <p className="mt-2 text-sm text-dd-muted">
            Kelola promo dengan periode, cakupan paket, dan kuota yang dapat diaudit.
          </p>
        </div>
        {canManage && (
          <Button
            leadingIcon={<Plus className="size-4" aria-hidden="true" />}
            onClick={() => setCreateOpen(true)}
          >
            Buat voucher
          </Button>
        )}
      </header>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {(['ACTIVE', 'PAUSED', 'EXPIRED', 'EXHAUSTED'] as const).map((value) => (
          <button
            key={value}
            type="button"
            className="text-left"
            onClick={() => {
              setStatus(status === value ? '' : value);
              setCursor(undefined);
              setCursorHistory([]);
            }}
          >
            <StatCard
              label={labels[value] ?? value}
              value={String(summary[value] ?? 0)}
              tone={value === 'ACTIVE' ? 'success' : 'neutral'}
            />
          </button>
        ))}
      </div>
      <Panel className="grid gap-3 p-4 sm:grid-cols-[1fr_220px]">
        <TextInput
          label="Cari voucher"
          value={q}
          onChange={(event) => {
            setQ(event.target.value);
            setCursor(undefined);
            setCursorHistory([]);
          }}
          placeholder="Kode atau nama voucher"
        />
        <SelectInput
          label="Status"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setCursor(undefined);
            setCursorHistory([]);
          }}
        >
          <option value="">Semua status</option>
          {Object.entries(labels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </SelectInput>
      </Panel>
      {error && <AlertBanner tone="danger" title="Gagal memuat voucher" message={error} />}
      {busy && items.length === 0 ? (
        <Skeleton label="Memuat daftar voucher" />
      ) : items.length === 0 ? (
        <EmptyState
          title="Belum ada voucher"
          description="Buat voucher pertama untuk katalog paket."
        />
      ) : (
        <DataTable
          rowNumberOffset={cursorHistory.length * 20}
          items={items}
          rowKey={(item) => item.id}
          columns={[
            {
              id: 'code',
              header: 'Voucher',
              cell: (item) => (
                <div>
                  <strong className="block">{item.code}</strong>
                  <span className="text-xs text-dd-muted">{item.name}</span>
                </div>
              ),
            },
            {
              id: 'discount',
              header: 'Diskon',
              cell: (item) =>
                item.discountType === 'PERCENTAGE'
                  ? `${item.discountValue ?? 0}%`
                  : `Rp ${(item.discountValue ?? 0).toLocaleString('id-ID')}`,
            },
            { id: 'scope', header: 'Cakupan', cell: (item) => item.branch?.name ?? 'Semua cabang' },
            {
              id: 'period',
              header: 'Periode',
              cell: (item) =>
                `${new Date(item.activeFrom).toLocaleDateString('id-ID')} – ${item.activeUntil ? new Date(item.activeUntil).toLocaleDateString('id-ID') : 'tanpa batas'}`,
            },
            {
              id: 'status',
              header: 'Status',
              cell: (item) => (
                <Badge
                  tone={
                    item.status === 'ACTIVE'
                      ? 'success'
                      : item.status === 'EXPIRED' || item.status === 'EXHAUSTED'
                        ? 'danger'
                        : 'warning'
                  }
                >
                  {labels[item.status]}
                </Badge>
              ),
            },
            {
              id: 'usage',
              header: 'Penggunaan',
              cell: (item) =>
                `${item.redeemedCount}${item.totalUsageLimit ? ` / ${item.totalUsageLimit}` : ''}`,
            },
            {
              id: 'actions',
              header: 'Tindakan',
              cell: (item) => (
                <div
                  className="flex items-center gap-1.5"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      router.push(`/workspace/vouchers/${item.id}`);
                    }}
                  >
                    Lihat detail
                  </Button>
                  {canManage && item.status === 'ACTIVE' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={busy}
                      className="text-amber-700 hover:bg-amber-50"
                      onClick={(event) => {
                        event.stopPropagation();
                        void handleTransition(item, 'pause');
                      }}
                    >
                      Jeda
                    </Button>
                  )}
                  {canManage && (item.status === 'PAUSED' || item.status === 'DRAFT') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={busy}
                      className="text-dd-forest hover:bg-emerald-50"
                      onClick={(event) => {
                        event.stopPropagation();
                        void handleTransition(item, 'activate');
                      }}
                    >
                      Aktifkan
                    </Button>
                  )}
                  {canManage && item.status !== 'ARCHIVED' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={busy}
                      className="text-dd-muted hover:text-dd-danger hover:bg-red-50"
                      onClick={(event) => {
                        event.stopPropagation();
                        void handleTransition(item, 'archive');
                      }}
                    >
                      Arsip
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
          mobileCard={(item) => (
            <div className="grid gap-2">
              <div className="flex justify-between">
                <strong>{item.code}</strong>
                <Badge tone={item.status === 'ACTIVE' ? 'success' : 'warning'}>
                  {labels[item.status]}
                </Badge>
              </div>
              <span className="text-sm text-dd-muted">{item.name}</span>
              <span className="text-sm">
                {item.discountType === 'PERCENTAGE'
                  ? `${item.discountValue}%`
                  : `Rp ${item.discountValue.toLocaleString('id-ID')}`}{' '}
                · {item.branch?.name ?? 'Semua cabang'}
              </span>
              <div
                className="mt-2 flex flex-wrap gap-2 border-t border-dd-line/50 pt-2"
                onClick={(event) => event.stopPropagation()}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(event) => {
                    event.stopPropagation();
                    router.push(`/workspace/vouchers/${item.id}`);
                  }}
                >
                  Lihat detail
                </Button>
                {canManage && item.status === 'ACTIVE' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    className="text-amber-700"
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleTransition(item, 'pause');
                    }}
                  >
                    Jeda
                  </Button>
                )}
                {canManage && (item.status === 'PAUSED' || item.status === 'DRAFT') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    className="text-dd-forest"
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleTransition(item, 'activate');
                    }}
                  >
                    Aktifkan
                  </Button>
                )}
                {canManage && item.status !== 'ARCHIVED' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    className="text-dd-muted"
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleTransition(item, 'archive');
                    }}
                  >
                    Arsip
                  </Button>
                )}
              </div>
            </div>
          )}
          onRowClick={(item) => router.push(`/workspace/vouchers/${item.id}`)}
          rowDescription={(item) => `Buka detail voucher ${item.code}`}
        />
      )}
      <Pagination
        hasPrevious={cursorHistory.length > 0}
        hasNext={Boolean(nextCursor)}
        currentPage={cursorHistory.length + 1}
        onPrevious={() => {
          const previous = cursorHistory.at(-1);
          setCursorHistory((current) => current.slice(0, -1));
          setCursor(previous);
        }}
        onNext={() => {
          if (!nextCursor) return;
          setCursorHistory((current) => [...current, cursor]);
          setCursor(nextCursor);
        }}
      />
      <Drawer
        open={createOpen}
        title="Buat voucher"
        onClose={() => {
          setCreateDirty(false);
          setCreateOpen(false);
        }}
        busy={busy}
        dirty={createDirty}
        onDirtyClose={confirmDiscardCreate}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => void closeCreate()}
              disabled={busy}
            >
              Batal
            </Button>
            <Button
              type="submit"
              form="voucher-create-form"
              leadingIcon={<TicketPercent className="size-4" aria-hidden="true" />}
              loading={busy}
            >
              Simpan voucher
            </Button>
          </div>
        }
      >
        <form
          id="voucher-create-form"
          className="grid gap-4"
          onChange={() => setCreateDirty(true)}
          onSubmit={async (event) => {
            event.preventDefault();
            const accepted = await feedback.confirm({
              tone: 'warning',
              title: 'Buat voucher baru?',
              message:
                'Voucher disimpan sebagai draft. Cakupan cabang, class type, dan paket akan menentukan siapa yang dapat menggunakannya.',
              confirmLabel: 'Buat voucher',
            });
            if (!accepted) return;
            setBusy(true);
            try {
              await browserVoucherClient.create({
                code: form.code,
                name: form.name,
                description: form.description,
                discountType: form.discountType,
                discountValue: Number(form.discountValue),
                maxDiscountRp: form.maxDiscountRp ? Number(form.maxDiscountRp) : null,
                minimumPurchaseRp: Number(form.minimumPurchaseRp || 0),
                activeFrom: new Date(form.activeFrom).toISOString(),
                activeUntil: form.activeUntil ? new Date(form.activeUntil).toISOString() : null,
                totalUsageLimit: form.totalUsageLimit ? Number(form.totalUsageLimit) : null,
                perCustomerUsageLimit: form.perCustomerUsageLimit
                  ? Number(form.perCustomerUsageLimit)
                  : null,
                branchId: form.branchId || null,
                classTypeId: form.classTypeId || null,
                packageIds: selectedPackageIds,
                reason: form.reason,
              });
              setCreateDirty(false);
              setCreateOpen(false);
              feedback.showToast({
                tone: 'success',
                title: 'Voucher dibuat',
                message: 'Voucher disimpan sebagai draft dan belum dapat digunakan pelanggan.',
              });
              await load();
            } catch {
              setError('Voucher belum berhasil dibuat. Periksa input dan coba lagi.');
            } finally {
              setBusy(false);
            }
          }}
        >
          <TextInput
            label="Kode voucher"
            required
            value={form.code}
            onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })}
          />
          <TextInput
            label="Nama voucher"
            required
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
          <Textarea
            label="Deskripsi"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            description="Penjelasan internal yang aman dan tidak memuat data pelanggan."
          />
          <SelectInput
            label="Tipe diskon"
            value={form.discountType}
            onChange={(event) => setForm({ ...form, discountType: event.target.value })}
          >
            <option value="PERCENTAGE">Persentase</option>
            <option value="FIXED_AMOUNT">Nominal tetap</option>
          </SelectInput>
          <TextInput
            label="Nilai diskon"
            type="number"
            min={1}
            required
            value={form.discountValue}
            onChange={(event) => setForm({ ...form, discountValue: event.target.value })}
          />
          <TextInput
            label="Batas maksimum diskon"
            type="number"
            min={0}
            value={form.maxDiscountRp}
            onChange={(event) => setForm({ ...form, maxDiscountRp: event.target.value })}
            description="Opsional untuk diskon persentase."
          />
          <TextInput
            label="Minimum pembelian"
            type="number"
            min={0}
            value={form.minimumPurchaseRp}
            onChange={(event) => setForm({ ...form, minimumPurchaseRp: event.target.value })}
          />
          <TextInput
            label="Mulai aktif"
            type="datetime-local"
            required
            value={form.activeFrom}
            onChange={(event) => setForm({ ...form, activeFrom: event.target.value })}
          />
          <TextInput
            label="Berakhir"
            type="datetime-local"
            value={form.activeUntil}
            onChange={(event) => setForm({ ...form, activeUntil: event.target.value })}
            description="Kosongkan jika tidak memiliki batas akhir."
          />
          <SearchSelect
            label="Cakupan cabang"
            value={form.branchId}
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
                setForm({ ...form, branchId, classTypeId: '' });
                setSelectedPackageIds([]);
                void (branchId
                  ? browserMasterClient.listClassTypes(branchId).then(setClassTypes)
                  : Promise.resolve(setClassTypes([])));
              })();
            }}
          />
          <SearchSelect
            label="Cakupan tipe kelas"
            value={form.classTypeId}
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
                setForm({ ...form, classTypeId });
                setSelectedPackageIds([]);
              })();
            }}
            description="Opsional. Kosong berarti seluruh tipe kelas dalam cakupan."
          />
          <AsyncMultiSearchSelect
            label="Cakupan paket"
            description="Tanpa pilihan berarti voucher berlaku untuk semua paket dalam cakupan."
            placeholder="Cari dan pilih paket"
            value={selectedPackageIds}
            loadOptions={async (query, cursor) => {
              const page = await browserPackagePromotionClient.packages({
                branchId: form.branchId || undefined,
                classTypeId: form.classTypeId || undefined,
                status: 'ACTIVE',
                q: query.trim() || undefined,
                cursor,
              });
              return {
                items: page.items.map((item) => ({
                  id: item.id,
                  label: item.name,
                  description: item.branch?.name,
                })),
                nextCursor: page.page.nextCursor ?? undefined,
              };
            }}
            onChange={(ids) => setSelectedPackageIds(ids)}
          />
          <TextInput
            label="Kuota total"
            type="number"
            min={0}
            value={form.totalUsageLimit}
            onChange={(event) => setForm({ ...form, totalUsageLimit: event.target.value })}
          />
          <TextInput
            label="Batas per pelanggan"
            type="number"
            min={0}
            value={form.perCustomerUsageLimit}
            onChange={(event) => setForm({ ...form, perCustomerUsageLimit: event.target.value })}
          />
          <TextInput
            label="Alasan pembuatan"
            minLength={3}
            required
            value={form.reason}
            onChange={(event) => setForm({ ...form, reason: event.target.value })}
          />
        </form>
      </Drawer>
    </section>
  );
}
