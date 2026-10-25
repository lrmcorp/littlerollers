'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '../components/actions';
import { Textarea, TextInput } from '../components/forms';
import { EmptyState, Feedback, Skeleton, StatusBadge } from '../ui';
import { AdminPageHeader } from '../components/admin/admin-page-header';
import { statusLabel } from '../lib/status-labels';

const MAX_BODY = 1000;
const MAX_EMAIL_SUBJECT = 200;
const MAX_EMAIL_INTRO = 800;

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
  const detail = failure?.details?.[0] as { field?: string; issue?: string } | undefined;
  const issue = detail?.issue ?? '';
  if (failure?.code === 'VALIDATION_ERROR') {
    if (detail?.field === 'subject')
      return issue === 'TOO_LONG'
        ? `Subjek email terlalu panjang (maksimal ${MAX_EMAIL_SUBJECT} karakter).`
        : 'Subjek email tidak boleh kosong.';
    if (detail?.field === 'intro')
      return issue === 'TOO_LONG'
        ? `Paragraf pembuka terlalu panjang (maksimal ${MAX_EMAIL_INTRO} karakter).`
        : 'Paragraf pembuka tidak boleh kosong.';
    if (issue.startsWith('UNKNOWN_VARIABLE'))
      return `Variabel {{${issue.split(':')[1] ?? ''}}} tidak dikenal untuk template ini. Pakai hanya variabel yang tercantum.`;
    if (issue === 'MALFORMED_PLACEHOLDER')
      return 'Ada kurung ganda {{ }} yang tidak lengkap. Tulis variabel seperti {{nama}}.';
    if (issue === 'TOO_LONG') return `Isi pesan terlalu panjang (maksimal ${MAX_BODY} karakter).`;
    if (issue === 'REQUIRED') return 'Isi pesan tidak boleh kosong.';
    return 'Isi template belum valid.';
  }
  if (failure?.status === 403) return 'Anda tidak memiliki izin mengelola template notifikasi.';
  return fallback;
}

type CatalogItem = {
  templateKey: string;
  label: string;
  description: string;
  channel?: string;
  variables?: string[];
  defaultBody?: string;
  subject?: string;
  intro?: string;
};
type TemplateItem = {
  id: string;
  templateKey: string;
  version: number;
  body: string;
  subject?: string | null;
  updatedAt: string;
};

function TemplateCard({
  entry,
  live,
  busy,
  run,
}: {
  entry: CatalogItem;
  live?: TemplateItem;
  busy: boolean;
  run(action: () => Promise<unknown>, success: string): Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState('');
  const [preview, setPreview] = useState('');
  const [previewError, setPreviewError] = useState('');

  const startEditing = () => {
    setBody(live?.body ?? entry.defaultBody ?? '');
    setPreview('');
    setPreviewError('');
    setOpen(true);
  };

  const save = () =>
    api(`/notification-management/templates/${entry.templateKey}`, {
      method: 'PUT',
      body: JSON.stringify({ body }),
    });

  const reset = () =>
    run(
      () =>
        api(`/notification-management/templates/${entry.templateKey}/reset`, {
          method: 'POST',
          body: JSON.stringify({}),
        }),
      'Template kembali memakai teks bawaan.',
    );

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
        <StatusBadge tone={live ? 'success' : 'neutral'}>
          {live ? 'Memakai teks tersimpan' : 'Memakai teks bawaan'}
        </StatusBadge>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {!open && (
          <Button size="sm" variant="secondary" disabled={busy} onClick={startEditing}>
            Ubah teks pesan
          </Button>
        )}
        {live && (
          <Button size="sm" variant="ghost" disabled={busy} onClick={() => void reset()}>
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
            {(entry.variables ?? []).map((name) => (
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
                setBody(entry.defaultBody ?? '');
                setPreview('');
              }}
            >
              Muat teks bawaan
            </Button>
            <Button
              size="sm"
              disabled={busy || body.trim().length === 0}
              onClick={() =>
                void run(save, 'Template tersimpan dan dipakai pada pengiriman berikutnya.').then(
                  (ok) => ok && setOpen(false),
                )
              }
            >
              Simpan &amp; pakai
            </Button>
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => setOpen(false)}>
              Tutup
            </Button>
          </div>
        </div>
      )}

    </li>
  );
}

function EmailTemplateCard({
  entry,
  live,
  busy,
  run,
}: {
  entry: CatalogItem;
  live?: TemplateItem;
  busy: boolean;
  run(action: () => Promise<unknown>, success: string): Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [intro, setIntro] = useState('');
  const [preview, setPreview] = useState<{ subject: string; text: string } | null>(null);
  const [previewError, setPreviewError] = useState('');

  const startEditing = () => {
    setSubject(live?.subject ?? entry.subject ?? '');
    setIntro(live?.body ?? entry.intro ?? '');
    setPreview(null);
    setPreviewError('');
    setOpen(true);
  };

  const save = () =>
    api(`/notification-management/templates/${entry.templateKey}`, {
      method: 'PUT',
      body: JSON.stringify({ body: { subject, intro } }),
    });

  const reset = () =>
    run(
      () =>
        api(`/notification-management/templates/${entry.templateKey}/reset`, {
          method: 'POST',
          body: JSON.stringify({}),
        }),
      'Template kembali memakai teks bawaan.',
    );

  const showPreview = async () => {
    setPreviewError('');
    try {
      const result = await api('/notification-management/templates/preview', {
        method: 'POST',
        body: JSON.stringify({ templateKey: entry.templateKey, body: { subject, intro } }),
      });
      setPreview({ subject: result.subject, text: result.text });
    } catch (error) {
      setPreview(null);
      setPreviewError(templateFailure(error, 'Pratinjau belum dapat dibuat.'));
    }
  };

  const complete = subject.trim().length > 0 && intro.trim().length > 0;

  return (
    <li className="rounded-dd-lg border border-dd-line bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-dd-ink">{entry.label}</h3>
          <p className="mt-0.5 text-sm text-dd-muted">{entry.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge tone="neutral">Email</StatusBadge>
          <StatusBadge tone={live ? 'success' : 'neutral'}>
            {live ? 'Memakai teks tersimpan' : 'Memakai teks bawaan'}
          </StatusBadge>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {!open && (
          <Button size="sm" variant="secondary" disabled={busy} onClick={startEditing}>
            Ubah subjek & isi
          </Button>
        )}
        {live && (
          <Button size="sm" variant="ghost" disabled={busy} onClick={() => void reset()}>
            Kembali ke teks bawaan
          </Button>
        )}
      </div>

      {open && (
        <div className="mt-4 grid gap-3 rounded-dd-md border border-dd-line bg-dd-surface-muted p-4">
          <TextInput
            label="Subjek email"
            value={subject}
            maxLength={MAX_EMAIL_SUBJECT}
            onChange={(event) => setSubject(event.target.value)}
            description={`${subject.length}/${MAX_EMAIL_SUBJECT} karakter.`}
          />
          <Textarea
            label="Paragraf pembuka"
            value={intro}
            rows={4}
            maxLength={MAX_EMAIL_INTRO}
            onChange={(event) => setIntro(event.target.value)}
            description={`${intro.length}/${MAX_EMAIL_INTRO} karakter. Tombol aksi dan tautannya tetap dari sistem dan tidak bisa diubah di sini.`}
          />
          {previewError && <Feedback kind="error">{previewError}</Feedback>}
          {preview && (
            <div>
              <p className="mb-1 text-xs font-semibold text-dd-muted">Pratinjau (data contoh)</p>
              <div className="rounded-dd-md border border-dd-line bg-white p-3 text-sm">
                <p className="m-0 font-semibold text-dd-ink">{preview.subject}</p>
                <p className="mt-2 whitespace-pre-wrap text-dd-ink">{preview.text}</p>
              </div>
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
                setSubject(entry.subject ?? '');
                setIntro(entry.intro ?? '');
                setPreview(null);
              }}
            >
              Muat teks bawaan
            </Button>
            <Button
              size="sm"
              disabled={busy || !complete}
              onClick={() =>
                void run(save, 'Template tersimpan dan dipakai pada pengiriman berikutnya.').then(
                  (ok) => ok && setOpen(false),
                )
              }
            >
              Simpan &amp; pakai
            </Button>
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => setOpen(false)}>
              Tutup
            </Button>
          </div>
        </div>
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
        description="Atur teks pesan pengingat WhatsApp yang dikirim ke pelanggan. Teks yang disimpan langsung dipakai pada pengiriman berikutnya; tanpa teks tersimpan, sistem memakai teks bawaan."
      />
      {error && <Feedback kind="error">{error}</Feedback>}
      {message && <Feedback kind="status">{message}</Feedback>}
      <Feedback kind="info">
        Jadwal dan pemantauan pengingat (H-7, H-3, H-1, dan ajakan perpanjang) ada di{' '}
        <Link className="font-semibold underline" href="/workspace/reminders">
          Otomasi WA
        </Link>
        . Untuk email, hanya subjek dan paragraf pembuka yang dapat diedit; tombol aksi dan tautannya
        selalu dari sistem. Status pengiriman email ada di{' '}
        <Link className="font-semibold underline" href="/operations">
          Operasional
        </Link>
        .
      </Feedback>
      {catalog.length === 0 && (
        <EmptyState
          title="Belum ada template"
          description="Belum ada jenis pesan yang dapat diatur."
        />
      )}
      <ul className="grid list-none gap-4 p-0 lg:grid-cols-2">
        {catalog.map((entry) => {
          const live = templates.find((item) => item.templateKey === entry.templateKey);
          return entry.channel === 'EMAIL' ? (
            <EmailTemplateCard key={entry.templateKey} entry={entry} live={live} busy={busy} run={run} />
          ) : (
            <TemplateCard key={entry.templateKey} entry={entry} live={live} busy={busy} run={run} />
          );
        })}
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
