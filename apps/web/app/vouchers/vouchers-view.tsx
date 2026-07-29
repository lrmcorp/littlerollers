'use client';

import { useEffect, useState } from 'react';
import { Plus, TicketPercent } from 'lucide-react';
import { browserVoucherClient, type VoucherRecord } from '../voucher-client';
import { useSessionContext } from '../session-context';
import { Button } from '../components/actions';
import { Drawer } from '../components/admin/admin-ui';
import { TextInput, SelectInput } from '../components/forms';
import { AlertBanner } from '../components/app-feedback';
import { DataTable, Badge, Panel, StatCard } from '../components/admin/admin-ui';
import { EmptyState, Skeleton } from '../ui';
import { useTrackedRouter } from '../components/app-loading';
import { useAppFeedback } from '../components/app-feedback';
import { browserPurchaseClient, type PurchasePackage } from '../purchase-client';

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
  const [summary, setSummary] = useState<Partial<Record<VoucherRecord['status'], number>>>({});
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [packageOptions, setPackageOptions] = useState<PurchasePackage[]>([]);
  const [form, setForm] = useState({
    code: '',
    name: '',
    discountType: 'PERCENTAGE',
    discountValue: '10',
    maxDiscountRp: '',
    minimumPurchaseRp: '0',
    activeFrom: new Date().toISOString().slice(0, 16),
    activeUntil: '',
    totalUsageLimit: '',
    perCustomerUsageLimit: '',
    branchId: '',
    packageId: '',
  });
  useEffect(() => {
    if (!createOpen || !canManage) return;
    const branchIds = form.branchId
      ? [form.branchId]
      : (session?.session?.branches ?? []).map((branch) => branch.id);
    void Promise.all(branchIds.map((branchId) => browserPurchaseClient.list(branchId)))
      .then((pages) => setPackageOptions(pages.flatMap((page) => page.items)))
      .catch(() => setPackageOptions([]));
  }, [canManage, createOpen, form.branchId, session?.session?.branches]);

  const load = async (cursor?: string) => {
    if (!canRead) return;
    setBusy(true);
    setError('');
    try {
      const page = await browserVoucherClient.list({ q, status, cursor });
      setItems((current) => (cursor ? [...current, ...page.items] : page.items));
      setSummary(page.summary ?? {});
      setNextCursor(page.page.nextCursor);
    } catch {
      setError('Voucher belum dapat dimuat. Coba lagi.');
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => void load(), [canRead, q, status]);

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
            Kelola promo dengan periode, scope paket, dan kuota yang dapat diaudit.
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> Buat voucher
          </Button>
        )}
      </header>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {(['ACTIVE', 'DRAFT', 'PAUSED', 'EXHAUSTED'] as const).map((value) => (
          <button
            key={value}
            type="button"
            className="text-left"
            onClick={() => setStatus(status === value ? '' : value)}
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
          onChange={(event) => setQ(event.target.value)}
          placeholder="Kode atau nama voucher"
        />
        <SelectInput
          label="Status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
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
                  ? `${item.discountValue}%`
                  : `Rp ${item.discountValue.toLocaleString('id-ID')}`,
            },
            { id: 'scope', header: 'Scope', cell: (item) => item.branch?.name ?? 'Semua cabang' },
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
            </div>
          )}
          onRowClick={(item) => router.push(`/workspace/vouchers/${item.id}`)}
          rowDescription={(item) => `Buka detail voucher ${item.code}`}
        />
      )}
      {nextCursor && (
        <div className="flex justify-center">
          <Button variant="secondary" disabled={busy} onClick={() => void load(nextCursor)}>
            Muat voucher berikutnya
          </Button>
        </div>
      )}
      <Drawer open={createOpen} title="Buat voucher" onClose={() => setCreateOpen(false)}>
        <form
          className="grid gap-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            try {
              await browserVoucherClient.create({
                code: form.code,
                name: form.name,
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
                packageIds: form.packageId ? [form.packageId] : [],
              });
              setCreateOpen(false);
              feedback.showToast({
                tone: 'success',
                title: 'Voucher dibuat',
                message: 'Voucher disimpan sebagai draft dan belum dapat digunakan customer.',
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
          <SelectInput
            label="Scope cabang"
            value={form.branchId}
            onChange={(event) => setForm({ ...form, branchId: event.target.value })}
          >
            <option value="">Semua cabang</option>
            {(session.session?.branches ?? []).map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </SelectInput>
          <SelectInput
            label="Scope paket"
            value={form.packageId}
            onChange={(event) => setForm({ ...form, packageId: event.target.value })}
            description="Pilih satu paket atau biarkan untuk seluruh paket dalam scope."
          >
            <option value="">Semua paket</option>
            {packageOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </SelectInput>
          <TextInput
            label="Kuota total"
            type="number"
            min={0}
            value={form.totalUsageLimit}
            onChange={(event) => setForm({ ...form, totalUsageLimit: event.target.value })}
          />
          <TextInput
            label="Batas per customer"
            type="number"
            min={0}
            value={form.perCustomerUsageLimit}
            onChange={(event) => setForm({ ...form, perCustomerUsageLimit: event.target.value })}
          />
          <Button type="submit" disabled={busy}>
            <TicketPercent className="size-4" /> Simpan voucher
          </Button>
        </form>
      </Drawer>
    </section>
  );
}
