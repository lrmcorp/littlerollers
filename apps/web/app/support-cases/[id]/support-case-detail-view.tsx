'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Button } from '../../components/actions';
import { SelectInput, Textarea, TextInput } from '../../components/forms';
import { Feedback, PageHeader, Skeleton, StatusBadge } from '../../ui';
import { supportPriorityLabel, supportStatusLabel } from '../support-labels';
type CaseDetail = {
  id: string;
  subject: string;
  status: string;
  priority: string;
  tags: string[];
  version: number;
  customer: { id: string; displayName: string; email: string | null; phoneE164: string | null };
  branch: { name: string } | null;
  assignedUser: { displayName: string } | null;
  notes: Array<{
    id: string;
    body: string;
    internal: boolean;
    createdAt: string;
    author: { displayName: string };
  }>;
};
async function request(path: string, init?: RequestInit) {
  const response = await fetch(`/api/v1${path}`, {
    credentials: 'include',
    ...init,
    headers: { 'content-type': 'application/json', ...init?.headers },
  });
  if (!response.ok) throw new Error('REQUEST_FAILED');
  return response.json();
}

export function SupportCaseDetailView({ id }: { id: string }) {
  const [item, setItem] = useState<CaseDetail>();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(
    () =>
      request(`/support-cases/${encodeURIComponent(id)}`)
        .then(setItem)
        .catch(() => setError('Support case tidak tersedia atau berada di luar scope Anda.')),
    [id],
  );
  useEffect(() => void load(), [load]);
  async function update(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!item) return;
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    try {
      await request(`/support-cases/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: data.get('status'),
          priority: data.get('priority'),
          assignedUserId: data.get('assignedUserId') || null,
          tags: String(data.get('tags') || '')
            .split(',')
            .map((x) => x.trim())
            .filter(Boolean),
          expectedVersion: item.version,
        }),
      });
      setSuccess('Support case diperbarui.');
      await load();
    } catch {
      setError('Perubahan belum dapat disimpan. Muat ulang bila data telah berubah.');
    } finally {
      setBusy(false);
    }
  }
  async function note(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget,
      data = new FormData(form);
    setBusy(true);
    setError('');
    try {
      await request(`/support-cases/${id}/internal-notes`, {
        method: 'POST',
        body: JSON.stringify({ body: data.get('body') }),
      });
      form.reset();
      setSuccess('Catatan internal ditambahkan dan tidak terlihat oleh customer.');
      await load();
    } catch {
      setError('Catatan internal belum dapat ditambahkan.');
    } finally {
      setBusy(false);
    }
  }
  if (!item)
    return error ? (
      <Feedback kind="error">{error}</Feedback>
    ) : (
      <Skeleton label="Memuat support case" />
    );
  return (
    <section className="space-y-6">
      <Link href="/support-cases" className="inline-flex items-center gap-1.5 font-semibold text-dd-forest hover:underline">
        <ArrowLeft className="size-4" />
        <span>Kembali ke Customer Support</span>
      </Link>
      <div className="rounded-dd-lg border border-dd-line bg-white p-6">
        <PageHeader
          eyebrow="Customer Support"
          title={item.subject}
          description={`${item.customer.displayName} · ${item.branch?.name ?? 'Tanpa Studio/Cabang'}`}
          context={
            <>
              <StatusBadge tone={item.priority === 'URGENT' ? 'danger' : 'neutral'}>
                {supportPriorityLabel(item.priority)}
              </StatusBadge>
              <StatusBadge tone={item.status === 'RESOLVED' ? 'success' : 'warning'}>
                {supportStatusLabel(item.status)}
              </StatusBadge>
            </>
          }
        />
      </div>
      {error && <Feedback kind="error">{error}</Feedback>}
      {success && <Feedback kind="status">{success}</Feedback>}
      <div className="grid gap-5 lg:grid-cols-2">
        <form
          onSubmit={update}
          className="space-y-3 rounded-dd-lg border border-dd-line bg-white p-5"
        >
          <h2 className="font-semibold text-dd-ink">Status dan assignment</h2>
          <SelectInput label="Status Case" name="status" defaultValue={item.status}>
            {['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED'].map((x) => (
              <option key={x} value={x}>
                {supportStatusLabel(x)}
              </option>
            ))}
          </SelectInput>
          <SelectInput label="Prioritas" name="priority" defaultValue={item.priority}>
            {['LOW', 'NORMAL', 'HIGH', 'URGENT'].map((x) => (
              <option key={x} value={x}>
                {supportPriorityLabel(x)}
              </option>
            ))}
          </SelectInput>
          <TextInput
            label="Staff Ditugaskan"
            name="assignedUserId"
            placeholder="Staff ID (opsional)"
            defaultValue={item.assignedUser?.displayName ?? ''}
          />
          <TextInput
            label="Tags"
            name="tags"
            defaultValue={item.tags.join(', ')}
            placeholder="Tag dipisahkan koma, misal: voucher, follow-up"
          />
          <Button type="submit" loading={busy}>
            Simpan perubahan
          </Button>
          <p className="text-xs text-dd-muted">
            Perubahan transaksi dan saldo tidak tersedia dari support case.
          </p>
        </form>
        <form
          onSubmit={note}
          className="space-y-3 rounded-dd-lg border border-dd-line bg-white p-5"
        >
          <h2 className="font-semibold text-dd-ink">Catatan internal</h2>
          <Textarea
            label="Isi Catatan"
            required
            minLength={2}
            maxLength={5000}
            name="body"
            placeholder="Hanya terlihat oleh staf berwenang"
          />
          <Button type="submit" loading={busy}>
            Tambah catatan internal
          </Button>
        </form>
      </div>
      <div className="rounded-dd-lg border border-dd-line bg-white p-5">
        <h2 className="font-semibold">Riwayat catatan internal</h2>
        <ul className="mt-3 divide-y divide-dd-line">
          {item.notes.map((note) => (
            <li key={note.id} className="py-3 text-sm">
              <div>{note.body}</div>
              <div className="mt-1 text-xs text-dd-muted">
                {note.author.displayName} · {new Date(note.createdAt).toLocaleString('id-ID')}
              </div>
            </li>
          ))}
        </ul>
        {item.notes.length === 0 && (
          <p className="mt-3 text-sm text-dd-muted">Belum ada catatan internal.</p>
        )}
      </div>
    </section>
  );
}
