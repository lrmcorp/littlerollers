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
import { supportPriorityLabel, supportPriorityLabels, supportStatusLabel } from './support-labels';
async function api(path: string, init?: RequestInit) {
  const r = await fetch(`/api/v1${path}`, {
    credentials: 'include',
    ...init,
    headers: { 'content-type': 'application/json', ...init?.headers },
  });
  if (!r.ok) throw new Error('REQUEST_FAILED');
  return r.json();
}
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
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [customer, setCustomer] = useState<SearchSelectOption>();
  const load = useCallback(
    () =>
      api('/support-cases')
        .then((x) => setItems(x.items))
        .catch(() => setError('Kasus bantuan belum dapat dimuat.')),
    [],
  );
  useEffect(() => void load(), [load]);
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
          tags: String(d.get('tags') || '')
            .split(',')
            .map((x) => x.trim())
            .filter(Boolean),
        }),
      });
      f.reset();
      setCustomer(undefined);
      await load();
    } catch {
      setError('Kasus bantuan belum dapat dibuat. Pastikan pelanggan dipilih dan sesuai cakupan Studio/Cabang Anda.');
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
      />
      {error && <Feedback kind="error">{error}</Feedback>}
      <form
        onSubmit={create}
        className="grid gap-3 rounded-dd-lg border border-dd-line bg-white p-5 sm:grid-cols-2"
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
        <div className="flex items-end">
          <Button type="submit" loading={busy}>
            Buat kasus bantuan
          </Button>
        </div>
      </form>
      <div className="rounded-dd-lg border border-dd-line bg-white p-5">
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
                  Customer:{' '}
                  <Link
                    href={`/customers/${item.customer.id}`}
                    className="text-dd-forest hover:underline"
                  >
                    {item.customer.displayName}
                  </Link>
                </p>
                <p className="text-xs text-dd-muted">
                  {item.branch?.name ?? 'Global'} · {item._count.notes} catatan internal
                </p>
              </div>
              <div className="flex gap-2">
                <StatusBadge tone={item.priority === 'URGENT' ? 'danger' : 'neutral'}>
                  {supportPriorityLabel(item.priority)}
                </StatusBadge>
                <StatusBadge tone={item.status === 'RESOLVED' ? 'success' : 'warning'}>
                  {supportStatusLabel(item.status)}
                </StatusBadge>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
