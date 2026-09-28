'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '../components/actions';
import { Textarea } from '../components/forms';
import { EmptyState, Feedback, Skeleton, StatusBadge } from '../ui';
import { AdminPageHeader } from '../components/admin/admin-page-header';
import { statusLabel } from '../lib/status-labels';

const MAX_BODY = 1000;

class TemplateApiError extends Error {
  constructor(
    readonly status: number,
    readonly code?: string,
    readonly details: Array<{ issue?: string }> = [],
  ) {
    super(code ?? `HTTP_${status}`);
  }
}

async function api(path: string, init?: RequestInit) {
  const response = await fetch(`/api/v1${path}`, {
    credentials: 'include',
    ...init,
    headers: { 'content-type': 'application/json', ...init?.headers },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      error?: { code?: string; details?: Array<{ issue?: string }> };
    };
    throw new TemplateApiError(response.status, body.error?.code, body.error?.details ?? []);
  }
  return response.json();
}

export function templateFailure(error: unknown, fallback: string) {
  const failure = error as TemplateApiError;
  const issue = failure?.details?.[0]?.issue ?? '';
  if (failure?.code === 'VALIDATION_ERROR') {
    if (issue.startsWith('UNKNOWN_VARIABLE'))
      return `Variabel {{${issue.split(':')[1] ?? ''}}} tidak dikenal untuk template ini. Pakai hanya variabel yang tercantum.`;
    if (issue === 'MALFORMED_PLACEHOLDER')
      return 'Ada kurung ganda {{ }} yang tidak lengkap. Tulis variabel seperti {{nama}}.';
    if (issue === 'TOO_LONG') return `Isi pesan terlalu panjang (maksimal ${MAX_BODY} karakter).`;
    if (issue === 'REQUIRED') return 'Isi pesan tidak boleh kosong.';
    return 'Isi template belum valid.';
  }
  if (failure?.code === 'INVALID_STATE')
    return 'Versi ini sudah tidak berstatus draf. Muat ulang halaman lalu coba lagi.';
  if (failure?.status === 403) return 'Anda tidak memiliki izin mengelola template notifikasi.';
  return fallback;
}

type CatalogItem = {
  templateKey: string;
  label: string;
  description: string;
  variables: string[];
  defaultBody: string;
};
type TemplateItem = {
  id: string;
  templateKey: string;
  version: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  body: string;
  updatedAt: string;
};

function TemplateCard({
  entry,
  versions,
  busy,
  run,
}: {
  entry: CatalogItem;
  versions: TemplateItem[];
  busy: boolean;
  run(action: () => Promise<unknown>, success: string): Promise<boolean>;
}) {
  const sorted = [...versions].sort((a, b) => b.version - a.version);
  const draft = sorted.find((item) => item.status === 'DRAFT');
  const published = sorted.find((item) => item.status === 'PUBLISHED');
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState('');
  const [preview, setPreview] = useState('');
  const [previewError, setPreviewError] = useState('');

  const startEditing = () => {
    setBody(draft?.body ?? published?.body ?? entry.defaultBody);
    setPreview('');
    setPreviewError('');
    setOpen(true);
  };

  const saveDraft = async () => {
    if (draft) {
      const result = await api(`/notification-management/templates/${draft.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ body }),
      });
      return result.id as string;
    }
    const created = await api('/notification-management/templates', {
      method: 'POST',
      body: JSON.stringify({ templateKey: entry.templateKey, body }),
    });
    return created.id as string;
  };

  const showPreview = async () => {
    setPreviewError('');
    try {
      const result = await api('/notification-management/templates/preview', {
        method: 'POST',
        body: JSON.stringify({ templateKey: entry.templateKey, body }),
      });
      setPreview(result.text);
    } catch (error) {
      setPreview('');
      setPreviewError(templateFailure(error, 'Pratinjau belum dapat dibuat.'));
    }
  };

  return (
    <li className="rounded-dd-lg border border-dd-line bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-dd-ink">{entry.label}</h3>
          <p className="mt-0.5 text-sm text-dd-muted">{entry.description}</p>
        </div>
        <StatusBadge tone={published ? 'success' : 'neutral'}>
          {published ? `Memakai versi ${published.version}` : 'Memakai teks bawaan'}
        </StatusBadge>
      </div>
      {draft && (
        <p className="mt-2 text-xs font-semibold text-dd-warning">
          Ada draf versi {draft.version} yang belum diterbitkan.
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {!open && (
          <Button size="sm" variant="secondary" disabled={busy} onClick={startEditing}>
            {draft ? 'Lanjutkan draf' : 'Ubah teks pesan'}
          </Button>
        )}
        {published && (
          <Button
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() =>
              void run(
                () => api(`/notification-management/templates/${published.id}/ARCHIVED`, { method: 'POST' }),
                'Kembali memakai teks bawaan.',
              )
            }
          >
            Kembali ke teks bawaan
          </Button>
        )}
      </div>

      {open && (
        <div className="mt-4 grid gap-3 rounded-dd-md border border-dd-line bg-dd-surface-muted p-4">
          <Textarea
            label="Isi pesan"
            value={body}
            rows={9}
            maxLength={MAX_BODY}
            onChange={(event) => setBody(event.target.value)}
            description={`${body.length}/${MAX_BODY} karakter. Gunakan *tebal* dan _miring_ gaya WhatsApp.`}
          />
          <p className="text-xs text-dd-muted">
            Variabel yang tersedia:{' '}
            {entry.variables.map((name) => (
              <code key={name} className="mr-1.5 rounded bg-white px-1.5 py-0.5 font-mono">
                {`{{${name}}}`}
              </code>
            ))}
          </p>
          {previewError && <Feedback kind="error">{previewError}</Feedback>}
          {preview && (
            <div>
              <p className="mb-1 text-xs font-semibold text-dd-muted">Pratinjau (data contoh)</p>
              <pre className="whitespace-pre-wrap rounded-dd-md border border-dd-line bg-white p-3 text-sm">
                {preview}
              </pre>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" disabled={busy} onClick={() => void showPreview()}>
              Pratinjau
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={busy}
              onClick={() => {
                setBody(entry.defaultBody);
                setPreview('');
              }}
            >
              Muat teks bawaan
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={busy || body.trim().length === 0}
              onClick={() =>
                void run(saveDraft, 'Draf template disimpan.').then((ok) => ok && setOpen(false))
              }
            >
              Simpan draf
            </Button>
            <Button
              size="sm"
              disabled={busy || body.trim().length === 0}
              onClick={() =>
                void run(async () => {
                  const id = await saveDraft();
                  await api(`/notification-management/templates/${id}/PUBLISHED`, { method: 'POST' });
                }, 'Template diterbitkan dan dipakai pada pengiriman berikutnya.').then(
                  (ok) => ok && setOpen(false),
                )
              }
            >
              Simpan &amp; terbitkan
            </Button>
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => setOpen(false)}>
              Tutup
            </Button>
          </div>
        </div>
      )}

      {sorted.length > 0 && (
        <details className="mt-3">
          <summary className="cursor-pointer text-xs font-semibold text-dd-forest">
            Riwayat versi ({sorted.length})
          </summary>
          <ul className="mt-2 divide-y divide-dd-line">
            {sorted.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                <span>
                  Versi {item.version}{' '}
                  <span className="text-xs text-dd-muted">
                    · {new Date(item.updatedAt).toLocaleString('id-ID')}
                  </span>
                </span>
                <span className="flex flex-wrap items-center gap-2">
                  <StatusBadge
                    tone={
                      item.status === 'PUBLISHED'
                        ? 'success'
                        : item.status === 'DRAFT'
                          ? 'warning'
                          : 'neutral'
                    }
                  >
                    {statusLabel(item.status)}
                  </StatusBadge>
                  {item.status === 'DRAFT' && (
                    <Button
                      size="sm"
                      disabled={busy}
                      onClick={() =>
                        void run(
                          () => api(`/notification-management/templates/${item.id}/PUBLISHED`, { method: 'POST' }),
                          'Template diterbitkan dan dipakai pada pengiriman berikutnya.',
                        )
                      }
                    >
                      Terbitkan
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={busy}
                    onClick={() =>
                      void run(
                        () => api(`/notification-management/templates/${item.id}/duplicate`, { method: 'POST' }),
                        'Draf baru dibuat dari versi tersebut.',
                      )
                    }
                  >
                    Salin jadi draf
                  </Button>
                  {item.status !== 'ARCHIVED' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busy}
                      onClick={() =>
                        void run(
                          () => api(`/notification-management/templates/${item.id}/ARCHIVED`, { method: 'POST' }),
                          'Versi diarsipkan.',
                        )
                      }
                    >
                      Arsipkan
                    </Button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </li>
  );
}

export function NotificationManagementView() {
  const [data, setData] = useState<any>();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(
    () =>
      api('/notification-management')
        .then(setData)
        .catch(() => setError('Manajemen Notifikasi belum dapat dimuat.')),
    [],
  );
  useEffect(() => void load(), [load]);

  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await action();
      setMessage(success);
      await load();
      return true;
    } catch (cause) {
      setError(templateFailure(cause, 'Perubahan template belum dapat disimpan.'));
      return false;
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

  const catalog: CatalogItem[] = data.catalog ?? [];
  const templates: TemplateItem[] = data.templates ?? [];

  return (
    <section className="space-y-6">
      <AdminPageHeader
        title="Manajemen Notifikasi"
        description="Atur teks pesan pengingat WhatsApp yang dikirim ke pelanggan. Versi yang diterbitkan langsung dipakai pada pengiriman berikutnya; tanpa versi terbit, sistem memakai teks bawaan."
      />
      {error && <Feedback kind="error">{error}</Feedback>}
      {message && <Feedback kind="status">{message}</Feedback>}
      <Feedback kind="info">
        Jadwal dan pemantauan pengingat (H-7, H-3, H-1, dan ajakan perpanjang) ada di{' '}
        <Link className="font-semibold underline" href="/workspace/reminders">
          Otomasi WA
        </Link>
        . Notifikasi email dan in-app memakai teks tetap; template email belum dapat diatur karena
        pengiriman email belum aktif.
      </Feedback>
      {catalog.length === 0 && (
        <EmptyState
          title="Belum ada template"
          description="Belum ada jenis pesan yang dapat diatur."
        />
      )}
      <ul className="grid list-none gap-4 p-0 lg:grid-cols-2">
        {catalog.map((entry) => (
          <TemplateCard
            key={entry.templateKey}
            entry={entry}
            versions={templates.filter((item) => item.templateKey === entry.templateKey)}
            busy={busy}
            run={run}
          />
        ))}
      </ul>
      <div className="rounded-dd-lg border border-dd-line bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">Pengiriman terbaru</h2>
          <span className="text-xs text-dd-muted">
            Terkirim {data.metrics?.DELIVERED ?? 0} · Gagal {data.metrics?.FAILED ?? 0}
          </span>
        </div>
        {!data.deliveries.length && (
          <div className="mt-3">
            <EmptyState
              title="Belum ada pengiriman"
              description="Pengiriman pengingat akan tercatat di sini setelah Otomasi WA berjalan."
            />
          </div>
        )}
        <ul className="mt-3 divide-y divide-dd-line">
          {data.deliveries.map((item: any) => (
            <li key={item.id} className="py-3 text-sm">
              <strong>{item.eventType}</strong>
              <div className="text-dd-muted">
                {item.recipientMasked} · {statusLabel(item.status)}
                {item.attemptCount > 1 ? ` · percobaan ${item.attemptCount}` : ''}
              </div>
            </li>
          ))}
        </ul>
        <Link
          href="/operations"
          className="mt-4 inline-block font-semibold text-dd-forest hover:underline"
        >
          Buka percobaan ulang dan antrean gagal di Operations
        </Link>
      </div>
    </section>
  );
}
