'use client';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Button } from '../components/actions';
import { SearchSelect } from '../components/forms';
import { Feedback, PageHeader, Skeleton, StatusBadge } from '../ui';
import { useSessionContext } from '../session-context';
const field = 'min-h-11 w-full rounded-dd-md border border-dd-line bg-white px-3 text-sm';
async function request(path: string, init?: RequestInit) {
  const r = await fetch(`/api/v1${path}`, {
    credentials: 'include',
    ...init,
    headers: { 'content-type': 'application/json', ...init?.headers },
  });
  if (!r.ok) throw new Error('REQUEST_FAILED');
  return r.json();
}
export function PublicContentManagementView() {
  const session = useSessionContext()?.session;
  const [items, setItems] = useState<any[]>();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(
    () =>
      request('/public-content-management')
        .then(setItems)
        .catch(() => setError('Konten publik belum dapat dimuat.')),
    [],
  );
  useEffect(() => void load(), [load]);
  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget;
    const d = new FormData(f);
    let payload;
    try {
      payload = JSON.parse(String(d.get('payload')));
    } catch {
      setError('Payload harus berupa JSON valid.');
      return;
    }
    setBusy(true);
    try {
      await request('/public-content-management', {
        method: 'POST',
        body: JSON.stringify({
          contentKey: d.get('contentKey'),
          kind: d.get('kind'),
          branchId: d.get('branchId') || null,
          payload,
        }),
      });
      f.reset();
      await load();
    } catch {
      setError('Draft belum dapat disimpan.');
    } finally {
      setBusy(false);
    }
  }
  async function transition(id: string, status: 'PUBLISHED' | 'ARCHIVED') {
    setBusy(true);
    setError('');
    try {
      await request(`/public-content-management/${id}/${status}`, { method: 'POST' });
      await load();
    } catch {
      setError('Status konten belum dapat diubah.');
    } finally {
      setBusy(false);
    }
  }
  if (!items)
    return error ? (
      <Feedback kind="error">{error}</Feedback>
    ) : (
      <Skeleton label="Memuat Public Content" />
    );
  return (
    <section className="space-y-6">
      <div className="rounded-dd-lg border border-dd-line bg-white p-6">
        <PageHeader
          eyebrow="Situs publik"
          title="Public Content Management"
          description="Landing section, banner, FAQ, kontak, dan konten Studio/Cabang menggunakan draft, versi, publish, archive, actor, dan audit."
        />
      </div>
      {error && <Feedback kind="error">{error}</Feedback>}
      <form
        onSubmit={create}
        className="grid gap-3 rounded-dd-lg border border-dd-line bg-white p-5 sm:grid-cols-2"
      >
        <input required name="contentKey" className={field} placeholder="Content key" />
        <select name="kind" className={field}>
          <option>LANDING_SECTION</option>
          <option>BANNER</option>
          <option>FAQ</option>
          <option>CONTACT</option>
          <option>BRANCH_CONTENT</option>
        </select>
        <SearchSelect
          label="Scope Studio/Cabang"
          name="branchId"
          placeholder="Global"
          options={(session?.branches ?? []).map((branch) => ({
            id: branch.id,
            label: branch.name,
          }))}
        />
        <textarea
          required
          name="payload"
          className={`${field} min-h-28`}
          defaultValue={'{"title":"","body":""}'}
        />
        <div className="sm:col-span-2">
          <Button type="submit" loading={busy}>
            Simpan draft
          </Button>
        </div>
      </form>
      <div className="rounded-dd-lg border border-dd-line bg-white p-5">
        <ul className="divide-y divide-dd-line">
          {items.map((item) => (
            <li key={item.id} className="flex flex-wrap justify-between gap-3 py-3 text-sm">
              <div>
                <strong>
                  {item.contentKey} v{item.version}
                </strong>
                <div className="text-dd-muted">
                  {item.kind} · {item.branchId ? 'Per Studio/Cabang' : 'Global'}
                </div>
                <details className="mt-2">
                  <summary className="cursor-pointer text-dd-forest">Preview aman</summary>
                  <pre className="mt-2 max-w-xl overflow-auto rounded bg-dd-surface-muted p-3 text-xs">
                    {JSON.stringify(item.payload, null, 2)}
                  </pre>
                </details>
              </div>
              <div className="flex items-start gap-2">
                <StatusBadge tone={item.status === 'PUBLISHED' ? 'success' : 'neutral'}>
                  {item.status}
                </StatusBadge>
                {item.status === 'DRAFT' && (
                  <Button
                    size="sm"
                    disabled={busy}
                    onClick={() => void transition(item.id, 'PUBLISHED')}
                  >
                    Publish
                  </Button>
                )}
                {item.status !== 'ARCHIVED' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={busy}
                    onClick={() => void transition(item.id, 'ARCHIVED')}
                  >
                    Archive
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
