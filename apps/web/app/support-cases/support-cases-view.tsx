'use client';
import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Button } from '../components/actions';
import { SearchSelect, SelectInput, TextInput } from '../components/forms';
import { Feedback, PageHeader, Skeleton, StatusBadge } from '../ui';
import { useSessionContext } from '../session-context';
async function api(path: string, init?: RequestInit) {
  const r = await fetch(`/api/v1${path}`, {
    credentials: 'include',
    ...init,
    headers: { 'content-type': 'application/json', ...init?.headers },
  });
  if (!r.ok) throw new Error('REQUEST_FAILED');
  return r.json();
}
export function SupportCasesView() {
  const session = useSessionContext()?.session;
  const [items, setItems] = useState<any[]>();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(
    () =>
      api('/support-cases')
        .then((x) => setItems(x.items))
        .catch(() => setError('Support case belum dapat dimuat.')),
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
          customerUserId: d.get('customerUserId'),
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
      await load();
    } catch {
      setError('Support case belum dapat dibuat. Pastikan Customer ID valid dan sesuai scope.');
    } finally {
      setBusy(false);
    }
  }
  if (!items)
    return error ? (
      <Feedback kind="error">{error}</Feedback>
    ) : (
      <Skeleton label="Memuat Customer Support" />
    );
  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Layanan customer"
        title="Customer Support"
        description="Case, catatan internal, tag, prioritas, status, assignment, dan tautan ke timeline customer. Transaksi tidak dapat diubah dari sini."
      />
      {error && <Feedback kind="error">{error}</Feedback>}
      <form
        onSubmit={create}
        className="grid gap-3 rounded-dd-lg border border-dd-line bg-white p-5 sm:grid-cols-2"
      >
        <TextInput
          label="Customer ID"
          required
          name="customerUserId"
          placeholder="ID pengguna customer"
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
        <SelectInput label="Prioritas" name="priority">
          <option value="NORMAL">NORMAL</option>
          <option value="LOW">LOW</option>
          <option value="HIGH">HIGH</option>
          <option value="URGENT">URGENT</option>
        </SelectInput>
        <TextInput
          label="Tags"
          name="tags"
          placeholder="Tag dipisahkan koma, misal: reschedule, vip"
        />
        <div className="flex items-end">
          <Button type="submit" loading={busy}>
            Buat support case
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
                  {item.priority}
                </StatusBadge>
                <StatusBadge tone={item.status === 'RESOLVED' ? 'success' : 'warning'}>
                  {item.status}
                </StatusBadge>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
