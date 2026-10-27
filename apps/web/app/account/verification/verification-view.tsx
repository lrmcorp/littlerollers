'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  ChevronLeft,
  Eye,
  FileCheck2,
  HelpCircle,
  ImagePlus,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { useTrackedRouter } from '../../components/app-loading';
import {
  verificationClient,
  type DocumentKind,
  type VerificationDocument,
  type VerificationSummary,
} from '@/api-clients/identity-verification-client';
import { useSessionContext } from '../../session-context';
import {
  Drawer,
  messageForApiError,
  PreviewModal,
  useAppFeedback,
} from '../../components/app-feedback';
import { Button } from '../../components/actions';
import {
  clearVerificationContinuation,
  rememberVerificationContinuation,
  storedVerificationContinuation,
  verificationDocumentTarget,
} from './verification-continuation';

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

function documentDescription(document: VerificationDocument) {
  if (document.status === 'APPROVED')
    return 'Dokumen telah lolos pemeriksaan dan tidak dapat diganti.';
  if (document.status === 'REJECTED')
    return (
      reasonLabels[document.rejectionReasonCode ?? ''] ??
      'Foto perlu diperbaiki sebelum pemeriksaan dilanjutkan.'
    );
  if (document.status === 'PENDING_DELETION')
    return 'Dokumen lama sedang dihapus secara aman. Hubungi bantuan jika status tidak berubah.';
  if (document.status === 'DELETE_FAILED')
    return 'Penghapusan dokumen mengalami kendala. File tetap privat dan tim kami perlu menindaklanjuti.';
  if (document.status === 'DELETED') return 'Dokumen telah dihapus dan tidak dapat ditampilkan.';
  if (document.scanStatus === 'PENDING')
    return 'Pemeriksaan keamanan file sedang berlangsung. Unggah ulang tersedia jika tim peninjau meminta perbaikan.';
  if (['ERROR', 'REJECTED', 'INFECTED'].includes(document.scanStatus))
    return 'Pemeriksaan keamanan file memerlukan tindak lanjut tim peninjau. File tetap privat selama proses berlangsung.';
  return 'Dokumen sedang diperiksa. Unggah ulang tersedia jika tim peninjau meminta perbaikan.';
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

function InlineDocumentPreview({ document }: { document: VerificationDocument }) {
  const preview = usePrivateDocumentPreview(document.kind);

  if (['DELETED', 'PENDING_DELETION'].includes(document.status)) return null;

  return (
    <div className="mt-4 overflow-hidden rounded-dd-md border border-dd-line/80 bg-dd-surface-muted/30">
      {preview.state === 'loading' ? (
        <div className="flex h-44 items-center justify-center text-xs text-dd-muted animate-pulse">
          <span>Memuat dokumen Anda…</span>
        </div>
      ) : preview.state === 'error' ? (
        <div className="flex h-36 items-center justify-center p-3 text-center text-xs text-dd-muted">
          <span>Pratinjau privat tidak dapat dimuat otomatis.</span>
        </div>
      ) : (
        <div className="relative flex max-h-60 items-center justify-center bg-black/5 p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview.url}
            alt={`Pratinjau ${documentLabels[document.kind]}`}
            className="max-h-56 w-auto max-w-full rounded object-contain shadow-sm"
          />
        </div>
      )}
    </div>
  );
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
    <PreviewModal
      open
      title={documentLabels[document.kind]}
      description="Dokumen privat hanya dapat dibuka melalui otorisasi singkat dan sekali pakai."
      onClose={onClose}
      className="max-w-2xl"
    >
      <div className="grid min-h-64 place-items-center rounded-dd-lg bg-dd-surface-muted p-4">
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
    </PreviewModal>
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
  const feedback = useAppFeedback();
  const confirmDiscard = () =>
    feedback.confirm({
      tone: 'warning',
      title: 'Batalkan unggah ulang?',
      message: 'Foto pengganti yang telah dipilih akan dilepas.',
      confirmLabel: 'Buang foto',
    });
  const cancel = async () => {
    if (!file || (await confirmDiscard())) onClose();
  };

  useEffect(() => {
    if (!file) {
      setPreview('');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <Drawer
      open
      title={`Unggah ulang ${documentLabels[document.kind]}`}
      description="Bandingkan dokumen saat ini dengan foto pengganti sebelum mengirim."
      onClose={onClose}
      busy={state === 'uploading'}
      dirty={Boolean(file)}
      onDirtyClose={confirmDiscard}
      footer={
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={state === 'uploading'}
            onClick={() => void cancel()}
          >
            Batal
          </Button>
          <Button
            type="submit"
            form="identity-replacement-form"
            disabled={!file || state === 'success'}
            loading={state === 'uploading'}
            loadingLabel="Mengunggah…"
          >
            {state === 'success' ? 'Dokumen diterima' : 'Kirim dokumen pengganti'}
          </Button>
        </div>
      }
    >
      <div className="rounded-dd-lg bg-dd-surface-muted p-4 text-sm leading-6 text-dd-muted">
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
        id="identity-replacement-form"
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
            feedback.showToast({
              tone: 'warning',
              title: 'File belum sesuai',
              message: 'Gunakan gambar JPG, PNG, atau WebP dengan ukuran maksimal 8 MB.',
            });
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
            setMessage('Dokumen pengganti berhasil diterima. Status verifikasi telah diperbarui.');
            await onComplete();
            feedback.showToast({
              tone: 'success',
              title: 'Dokumen pengganti diterima',
              message: `${documentLabels[document.kind]} kembali masuk ke antrean pemeriksaan.`,
            });
            onClose();
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
            const mapped = messageForApiError(error);
            feedback.showAlert({
              tone: 'danger',
              title: mapped.title,
              message: mapped.message,
              correlationReference: mapped.correlationReference,
            });
          }
        }}
      >
        <label className="grid cursor-pointer place-items-center rounded-dd-lg border border-dashed border-dd-brass bg-dd-brass-soft/45 p-5 text-center focus-within:ring-2 focus-within:ring-dd-forest">
          <ImagePlus className="size-8 text-dd-forest" aria-hidden="true" />
          <span className="mt-3 font-bold text-dd-forest">
            {file ? 'Ganti foto yang dipilih' : 'Pilih foto pengganti'}
          </span>
          <span className="mt-1 text-xs text-dd-muted">
            {file ? `${(file.size / 1_000_000).toFixed(1)} MB` : 'JPG, PNG, atau WebP · maks. 8 MB'}
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
      </form>
    </Drawer>
  );
}

export function VerificationView() {
  const [summary, setSummary] = useState<VerificationSummary | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [replacement, setReplacement] = useState<VerificationDocument | null>(null);
  const [viewing, setViewing] = useState<VerificationDocument | null>(null);
  const [highlightedKind, setHighlightedKind] = useState<DocumentKind | null>(null);
  const session = useSessionContext();
  const router = useTrackedRouter();
  const feedback = useAppFeedback();
  const approvedHandled = useRef(false);
  const invalidContinuation = useRef(false);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const requestedReturnTo = query.get('returnTo');
    if (requestedReturnTo) {
      const remembered = rememberVerificationContinuation(requestedReturnTo);
      invalidContinuation.current = !remembered;
      if (!remembered)
        feedback.showToast({
          id: 'invalid-verification-continuation',
          tone: 'warning',
          title: 'Tujuan lanjutan tidak valid',
          message: 'Setelah verifikasi selesai, Anda akan diarahkan ke halaman paket.',
        });
    }
    setHighlightedKind(verificationDocumentTarget(query.get('document')));
  }, [feedback]);

  const load = async (quiet = false) => {
    if (!quiet) setState('loading');
    try {
      const next = await verificationClient.mine();
      setSummary(next);
      setState('ready');
      if (next.status === 'APPROVED' && !approvedHandled.current) {
        approvedHandled.current = true;
        const refreshed = await session?.refresh({ quiet: true });
        const continuation = storedVerificationContinuation();
        if (continuation && refreshed?.identityVerificationStatus === 'APPROVED') {
          clearVerificationContinuation();
          feedback.showToast({
            id: 'verification-approved',
            tone: 'success',
            title: 'Verifikasi selesai',
            message: 'Mengarahkan Anda kembali ke aktivitas sebelumnya.',
          });
          router.replace(continuation);
        } else if (invalidContinuation.current) {
          clearVerificationContinuation();
          router.replace('/packages');
        }
      }
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

  useEffect(() => {
    if (!highlightedKind || state !== 'ready') return;
    const card = document.getElementById(`verification-document-${highlightedKind}`);
    if (!card) return;
    card.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
    card.focus({ preventScroll: true });
    const timer = window.setTimeout(() => setHighlightedKind(null), 4_000);
    return () => window.clearTimeout(timer);
  }, [highlightedKind, state, summary]);

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
        <Button type="button" onClick={() => void load()} className="mt-5">
          Coba lagi
        </Button>
      </section>
    );

function KycSubmissionForm({ onSubmitted }: { onSubmitted: () => Promise<void> }) {
  const [nik, setNik] = useState('');
  const [address, setAddress] = useState('');
  const [ktpFile, setKtpFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const feedback = useAppFeedback();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ktpFile || !selfieFile) {
      setError('Foto KTP dan Foto Selfie wajib diunggah.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await verificationClient.submit({
        nik,
        address,
        ktp: ktpFile,
        selfie: selfieFile,
      });
      feedback.showToast({
        tone: 'success',
        title: 'Dokumen verifikasi terkirim',
        message: 'Dokumen Anda berhasil diunggah dan sedang dalam antrean pemeriksaan staf.',
      });
      await onSubmitted();
    } catch {
      setError('Gagal mengirim dokumen verifikasi. Silakan coba beberapa saat lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <section className="rounded-dd-xl border border-dd-line bg-white p-6 shadow-dd-card sm:p-8">
        <div className="flex items-start gap-3.5 border-b border-dd-line/60 pb-5">
          <Link
            href="/account"
            aria-label="Kembali ke Beranda"
            className="inline-flex size-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-dd-md border border-dd-border-interactive bg-white text-dd-forest shadow-xs transition hover:bg-dd-surface-muted focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#24483a]"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </Link>
          <div>
            <span className="text-[13px] font-bold uppercase tracking-[0.2em] text-dd-brass-dark">
              Verifikasi Identitas KTP
            </span>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-dd-ink sm:text-3xl">
              Lengkapi Dokumen Verifikasi
            </h1>
            <p className="mt-2 text-sm leading-6 text-dd-muted">
              Sesuai kebijakan keamanan studio Daily Dose, silakan siapkan 4 data berikut: 16 digit NIK, alamat lengkap sesuai KTP, foto e-KTP jelas, dan foto selfie untuk mengaktifkan pemesanan kelas.
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-dd-md bg-dd-danger-soft p-3 text-sm text-dd-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label htmlFor="nik" className="block text-xs font-semibold uppercase tracking-wider text-dd-forest">
              Nomor Induk Kependudukan (NIK)
            </label>
            <input
              id="nik"
              name="nik"
              type="text"
              inputMode="numeric"
              maxLength={16}
              value={nik}
              onChange={(e) => setNik(e.target.value.replace(/\D/g, '').slice(0, 16))}
              placeholder="Masukkan 16 digit NIK di KTP"
              required
              className="mt-1.5 w-full min-h-[44px] rounded-dd-md border border-dd-border-interactive bg-white px-3.5 py-2.5 text-sm text-dd-ink transition focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#24483a]"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-xs font-semibold uppercase tracking-wider text-dd-forest">
              Alamat Sesuai KTP
            </label>
            <textarea
              id="address"
              name="address"
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Contoh: Jl. Nama Jalan No. XX, RT/RW, Kelurahan, Kecamatan, Kota"
              required
              className="mt-1.5 w-full min-h-[44px] rounded-dd-md border border-dd-border-interactive bg-white px-3.5 py-2.5 text-sm text-dd-ink transition focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#24483a]"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-dd-lg border border-dashed border-dd-line p-4">
              <label htmlFor="ktp" className="block text-xs font-bold uppercase tracking-wider text-dd-forest">
                Unggah Foto KTP
              </label>
              <p className="mt-1 text-[13px] text-dd-muted">
                Foto e-KTP jelas, tanpa pantulan cahaya (maks. 8 MB)
              </p>
              <input
                id="ktp"
                name="ktp"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                required
                onChange={(e) => setKtpFile(e.target.files?.[0] ?? null)}
                className="mt-3 block w-full text-xs text-dd-muted file:mr-3 file:rounded-dd-sm file:border-0 file:bg-dd-surface-muted file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-dd-forest hover:file:bg-dd-forest hover:file:text-white"
              />
              {ktpFile && (
                <p className="mt-2 text-xs font-medium text-dd-forest">
                  ✓ {ktpFile.name} ({(ktpFile.size / 1_000_000).toFixed(1)} MB)
                </p>
              )}
            </div>

            <div className="rounded-dd-lg border border-dashed border-dd-line p-4">
              <label htmlFor="selfie" className="block text-xs font-bold uppercase tracking-wider text-dd-forest">
                Unggah Foto Selfie
              </label>
              <p className="mt-1 text-[13px] text-dd-muted">
                Wajah terlihat jelas dan pencahayaan terang (maks. 8 MB)
              </p>
              <input
                id="selfie"
                name="selfie"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                required
                onChange={(e) => setSelfieFile(e.target.files?.[0] ?? null)}
                className="mt-3 block w-full text-xs text-dd-muted file:mr-3 file:rounded-dd-sm file:border-0 file:bg-dd-surface-muted file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-dd-forest hover:file:bg-dd-forest hover:file:text-white"
              />
              {selfieFile && (
                <p className="mt-2 text-xs font-medium text-dd-forest">
                  ✓ {selfieFile.name} ({(selfieFile.size / 1_000_000).toFixed(1)} MB)
                </p>
              )}
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              fullWidth
              loading={loading}
              loadingLabel="Mengirim dokumen verifikasi..."
            >
              Kirim Dokumen Verifikasi
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

  if (!summary?.documents.length)
    return <KycSubmissionForm onSubmitted={load} />;

  const copy = statusCopy[summary.status];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-dd-xl border border-dd-line bg-white shadow-dd-card">
        <div className="grid gap-7 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:p-10">
          <div>
            <div className="flex items-start gap-3.5">
              <Link
                href="/account"
                aria-label="Kembali ke Beranda"
                className="inline-flex size-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-dd-md border border-dd-border-interactive bg-white text-dd-forest shadow-xs transition hover:bg-dd-surface-muted focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#24483a]"
              >
                <ChevronLeft className="size-5" aria-hidden="true" />
              </Link>
              <div>
                <span className="text-[13px] font-bold uppercase tracking-[0.2em] text-dd-brass-dark">
                  {copy.eyebrow}
                </span>
                <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-dd-ink sm:text-4xl">
                  {copy.title}
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-dd-muted sm:text-base">
                  {copy.description}
                </p>
              </div>
            </div>
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
            <span className="text-[13px] font-bold uppercase tracking-[0.18em] text-dd-muted">
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
                id={`verification-document-${document.kind}`}
                tabIndex={-1}
                className={`rounded-dd-xl border bg-white p-5 shadow-dd-card outline-none transition sm:p-6 ${
                  highlightedKind === document.kind
                    ? 'border-dd-brass ring-4 ring-dd-brass/25'
                    : 'border-dd-line'
                }`}
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
                  {documentDescription(document)}
                </p>
                <InlineDocumentPreview document={document} />
                {document.rejectionNote && document.status === 'REJECTED' && (
                  <p className="mt-3 rounded-dd-md bg-dd-warning-soft p-3 text-sm leading-6 text-dd-warning">
                    Catatan tim peninjau: {document.rejectionNote}
                  </p>
                )}
                {['PENDING', 'ACTION_REQUIRED'].includes(document.status) && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setReplacement(document)}
                    fullWidth
                    className="mt-3"
                  >
                    Ganti dokumen
                  </Button>
                )}
                {document.status === 'REJECTED' && (
                  <Button
                    type="button"
                    onClick={() => setReplacement(document)}
                    fullWidth
                    className="mt-5"
                  >
                    Unggah ulang dokumen
                  </Button>
                )}
                {document.status === 'APPROVED' && (
                  <div className="mt-3 flex items-center justify-center gap-1.5 rounded-dd-md bg-dd-surface-muted/60 py-2 px-3 text-xs text-dd-muted">
                    <LockKeyhole className="size-3.5 text-dd-forest" />
                    <span>Dokumen terverifikasi resmi &amp; terkunci</span>
                  </div>
                )}
                {['PENDING_DELETION', 'DELETE_FAILED', 'DELETED'].includes(document.status) && (
                  <Link
                    className="mt-4 inline-flex text-sm font-bold text-dd-forest"
                    href="/contact"
                  >
                    Hubungi bantuan
                  </Link>
                )}
                {!['DELETED', 'PENDING_DELETION'].includes(document.status) && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setViewing(document)}
                    fullWidth
                    leadingIcon={<Eye className="size-4" />}
                    className="mt-3"
                  >
                    Lihat dokumen
                  </Button>
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
            tim peninjau tercatat dalam audit.
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
