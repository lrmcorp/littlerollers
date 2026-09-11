'use client';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Button } from '../components/actions';
import { SelectInput, Textarea, TextInput } from '../components/forms';
import { Feedback, PageHeader, Skeleton, StatusBadge } from '../ui';
async function api(path: string, init?: RequestInit) {
  const response = await fetch(`/api/v1${path}`, {
    credentials: 'include',
    ...init,
    headers: { 'content-type': 'application/json', ...init?.headers },
  });
  if (!response.ok) throw new Error('REQUEST_FAILED');
  return response.json();
}
export function NotificationManagementView() {
  const [data, setData] = useState<any>();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(
    () =>
      api('/notification-management')
        .then(setData)
        .catch(() => setError('Notification Management belum dapat dimuat.')),
    [],
  );
  useEffect(() => void load(), [load]);
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const value = new FormData(form);
    setBusy(true);
    try {
      await api('/notification-management/templates', {
        method: 'POST',
        body: JSON.stringify({
          templateKey: value.get('templateKey'),
          channel: value.get('channel'),
          eventType: value.get('eventType'),
          audience: {
            roles: String(value.get('audience') || '')
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean),
          },
          subject: value.get('subject'),
          title: value.get('title'),
          body: value.get('body'),
        }),
      });
      form.reset();
      await load();
    } catch {
      setError('Draft template belum dapat dibuat.');
    } finally {
      setBusy(false);
    }
  }
  async function transition(id: string, status: 'PUBLISHED' | 'ARCHIVED') {
    setBusy(true);
    setError('');
    try {
      await api(`/notification-management/templates/${id}/${status}`, { method: 'POST' });
      await load();
    } catch {
      setError('Status template belum dapat diubah.');
    } finally {
      setBusy(false);
    }
  }
  if (!data)
    return error ? (
      <Feedback kind="error">{error}</Feedback>
    ) : (
      <Skeleton label="Memuat Manajemen Notifikasi" />
    );
  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Komunikasi"
        title="Manajemen Notifikasi"
        description="Kelola template in-app dan email, event mapping, delivery, retry, serta dead-letter. WhatsApp belum menjadi channel aktif."
      />
      {error && <Feedback kind="error">{error}</Feedback>}
      <Feedback kind="info">
        WhatsApp/Meta ditunda berdasarkan keputusan produk dan tidak dikirim kepada customer.
      </Feedback>
      <form
        onSubmit={create}
        className="grid gap-3 rounded-dd-lg border border-dd-line bg-white p-5 sm:grid-cols-2"
      >
        <TextInput
          label="Template Key"
          required
          name="templateKey"
          placeholder="Contoh: BOOKING_CONFIRMED"
        />
        <SelectInput label="Channel" name="channel">
          <option value="IN_APP">In-app</option>
          <option value="EMAIL">Email</option>
        </SelectInput>
        <TextInput
          label="Event Mapping"
          required
          name="eventType"
          placeholder="Contoh: booking.created"
        />
        <TextInput
          label="Audience Role"
          name="audience"
          placeholder="Audience role, dipisahkan koma"
        />
        <TextInput
          label="Subject Email"
          name="subject"
          placeholder="Subject email (opsional jika email)"
        />
        <TextInput
          label="Judul Notifikasi"
          required
          name="title"
          placeholder="Judul notifikasi"
        />
        <Textarea
          label="Isi Template"
          required
          name="body"
          wrapperClassName="sm:col-span-2"
          placeholder="Isi template aman"
        />
        <div className="sm:col-span-2">
          <Button type="submit" loading={busy}>
            Simpan draft versi baru
          </Button>
        </div>
      </form>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-dd-lg border border-dd-line bg-white p-5">
          <h2 className="font-semibold">Template</h2>
          <ul className="mt-3 divide-y divide-dd-line">
            {data.templates.map((item: any) => (
              <li key={item.id} className="py-3 text-sm">
                <div className="flex justify-between">
                  <strong>
                    {item.templateKey} v{item.version}
                  </strong>
                  <StatusBadge tone={item.status === 'PUBLISHED' ? 'success' : 'neutral'}>
                    {item.status}
                  </StatusBadge>
                </div>
                <div className="text-dd-muted">
                  {item.channel} · {item.eventType}
                </div>
                <div className="mt-2 flex gap-2">
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
        <div className="rounded-dd-lg border border-dd-line bg-white p-5">
          <h2 className="font-semibold">Pengiriman terbaru</h2>
          <ul className="mt-3 divide-y divide-dd-line">
            {data.deliveries.map((item: any) => (
              <li key={item.id} className="py-3 text-sm">
                <strong>{item.eventType}</strong>
                <div className="text-dd-muted">
                  {item.recipientMasked} · {item.status} · percobaan {item.attemptCount}
                </div>
              </li>
            ))}
          </ul>
          <a
            href="/operations"
            className="mt-4 inline-block font-semibold text-dd-forest hover:underline"
          >
            Buka retry dan dead-letter di Operations
          </a>
        </div>
      </div>
    </section>
  );
}
