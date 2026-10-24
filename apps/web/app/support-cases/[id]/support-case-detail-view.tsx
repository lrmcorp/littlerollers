'use client';

import Link from 'next/link';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Button } from '../../components/actions';
import { LifecycleDialog } from '../../components/admin/lifecycle-dialog';
import {
  AsyncSearchSelect,
  SelectInput,
  Textarea,
  TextInput,
  type SearchSelectOption,
} from '../../components/forms';
import { browserIdentityClient } from '@/api-clients/identity-client';
import { supportApi as request, supportFailure } from '../support-api';
import { EmptyState, Feedback, Skeleton, StatusBadge } from '../../ui';
import { AdminPageHeader } from '../../components/admin/admin-page-header';
import { supportPriorityLabel, supportStatusLabel } from '../support-labels';
type CaseDetail = {
  id: string;
  subject: string;
  status: string;
  priority: string;
  tags: string[];
  version: number;
  customer: { id: string; displayName: string; email: string | null; phoneE164: string | null };
  branch: { id?: string; name: string } | null;
  branchId?: string | null;
  assignedUser: { id?: string; displayName: string } | null;
  notes: Array<{
    id: string;
    body: string;
    internal: boolean;
    createdAt: string;
    author: { displayName: string };
  }>;
};
export function SupportCaseDetailView({ id }: { id: string }) {
  const [item, setItem] = useState<CaseDetail>();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const [assignee, setAssignee] = useState<SearchSelectOption>();
  const [removing, setRemoving] = useState(false);
  const [removed, setRemoved] = useState(false);
  const load = useCallback(
    () =>
      request<CaseDetail>(`/support-cases/${encodeURIComponent(id)}`)
        .then((detail) => {
          setItem(detail);
          setAssignee(
            detail.assignedUser?.id
              ? { id: detail.assignedUser.id, label: detail.assignedUser.displayName }
              : undefined,
          );
        })
        .catch(() => setError('Kasus bantuan tidak tersedia atau berada di luar cakupan Anda.')),
    [id],
  );
  const lookupStaff = useCallback(
    async (q: string) => {
      const { items } = await browserIdentityClient.lookupUsers({ q, limit: 20 });
      return items
        .filter((user) =>
          (user.metadata?.roles ?? []).some((role) => !['CUSTOMER', 'MEMBER'].includes(role)),
        )
        .map((user) => ({ id: user.id, label: user.label, description: user.description }));
    },
    [],
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
          assignedUserId: assignee?.id ?? null,
          tags: String(data.get('tags') || '')
            .split(',')
            .map((x) => x.trim())
            .filter(Boolean),
          expectedVersion: item.version,
        }),
      });
      setSuccess('Kasus bantuan diperbarui.');
      await load();
    } catch (cause) {
      setError(
        supportFailure(cause, 'Perubahan belum dapat disimpan. Muat ulang bila data telah berubah.'),
      );
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
        body: JSON.stringify({ body: String(data.get('body') ?? '').trim() }),
      });
      form.reset();
      setSuccess('Catatan internal ditambahkan dan tidak terlihat oleh pelanggan.');
      await load();
    } catch (cause) {
      setError(supportFailure(cause, 'Catatan internal belum dapat ditambahkan.'));
    } finally {
      setBusy(false);
    }
  }
  if (!item)
    return error ? (
      <Feedback kind="error">{error}</Feedback>
    ) : (
      <Skeleton label="Memuat kasus bantuan" />
    );
  if (removed)
    return (
      <EmptyState
        title="Kasus bantuan telah dihapus"
        description="Kasus ini dihapus permanen. Salinan datanya tersimpan di catatan audit."
        action={
          <Link href="/support-cases" className="font-semibold text-dd-forest hover:underline">
            Kembali ke Bantuan Pelanggan
          </Link>
        }
      />
    );
  return (
    <section className="space-y-6">
      <Link
        href="/support-cases"
        className="inline-flex items-center gap-1.5 font-semibold text-dd-forest hover:underline"
      >
        <ArrowLeft className="size-4" />
        <span>Kembali ke Bantuan Pelanggan</span>
      </Link>
      <AdminPageHeader
        title={item.subject}
        description={`${item.customer.displayName} · ${item.branch?.name ?? 'Tanpa Studio/Cabang'}`}
        actions={
          <>
            <StatusBadge tone={item.priority === 'URGENT' ? 'danger' : 'neutral'}>
              {supportPriorityLabel(item.priority)}
            </StatusBadge>
            <StatusBadge
              tone={item.status === 'RESOLVED' || item.status === 'CLOSED' ? 'success' : 'warning'}
            >
              {supportStatusLabel(item.status)}
            </StatusBadge>
            <Button
              variant="ghost"
              className="text-dd-danger hover:text-dd-danger"
              leadingIcon={<Trash2 className="size-4" aria-hidden="true" />}
              onClick={() => setRemoving(true)}
            >
              Hapus kasus
            </Button>
          </>
        }
      />
      <LifecycleDialog
        request={removing ? { kind: 'support-case', id: item.id, name: item.subject, action: 'delete' } : null}
        onClose={() => setRemoving(false)}
        onDone={() => {
          setRemoving(false);
          setRemoved(true);
        }}
      />
      {error && <Feedback kind="error">{error}</Feedback>}
      {success && <Feedback kind="status">{success}</Feedback>}
      <div className="grid gap-5 lg:grid-cols-2">
        <form
          onSubmit={update}
          className="space-y-3 rounded-dd-lg border border-dd-line bg-white p-5"
        >
          <h2 className="font-semibold text-dd-ink">Status dan penugasan</h2>
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
          <AsyncSearchSelect
            label="Staf ditugaskan"
            value={assignee?.id ?? ''}
            selectedOption={assignee}
            clearable
            placeholder="Belum ditugaskan"
            searchPlaceholder="Cari nama staf…"
            loadOptions={lookupStaff}
            onChange={(_id, option) => setAssignee(option)}
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
            Perubahan transaksi dan saldo tidak tersedia dari kasus bantuan.
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
