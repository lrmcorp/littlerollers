'use client';
import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Button } from '../components/actions';
import {
  AsyncSearchSelect,
  SearchSelect,
  SelectInput,
  TextInput,
  type SearchSelectOption,
} from '../components/forms';
import { Feedback, Skeleton, StatusBadge } from '../ui';
import { AdminPageHeader } from '../components/admin/admin-page-header';
import { useSessionContext } from '../session-context';
import { customerClient } from '../customers/customer-client';
import {
  supportPriorityLabel,
  supportPriorityLabels,
  supportStatusLabel,
  supportStatusLabels,
} from './support-labels';
import { Drawer } from '../components/app-feedback';
import { ADMIN_PAGE_SIZE } from '../lib/pagination';
import { supportApi as api, supportFailure } from './support-api';

type Summary = {
  total?: number;
  open?: number;
  inProgress?: number;
  waitingCustomer?: number;
  resolved?: number;
  closed?: number;
};
const statusFilters: Array<[string, string]> = [
  ['', 'Semua'],
  ...Object.entries(supportStatusLabels),
];
const statusCounts = (summary: Summary): Record<string, number | undefined> => ({
  '': summary.total,
  OPEN: summary.open,
  IN_PROGRESS: summary.inProgress,
  WAITING_CUSTOMER: summary.waitingCustomer,
  RESOLVED: summary.resolved,
  CLOSED: summary.closed,
});
async function searchCustomers(query: string, cursor?: string) {
  const result = await customerClient.list({ q: query.trim() || undefined, cursor });
  return {
    items: result.items.map((customer) => ({
      id: customer.id,
      label: customer.displayName,
      description: customer.email || customer.phoneE164 || undefined,
    })),
    nextCursor: result.page.nextCursor ?? undefined,
  };
}

export function SupportCasesView() {
  const session = useSessionContext()?.session;
  const [items, setItems] = useState<any[]>();
  const [summary, setSummary] = useState<Summary>({});
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [customer, setCustomer] = useState<SearchSelectOption>();
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [mineOnly, setMineOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  useEffect(() => {
    const timer = window.setTimeout(() => setAppliedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);
  const query = useCallback(
    (cursor?: string) => {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (priorityFilter) params.set('priority', priorityFilter);
      if (mineOnly) params.set('assignedUserId', 'me');
      if (appliedSearch) params.set('q', appliedSearch);
      params.set('limit', String(ADMIN_PAGE_SIZE));
      if (cursor) params.set('cursor', cursor);
      const text = params.toString();
      return `/support-cases${text ? `?${text}` : ''}`;
    },
    [appliedSearch, mineOnly, priorityFilter, statusFilter],
  );
  const load = useCallback(
    () =>
      api(query())
        .then((x) => {
          setItems(x.items);
          setSummary(x.summary ?? {});
          setNextCursor(x.page?.nextCursor ?? null);
          setError('');
        })
        .catch(() => setError('Kasus bantuan belum dapat dimuat.')),
    [query],
  );
  useEffect(() => void load(), [load]);
  async function loadMore() {
    if (!nextCursor) return;
    setBusy(true);
    try {
      const next = await api(query(nextCursor));
      setItems((current) => [...(current ?? []), ...next.items]);
      setNextCursor(next.page?.nextCursor ?? null);
    } catch {
      setError('Kasus berikutnya belum dapat dimuat.');
    } finally {
      setBusy(false);
    }
  }
  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget,
      d = new FormData(f);
    setBusy(true);
    try {
      await api('/support-cases', {
        method: 'POST',
        body: JSON.stringify({
          customerUserId: customer?.id ?? d.get('customerUserId'),
          branchId: d.get('branchId') || null,
          subject: d.get('subject'),
          priority: d.get('priority'),
          note: String(d.get('note') || '').trim() || undefined,
          tags: String(d.get('tags') || '')
            .split(',')
            .map((x) => x.trim())
            .filter(Boolean),
        }),
      });
      f.reset();
      setCustomer(undefined);
      await load();
    } catch (cause) {
      setError(
        supportFailure(
          cause,
          'Kasus bantuan belum dapat dibuat. Pastikan pelanggan dipilih dan sesuai cakupan Studio/Cabang Anda.',
        ),
      );
    } finally {
      setBusy(false);
    }
  }
  if (!items)
    return error ? (
      <Feedback kind="error">{error}</Feedback>
    ) : (
      <Skeleton label="Memuat Bantuan Pelanggan" />
    );
  return (
    <section className="space-y-6">
      <AdminPageHeader
        title="Bantuan Pelanggan"
        description="Case, catatan internal, tag, prioritas, status, penugasan, dan tautan ke timeline pelanggan. Transaksi tidak dapat diubah dari sini."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            + Buat kasus bantuan
          </Button>
        }
      />
      {error && <Feedback kind="error">{error}</Feedback>}

      <Drawer
        open={createOpen}
        title="Buat Kasus Bantuan"
        description="Catat permintaan bantuan, pertanyaan, atau keluhan pelanggan ke dalam tiket internal."
        busy={busy}
        onClose={() => setCreateOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              onClick={() => setCreateOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" form="create-support-case-form" loading={busy}>
              Buat kasus bantuan
            </Button>
          </div>
        }
      >
        <form
          id="create-support-case-form"
          onSubmit={async (e) => {
            await create(e);
            setCreateOpen(false);
          }}
          className="grid gap-3 sm:grid-cols-2"
        >
          <AsyncSearchSelect
            label="Pelanggan"
            required
            name="customerUserId"
            value={customer?.id ?? ''}
            selectedOption={customer}
            onChange={(_id, option) => setCustomer(option)}
            placeholder="Ketik nama, email, atau telepon pelanggan"
            searchPlaceholder="Cari pelanggan…"
            loadOptions={searchCustomers}
          />
          <TextInput
            label="Subjek Case"
            required
            name="subject"
            placeholder="Contoh: Permintaan reschedule sesi"
          />
          <SearchSelect
            label="Studio/Cabang"
            name="branchId"
            placeholder="Tanpa Studio/Cabang"
            options={(session?.branches ?? []).map((branch) => ({
              id: branch.id,
              label: branch.name,
            }))}
          />
          <SelectInput label="Prioritas" name="priority" defaultValue="NORMAL">
            {Object.entries(supportPriorityLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </SelectInput>
          <TextInput
            label="Tags"
            name="tags"
            placeholder="Tag dipisahkan koma, misal: reschedule, vip"
          />
          <TextInput
            label="Catatan awal (opsional)"
            name="note"
            maxLength={5000}
            wrapperClassName="sm:col-span-2"
            placeholder="Ringkasan permintaan pelanggan; hanya terlihat oleh staf"
          />
        </form>
      </Drawer>
      <div className="grid gap-3 rounded-dd-lg border border-dd-line bg-white p-5">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter status kasus">
          {statusFilters.map(([value, label]) => (
            <button
              key={value || 'all'}
              type="button"
              aria-pressed={statusFilter === value}
              onClick={() => setStatusFilter(value)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                statusFilter === value
                  ? 'border-dd-forest bg-dd-forest text-white'
                  : 'border-dd-line bg-white text-dd-muted hover:border-dd-forest'
              }`}
            >
              {label}
              {statusCounts(summary)[value] !== undefined && ` (${statusCounts(summary)[value]})`}
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <TextInput
            label="Cari kasus"
            value={search}
            placeholder="Subjek, nama, atau email pelanggan"
            onChange={(event) => setSearch(event.target.value)}
          />
          <SelectInput
            label="Prioritas"
            aria-label="Filter prioritas"
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
          >
            <option value="">Semua prioritas</option>
            {Object.entries(supportPriorityLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </SelectInput>
          <label className="flex items-end gap-2 pb-2 text-sm font-semibold text-dd-ink">
            <input
              type="checkbox"
              className="size-4 accent-dd-forest"
              checked={mineOnly}
              onChange={(event) => setMineOnly(event.target.checked)}
            />
            Ditugaskan ke saya
          </label>
        </div>
        {items.length === 0 && (
          <p className="text-sm text-dd-muted">Tidak ada kasus yang cocok dengan filter ini.</p>
        )}
        <ul className="divide-y divide-dd-line">
          {items.map((item) => (
            <li key={item.id} className="flex flex-wrap justify-between gap-3 py-4">
              <div>
                <Link
                  href={`/support-cases/${item.id}`}
                  className="font-semibold text-dd-forest hover:underline"
                >
                  {item.subject}
                </Link>
                <p className="text-sm">
                  Pelanggan:{' '}
                  <Link
                    href={`/customers/${item.customer.id}`}
                    className="text-dd-forest hover:underline"
                  >
                    {item.customer.displayName}
                  </Link>
                </p>
                <p className="text-xs text-dd-muted">
                  {item.branch?.name ?? 'Global'} · {item._count?.notes ?? 0} catatan internal
                  {item.assignedUser ? ` · Ditangani ${item.assignedUser.displayName}` : ''}
                </p>
                {item.tags?.length > 0 && (
                  <p className="mt-1 text-xs text-dd-muted">#{item.tags.join(' #')}</p>
                )}
              </div>
              <div className="flex gap-2">
                <StatusBadge tone={item.priority === 'URGENT' ? 'danger' : 'neutral'}>
                  {supportPriorityLabel(item.priority)}
                </StatusBadge>
                <StatusBadge
                  tone={
                    item.status === 'RESOLVED' || item.status === 'CLOSED' ? 'success' : 'warning'
                  }
                >
                  {supportStatusLabel(item.status)}
                </StatusBadge>
              </div>
            </li>
          ))}
        </ul>
        {nextCursor && (
          <div>
            <Button variant="secondary" loading={busy} onClick={() => void loadMore()}>
              Muat kasus berikutnya
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
