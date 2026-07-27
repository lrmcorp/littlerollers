'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Eye,
  FileCheck2,
  HelpCircle,
  ImagePlus,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  verificationClient,
  type DocumentKind,
  type VerificationDocument,
  type VerificationSummary,
} from '../../identity-verification-client';
import { useSessionContext } from '../../session-context';

const documentLabels: Record<DocumentKind, string> = {
  SELFIE: 'Foto selfie',
  KTP_FRONT: 'Foto KTP depan',
};

const reasonLabels: Record<string, string> = {
  BLURRY: 'Foto terlalu buram',
  GLARE: 'Pantulan cahaya menutupi dokumen',
  CROPPED: 'Sebagian dokumen terpotong',
  DOCUMENT_UNREADABLE: 'Informasi pada dokumen belum terbaca jelas',
  FACE_MISMATCH: 'Foto wajah belum sesuai dengan dokumen',
  WRONG_DOCUMENT: 'Dokumen yang diunggah belum sesuai',
  OTHER_REQUIRES_NOTE: 'Dokumen perlu diperbaiki',
};

const statusCopy = {
  PENDING: {
    eyebrow: 'Sedang diperiksa',
    title: 'Dokumen Anda sudah kami terima',
    description:
      'Tim Daily Dose sedang memeriksa selfie dan KTP Anda secara privat. Anda tidak perlu mengunggah ulang selama tidak ada permintaan perbaikan.',
  },
  ACTION_REQUIRED: {
    eyebrow: 'Perlu diperbaiki',
    title: 'Satu langkah lagi untuk menyelesaikan verifikasi',
    description:
      'Periksa catatan pada dokumen di bawah, lalu unggah foto pengganti yang lebih jelas.',
  },
  APPROVED: {
    eyebrow: 'Verifikasi selesai',
    title: 'Identitas Anda telah disetujui',
    description: 'Pembelian paket dan booking kelas kini tersedia dari akun Daily Dose Anda.',
  },
} as const;

function documentStatus(document: VerificationDocument) {
  if (document.status === 'APPROVED')
    return { label: 'Disetujui', className: 'bg-dd-success-soft text-dd-success' };
  if (document.status === 'REJECTED')
    return { label: 'Perlu diunggah ulang', className: 'bg-dd-warning-soft text-dd-warning' };
  if (document.status === 'PENDING_DELETION')
    return { label: 'Sedang dihapus', className: 'bg-dd-surface-muted text-dd-muted' };
  if (document.status === 'DELETE_FAILED')
    return {
      label: 'Penghapusan perlu dicoba lagi',
      className: 'bg-dd-danger-soft text-dd-danger',
    };
  if (document.status === 'DELETED')
    return { label: 'Telah dihapus', className: 'bg-dd-surface-muted text-dd-muted' };
  return { label: 'Sedang diperiksa', className: 'bg-dd-brass-soft text-dd-forest' };
}

function usePrivateDocumentPreview(kind: DocumentKind, enabled = true) {
  const [url, setUrl] = useState('');
  const [state, setState] = useState<'loading' | 'ready' | 'error'>(enabled ? 'loading' : 'ready');
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    let objectUrl = '';
    setState('loading');
    void verificationClient
      .authorizeMine(kind)
      .then(({ url: privateUrl }) => verificationClient.readPrivateFile(privateUrl))
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
        setState('ready');
      })
      .catch(() => active && setState('error'));
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [enabled, kind]);
  return { url, state };
}

function DocumentPreviewDialog({
  document,
  onClose,
}: {
  document: VerificationDocument;
  onClose(): void;
}) {
  const preview = usePrivateDocumentPreview(document.kind);
  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-dd-sidebar/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="document-preview-title"
        className="w-full max-w-2xl rounded-dd-xl border border-dd-line bg-white p-5 shadow-dd-float"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-dd-brass-dark">
              Dokumen privat
            </p>
            <h2 id="document-preview-title" className="mt-1 text-xl font-bold">
              {documentLabels[document.kind]}
            </h2>
          </div>
          <button
            autoFocus
            type="button"
            aria-label="Tutup pratinjau dokumen"
            onClick={onClose}
            className="grid size-10 place-items-center rounded-full border border-dd-line bg-white p-0"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="mt-5 grid min-h-64 place-items-center rounded-dd-lg bg-dd-surface-muted p-4">
          {preview.state === 'loading' ? (
            <p role="status">Membuka dokumen secara aman…</p>
          ) : preview.state === 'error' ? (
            <p role="alert" className="text-dd-danger">
              Dokumen belum dapat ditampilkan. Tutup lalu coba kembali.
            </p>
          ) : (
            <img
              src={preview.url}
              alt={`Dokumen ${documentLabels[document.kind]}`}
              className="max-h-[65vh] rounded-dd-md object-contain"
            />
          )}
        </div>
        <p className="mt-3 text-xs leading-5 text-dd-muted">
          Akses ini bersifat privat, hanya sekali pakai, dan tidak disimpan oleh browser.
        </p>
      </section>
    </div>
  );
}

function ReplacementDialog({
  document,
  onClose,
  onComplete,
}: {
  document: VerificationDocument;
  onClose(): void;
  onComplete(): Promise<void>;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [state, setState] = useState<'idle' | 'uploading' | 'success' | 'error' | 'stale'>('idle');
  const [message, setMessage] = useState('');
  const currentPreview = usePrivateDocumentPreview(document.kind);

  useEffect(() => {
    if (!file) {
      setPreview('');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && state !== 'uploading') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose, state]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-dd-sidebar/60 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      onMouseDown={(event) =>
        event.target === event.currentTarget && state !== 'uploading' && onClose()
      }
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="replacement-title"
        className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-dd-xl border border-dd-line bg-white p-5 shadow-dd-float sm:rounded-dd-xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-dd-brass-dark">
              Unggah ulang
            </span>
            <h2 id="replacement-title" className="mt-2 text-xl font-bold text-dd-ink">
              {documentLabels[document.kind]}
            </h2>
          </div>
          <button
            autoFocus
            type="button"
            aria-label="Tutup panel unggah ulang"
            disabled={state === 'uploading'}
            onClick={onClose}
            className="grid size-10 min-h-0 shrink-0 place-items-center rounded-dd-md border border-dd-line bg-white p-0 text-dd-muted"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-5 rounded-dd-lg bg-dd-surface-muted p-4 text-sm leading-6 text-dd-muted">
          Pastikan gambar tajam, seluruh sisi dokumen terlihat, tidak tertutup pantulan cahaya, dan
          berformat JPG, PNG, atau WebP maksimal 8 MB.
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-dd-muted">
              Dokumen saat ini
            </p>
            <div className="grid min-h-40 place-items-center rounded-dd-lg bg-dd-surface-muted p-3">
              {currentPreview.state === 'ready' ? (
                <img
                  src={currentPreview.url}
                  alt={`Dokumen saat ini ${documentLabels[document.kind]}`}
                  className="max-h-44 rounded-dd-md object-contain"
                />
              ) : (
                <span className="text-sm text-dd-muted">
                  {currentPreview.state === 'loading' ? 'Membuka…' : 'Preview tidak tersedia'}
                </span>
              )}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-dd-muted">
              Dokumen pengganti
            </p>
            <div className="grid min-h-40 place-items-center rounded-dd-lg bg-dd-surface-muted p-3">
              {preview ? (
                <img
                  src={preview}
                  alt="Pratinjau dokumen pengganti"
                  className="max-h-44 rounded-dd-md object-contain"
                />
              ) : (
                <span className="text-sm text-dd-muted">Belum dipilih</span>
              )}
            </div>
          </div>
        </div>

        <form
          className="mt-5 grid gap-5"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!file || state === 'uploading') return;
            if (
              file.size > 8_000_000 ||
              !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
            ) {
              setState('error');
              setMessage('Pilih gambar JPG, PNG, atau WebP dengan ukuran maksimal 8 MB.');
              return;
            }
            setState('uploading');
            setMessage('Dokumen sedang diunggah dan divalidasi…');
            try {
              await verificationClient.replace(document.kind, {
                file,
                expectedVersion: document.version,
              });
              setState('success');
              setMessage(
                'Dokumen pengganti berhasil diterima. Status verifikasi telah diperbarui.',
              );
              await onComplete();
            } catch (error) {
              const status = (error as { response?: { status?: number } }).response?.status;
              setState(status === 409 ? 'stale' : 'error');
              setMessage(
                status === 409
                  ? 'Status dokumen sudah berubah. Tutup panel lalu muat ulang sebelum mencoba lagi.'
                  : status === 422
                    ? 'File tidak lolos validasi. Pastikan gambar asli, tidak rusak, dan cukup jelas.'
                    : status === 503
                      ? 'Penyimpanan privat sedang tidak tersedia. Coba kembali beberapa saat lagi.'
                      : 'Dokumen belum dapat diunggah. Periksa koneksi lalu coba kembali.',
              );
            }
          }}
        >
          <label className="grid cursor-pointer place-items-center rounded-dd-lg border border-dashed border-dd-brass bg-dd-brass-soft/45 p-5 text-center focus-within:ring-2 focus-within:ring-dd-forest">
            <ImagePlus className="size-8 text-dd-forest" aria-hidden="true" />
            <span className="mt-3 font-bold text-dd-forest">
              {file ? 'Ganti foto yang dipilih' : 'Pilih foto pengganti'}
            </span>
            <span className="mt-1 text-xs text-dd-muted">
              {file
                ? `${(file.size / 1_000_000).toFixed(1)} MB`
                : 'JPG, PNG, atau WebP · maks. 8 MB'}
            </span>
            <input
              className="sr-only"
              aria-label="Pilih foto pengganti"
              name="replacement"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={state === 'uploading'}
              onChange={(event) => {
                setFile(event.currentTarget.files?.[0] ?? null);
                setState('idle');
                setMessage('');
              }}
              required
            />
          </label>

          {message && (
            <p
              aria-live="polite"
              className={`rounded-dd-md p-3 text-sm ${state === 'success' ? 'bg-dd-success-soft text-dd-success' : state === 'uploading' ? 'bg-dd-surface-muted text-dd-muted' : 'bg-dd-danger-soft text-dd-danger'}`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={!file || state === 'uploading' || state === 'success'}
            className="min-h-12 rounded-dd-md border-0 bg-dd-forest px-5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {state === 'uploading'
              ? 'Mengunggah…'
              : state === 'success'
                ? 'Dokumen diterima'
                : 'Kirim dokumen pengganti'}
          </button>
        </form>
      </section>
    </div>
  );
}

export function VerificationView() {
  const [summary, setSummary] = useState<VerificationSummary | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [replacement, setReplacement] = useState<VerificationDocument | null>(null);
  const [viewing, setViewing] = useState<VerificationDocument | null>(null);
  const session = useSessionContext();

  const load = async (quiet = false) => {
    if (!quiet) setState('loading');
    try {
      const next = await verificationClient.mine();
      const becameApproved = summary?.status !== 'APPROVED' && next.status === 'APPROVED';
      setSummary(next);
      setState('ready');
      if (becameApproved) await session?.refresh();
    } catch {
      if (!quiet) setState('error');
    }
  };

  useEffect(() => void load(), []);
  useEffect(() => {
    if (!summary || summary.status === 'APPROVED') return;
    const timer = window.setInterval(() => void load(true), 20_000);
    return () => window.clearInterval(timer);
  }, [summary?.status]);

  const progress = useMemo(() => {
    if (summary?.status === 'APPROVED') return 3;
    if (summary) return 2;
    return 1;
  }, [summary]);

  if (state === 'loading' && !summary)
    return (
      <div aria-label="Memuat status verifikasi" className="animate-pulse space-y-5">
        <div className="h-52 rounded-dd-xl bg-dd-surface-muted" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-60 rounded-dd-xl bg-dd-surface-muted" />
          <div className="h-60 rounded-dd-xl bg-dd-surface-muted" />
        </div>
      </div>
    );

  if (state === 'error' && !summary)
    return (
      <section className="mx-auto max-w-xl rounded-dd-xl border border-dd-danger/20 bg-white p-8 text-center shadow-dd-card">
        <RefreshCw className="mx-auto size-9 text-dd-danger" />
        <h1 className="mt-4 text-2xl font-bold">Status verifikasi belum dapat dimuat</h1>
        <p className="mt-2 text-sm leading-6 text-dd-muted">
          Layanan mungkin sedang tidak tersedia atau sesi Anda telah berakhir.
        </p>
        <button
          type="button"
          onClick={() => void load()}
          className="mt-5 min-h-11 rounded-dd-md border-0 bg-dd-forest px-5 font-bold text-white"
        >
          Coba lagi
        </button>
      </section>
    );

  if (!summary?.documents.length)
    return (
      <section className="mx-auto max-w-xl rounded-dd-xl border border-dd-line bg-white p-8 text-center shadow-dd-card">
        <FileCheck2 className="mx-auto size-9 text-dd-muted" />
        <h1 className="mt-4 text-2xl font-bold">Dokumen verifikasi belum ditemukan</h1>
        <p className="mt-2 text-sm leading-6 text-dd-muted">
          Hubungi tim Daily Dose agar dokumen registrasi Anda dapat diperiksa dengan aman.
        </p>
        <Link className="mt-5 inline-flex font-bold text-dd-forest" href="/contact">
          Hubungi bantuan
        </Link>
      </section>
    );

  const copy = statusCopy[summary.status];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-dd-xl border border-dd-line bg-white shadow-dd-card">
        <div className="grid gap-7 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:p-10">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-dd-brass-dark">
              {copy.eyebrow}
            </span>
            <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-dd-ink sm:text-4xl">
              {copy.title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-dd-muted sm:text-base">
              {copy.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {summary.status === 'PENDING' && (
                <>
                  <Link
                    className="rounded-dd-md bg-dd-forest px-5 py-3 text-sm font-bold text-white no-underline"
                    href="/classes"
                  >
                    Lihat jadwal
                  </Link>
                  <Link
                    className="rounded-dd-md border border-dd-line bg-white px-5 py-3 text-sm font-bold text-dd-ink no-underline"
                    href="/account"
                  >
                    Kembali ke akun
                  </Link>
                </>
              )}
              {summary.status === 'APPROVED' && (
                <>
                  <Link
                    className="rounded-dd-md bg-dd-forest px-5 py-3 text-sm font-bold text-white no-underline"
                    href="/packages"
                  >
                    Lihat paket
                  </Link>
                  <Link
                    className="rounded-dd-md border border-dd-line bg-white px-5 py-3 text-sm font-bold text-dd-ink no-underline"
                    href="/classes"
                  >
                    Booking kelas
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="rounded-dd-lg bg-dd-sidebar p-5 text-white">
            <ShieldCheck className="size-7 text-dd-brass" />
            <h2 className="mt-4 text-base font-bold text-white">Progres verifikasi</h2>
            <ol className="mt-4 grid list-none gap-3 p-0">
              {['Dokumen diterima', 'Sedang diperiksa', 'Selesai'].map((label, index) => (
                <li className="flex items-center gap-3 text-sm" key={label}>
                  <span
                    className={`grid size-7 shrink-0 place-items-center rounded-full border ${index + 1 <= progress ? 'border-dd-brass bg-dd-brass text-dd-sidebar' : 'border-white/25 text-white/55'}`}
                  >
                    {index + 1 < progress ? <Check className="size-4" /> : index + 1}
                  </span>
                  <span
                    className={index + 1 <= progress ? 'font-semibold text-white' : 'text-white/55'}
                  >
                    {label}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section aria-labelledby="documents-title">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-dd-muted">
              Dokumen
            </span>
            <h2 id="documents-title" className="mt-1 text-xl font-bold">
              Status setiap dokumen
            </h2>
          </div>
          <span className="hidden text-xs text-dd-muted sm:block">
            Pembaruan otomatis setiap 20 detik
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {summary.documents.map((document) => {
            const status = documentStatus(document);
            return (
              <article
                className="rounded-dd-xl border border-dd-line bg-white p-5 shadow-dd-card sm:p-6"
                key={document.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-dd-lg bg-dd-surface-muted text-dd-forest">
                    <FileCheck2 className="size-5" />
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${status.className}`}>
                    {status.label}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-bold">{documentLabels[document.kind]}</h3>
                <p className="mt-2 text-sm leading-6 text-dd-muted">
                  {document.status === 'APPROVED'
                    ? 'Dokumen telah lolos pemeriksaan.'
                    : document.status === 'REJECTED'
                      ? (reasonLabels[document.rejectionReasonCode ?? ''] ??
                        'Foto perlu diperbaiki sebelum pemeriksaan dilanjutkan.')
                      : 'Dokumen tersimpan privat dan hanya dapat dilihat reviewer berwenang.'}
                </p>
                {document.rejectionNote && document.status === 'REJECTED' && (
                  <p className="mt-3 rounded-dd-md bg-dd-warning-soft p-3 text-sm leading-6 text-dd-warning">
                    Catatan reviewer: {document.rejectionNote}
                  </p>
                )}
                {document.status === 'REJECTED' && (
                  <button
                    type="button"
                    onClick={() => setReplacement(document)}
                    className="mt-5 min-h-11 w-full rounded-dd-md border-0 bg-dd-forest px-4 font-bold text-white"
                  >
                    Unggah ulang dokumen
                  </button>
                )}
                {!['DELETED', 'PENDING_DELETION'].includes(document.status) && (
                  <button
                    type="button"
                    onClick={() => setViewing(document)}
                    className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-dd-md border border-dd-line bg-white px-4 font-bold text-dd-forest"
                  >
                    <Eye className="size-4" /> Lihat dokumen
                  </button>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <aside className="grid gap-4 rounded-dd-xl border border-dd-line bg-dd-surface-muted p-5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
        <LockKeyhole className="size-6 text-dd-forest" />
        <div>
          <h2 className="text-sm font-bold">Privasi dokumen Anda</h2>
          <p className="mt-1 text-xs leading-5 text-dd-muted">
            File disimpan di penyimpanan privat, tidak menjadi aset publik, dan setiap akses
            reviewer tercatat dalam audit.
          </p>
        </div>
        <Link
          className="inline-flex items-center gap-2 text-sm font-bold text-dd-forest"
          href="/contact"
        >
          <HelpCircle className="size-4" /> Bantuan
        </Link>
      </aside>

      {replacement && (
        <ReplacementDialog
          document={replacement}
          onClose={() => setReplacement(null)}
          onComplete={async () => {
            await load(true);
            await session?.refresh();
          }}
        />
      )}
      {viewing && <DocumentPreviewDialog document={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}
