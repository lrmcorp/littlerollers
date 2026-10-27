'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, RefreshCw, SkipForward, Undo2, X } from 'lucide-react';
import {
  verificationClient,
  type IdentityVerificationReviewFilters,
  type IdentityVerificationReviewPage,
  type VerificationDocument,
} from '@/api-clients/identity-verification-client';
import { AdminEmptyState, Panel } from '../components/admin/admin-ui';
import { Button, ButtonLink } from '../components/actions';
import { AlertBanner, messageForApiError, useAppFeedback } from '../components/app-feedback';
import { useDelayedAction } from '../lib/use-delayed-action';
import { useSessionContext } from '../session-context';
import { Skeleton } from '../ui';
import { ProofImageViewer } from '../workspace/payments/[id]/proof-image-viewer';
import {
  buildFastItems,
  mergeFastItems,
  PHOTO_REASONS,
  REJECT_REASONS,
  type FastReviewItem,
} from './fast-review-queue';
import { kindLabel, reasonLabels, type RejectionReason } from './review-components';

function formatBirthDate(val?: string | null): string {
  if (!val) return 'Tidak dicantumkan';
  const d = new Date(val);
  return isNaN(d.getTime())
    ? val
    : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

interface FastReviewClient {
  reviewQueue(filters?: IdentityVerificationReviewFilters): Promise<IdentityVerificationReviewPage>;
  authorizeView(id: string): Promise<{ url: string; expiresAt: string }>;
  readPrivateFile(url: string): Promise<Blob>;
  decide(
    id: string,
    decision: 'approve' | 'reject',
    input: { expectedVersion: number; reasonCode?: string; note?: string },
  ): Promise<VerificationDocument & { auditReference?: string }>;
}

type Chooser = 'PHOTO' | 'REJECT' | null;

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);

/**
 * Mode cepat: satu berkas satu layar, diputuskan dari papan ketik (S setujui, U minta foto ulang, T tolak,
 * L lewati, Z batalkan). Keputusan ditahan 10 detik sebelum dikirim; berkas yang dilewati masuk daftar
 * "Perlu dilihat ulang". Tidak ada setujui banyak sekaligus.
 */
export function FastReviewView({
  client = verificationClient,
  capabilitiesOverride,
  decisionDelayMs = 10_000,
}: {
  client?: FastReviewClient;
  capabilitiesOverride?: readonly string[];
  decisionDelayMs?: number;
}) {
  const feedback = useAppFeedback();
  const session = useSessionContext();
  const capabilities = capabilitiesOverride ?? session?.session?.capabilities ?? [];
  const sessionReady = Boolean(capabilitiesOverride || session?.session);
  const canReview = sessionReady && capabilities.includes('identity-verification:read');
  const canDecide = sessionReady && capabilities.includes('identity-verification:decide');

  const delayed = useDelayedAction(decisionDelayMs);
  const [queue, setQueue] = useState<FastReviewItem[]>([]);
  const [revisit, setRevisit] = useState<FastReviewItem[]>([]);
  const [totalPending, setTotalPending] = useState(0);
  const [sent, setSent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ReturnType<typeof messageForApiError>>();
  const [chooser, setChooser] = useState<Chooser>(null);
  const [note, setNote] = useState('');
  const [otherSelected, setOtherSelected] = useState(false);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [previewFailed, setPreviewFailed] = useState<Record<string, boolean>>({});
  /** Berkas yang gambarnya benar-benar sudah tampil; persetujuan hanya boleh setelah itu. */
  const [shown, setShown] = useState<Record<string, boolean>>({});
  const previewUrls = useRef(new Set<string>());
  const requested = useRef(new Set<string>());
  const lastDecided = useRef<FastReviewItem | null>(null);

  const current = queue[0];

  const load = useCallback(async () => {
    if (!canReview) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(undefined);
    try {
      const result = await client.reviewQueue({ status: 'PENDING', limit: 20 });
      setTotalPending(result.summary?.pendingDocuments ?? 0);
      setSent(0);
      setQueue((existing) => {
        const known = [...existing, ...revisit, ...(lastDecided.current ? [lastDecided.current] : [])];
        return [...existing, ...mergeFastItems(buildFastItems(result.items), known)];
      });
    } catch (cause) {
      setError(messageForApiError(cause));
    } finally {
      setLoading(false);
    }
  }, [canReview, client, revisit]);

  useEffect(() => {
    void load();
    // Muat sekali saat dibuka; muat ulang berikutnya dipicu tombol atau antrean habis.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canReview]);

  const loadPreview = useCallback(
    async (item: FastReviewItem) => {
      if (requested.current.has(item.key)) return;
      requested.current.add(item.key);
      try {
        const authorization = await client.authorizeView(item.document.id);
        const blob = await client.readPrivateFile(authorization.url);
        const url = URL.createObjectURL(blob);
        previewUrls.current.add(url);
        setPreviews((currentPreviews) => ({ ...currentPreviews, [item.key]: url }));
      } catch {
        requested.current.delete(item.key);
        setPreviewFailed((currentFailed) => ({ ...currentFailed, [item.key]: true }));
      }
    },
    [client],
  );

  // Muat berkas yang sedang diperiksa dan yang berikutnya, supaya layar berikutnya langsung tampil.
  useEffect(() => {
    for (const item of queue.slice(0, 2)) void loadPreview(item);
  }, [queue, loadPreview]);

  useEffect(
    () => () => {
      for (const url of previewUrls.current) URL.revokeObjectURL(url);
      previewUrls.current.clear();
    },
    [],
  );

  const decide = (kind: 'approve' | 'reject', reasonCode?: RejectionReason, reasonNote?: string) => {
    const item = queue[0];
    if (!item || !canDecide) return;
    // Tidak ada persetujuan tanpa berkas yang sudah tampil di layar.
    if (kind === 'approve' && !shown[item.key]) return;
    delayed.flush(); // keputusan sebelumnya dikirim sekarang; yang baru ditahan
    lastDecided.current = item;
    setQueue((existing) => existing.slice(1));
    setChooser(null);
    setNote('');
    setOtherSelected(false);
    const label =
      kind === 'approve'
        ? `Setujui ${kindLabel(item.document.kind)} ${item.user.displayName}`
        : `Minta perbaikan ${kindLabel(item.document.kind)} ${item.user.displayName}`;
    delayed.schedule(label, async () => {
      try {
        await client.decide(item.document.id, kind, {
          expectedVersion: item.document.version,
          reasonCode,
          note: reasonNote?.trim() || undefined,
        });
        setSent((count) => count + 1);
        if (lastDecided.current?.key === item.key) lastDecided.current = null;
      } catch (cause) {
        // Gagal terkirim: berkas kembali ke depan antrean supaya tidak hilang diam-diam.
        setQueue((existing) => [item, ...existing]);
        feedback.showAlert({ tone: 'danger', ...messageForApiError(cause) });
      }
    });
  };

  const undo = () => {
    const item = lastDecided.current;
    if (!delayed.pending || !item) return;
    delayed.cancel();
    lastDecided.current = null;
    setQueue((existing) => [item, ...existing]);
  };

  const skip = () => {
    const item = queue[0];
    if (!item) return;
    setQueue((existing) => existing.slice(1));
    setRevisit((existing) => [...existing, item]);
    setChooser(null);
  };

  const reviewSkipped = () => {
    setQueue(revisit);
    setRevisit([]);
  };

  const chooseReason = (reason: RejectionReason) => {
    if (reason === 'OTHER_REQUIRES_NOTE') {
      setOtherSelected(true);
      return;
    }
    decide('reject', reason);
  };

  // Pintasan papan ketik. Memakai ref ke handler terbaru supaya listener cukup dipasang sekali.
  const handlers = useRef({ decide, undo, skip, chooseReason });
  handlers.current = { decide, undo, skip, chooseReason };
  const chooserRef = useRef<Chooser>(null);
  chooserRef.current = chooser;
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) return;
      const key = event.key.toLowerCase();
      const open = chooserRef.current;
      if (open) {
        if (key === 'escape') {
          setChooser(null);
          setOtherSelected(false);
          return;
        }
        const reasons = open === 'PHOTO' ? PHOTO_REASONS : REJECT_REASONS;
        const picked = reasons[Number(key) - 1];
        if (picked) {
          event.preventDefault();
          handlers.current.chooseReason(picked);
        }
        return;
      }
      if (key === 's') handlers.current.decide('approve');
      else if (key === 'u') setChooser('PHOTO');
      else if (key === 't') setChooser('REJECT');
      else if (key === 'l') handlers.current.skip();
      else if (key === 'z') handlers.current.undo();
      else return;
      event.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const remaining = useMemo(
    () => Math.max(queue.length + revisit.length, totalPending - sent),
    [queue.length, revisit.length, totalPending, sent],
  );

  if (!sessionReady) return <Skeleton label="Memuat izin verifikasi identitas" />;
  if (!canReview)
    return (
      <AlertBanner tone="danger" title="Akses tidak tersedia" message="Peran Anda tidak boleh memeriksa verifikasi identitas." />
    );

  const reasons = chooser === 'PHOTO' ? PHOTO_REASONS : REJECT_REASONS;

  return (
    <section className="space-y-5 font-sans text-dd-ink" aria-labelledby="fast-review-title">
      {/* Top Header Mockup 17: Verifikasi identitas & Status antrean */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-dd-line pb-4">
        <div>
          <h1
            id="fast-review-title"
            className="text-2xl font-black tracking-tight text-dd-ink sm:text-3xl"
          >
            Verifikasi identitas
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-dd-muted">
            Berkas ke {Math.min(sent + 1, totalPending || queue.length || 1)} dari {totalPending || queue.length || 1}.{' '}
            {sent === 0
              ? 'Belum ada yang diperiksa sejak antrean dibuka.'
              : `${sent} berkas diperiksa sejak antrean dibuka.`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="text-right">
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-28 sm:w-36 rounded-full bg-dd-surface-muted overflow-hidden border border-dd-line"
                aria-hidden="true"
              >
                <div
                  className="h-full bg-dd-forest transition-all"
                  style={{
                    width: `${
                      totalPending > 0
                        ? Math.min(100, Math.round(((totalPending - remaining) / totalPending) * 100))
                        : 0
                    }%`,
                  }}
                />
              </div>
              <span className="text-xs sm:text-sm font-bold text-dd-ink whitespace-nowrap" aria-live="polite">
                Sisa antrean: {remaining} berkas
              </span>
            </div>
            {revisit.length > 0 && (
              <p className="text-[11px] text-dd-muted mt-0.5">
                {revisit.length} perlu dilihat ulang
              </p>
            )}
          </div>

          <ButtonLink
            href="/identity-verifications"
            variant="secondary"
            size="sm"
            leadingIcon={<ArrowLeft className="size-4" aria-hidden="true" />}
          >
            Keluar dari mode cepat
          </ButtonLink>
          <Button
            variant="ghost"
            size="sm"
            leadingIcon={
              <RefreshCw
                className={`size-4 ${loading ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
            }
            disabled={loading}
            onClick={() => void load()}
          >
            Muat ulang
          </Button>
        </div>
      </header>

      {error && <AlertBanner tone="danger" title={error.title} message={error.message} />}
      {!canDecide && (
        <AlertBanner
          tone="info"
          title="Mode hanya baca"
          message="Keputusan dilakukan petugas yang berwenang menyetujui identitas."
        />
      )}

      {delayed.pending && (
        <div
          role="status"
          className="space-y-2 rounded-dd-md border border-dd-forest bg-dd-forest/5 p-3 text-sm text-dd-ink"
        >
          <p>
            <strong>{delayed.pending.label}</strong> akan dikirim dalam {delayed.pending.secondsLeft} detik. Setelah
            terkirim, keputusan tidak bisa dibatalkan.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              leadingIcon={<Undo2 className="size-4" aria-hidden="true" />}
              onClick={undo}
            >
              Batalkan keputusan terakhir (Z)
            </Button>
            <Button size="sm" onClick={() => delayed.flush()}>
              Kirim sekarang
            </Button>
          </div>
        </div>
      )}

      {loading && !current ? (
        <Skeleton label="Memuat berkas verifikasi" />
      ) : !current ? (
        <Panel className="space-y-4 p-6">
          <AdminEmptyState
            title={revisit.length ? 'Berkas utama selesai' : 'Antrean kosong'}
            description={
              revisit.length
                ? `${revisit.length} berkas dilewati dan masih menunggu keputusan.`
                : 'Tidak ada berkas yang menunggu pemeriksaan. Muat ulang untuk memeriksa berkas baru.'
            }
          />
          {revisit.length > 0 && (
            <Button onClick={reviewSkipped}>Periksa ulang berkas yang dilewati</Button>
          )}
        </Panel>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          {/* Panel Kiri: Foto identitas yang diunggah */}
          <Panel className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dd-line pb-3">
                <div>
                  <h2 className="text-lg font-bold text-dd-ink">Foto identitas yang diunggah</h2>
                  <p className="text-xs text-dd-muted">
                    {kindLabel(current.document.kind)} · Status scan: {current.document.scanStatus}
                  </p>
                </div>
              </div>

              {previews[current.key] ? (
                <>
                  <div className="mt-4">
                    <ProofImageViewer
                      src={previews[current.key]!}
                      alt={`${kindLabel(current.document.kind)} ${current.user.displayName}`}
                      onLoad={() => setShown((value) => ({ ...value, [current.key]: true }))}
                      onError={() => setPreviewFailed((value) => ({ ...value, [current.key]: true }))}
                    />
                    <p className="mt-2 text-center text-xs text-dd-muted">
                      Area gambar identitas, lebar minimal 600 px
                    </p>
                  </div>
                  {previewFailed[current.key] && (
                    <p className="mt-3 text-sm font-semibold text-dd-danger" role="alert">
                      Berkas ini tidak dapat ditampilkan, jadi belum bisa disetujui. Pilih Minta foto ulang (U) atau Lewati (L).
                    </p>
                  )}
                </>
              ) : previewFailed[current.key] && !previews[current.key] ? (
                <div className="mt-4">
                  <AlertBanner
                    tone="warning"
                    title="Berkas belum dapat dibuka"
                    message="Lewati berkas ini (L) atau muat ulang halaman, lalu coba lagi."
                  />
                </div>
              ) : (
                <div className="mt-5 grid min-h-[420px] place-items-center rounded-dd-lg border border-dashed border-dd-line bg-dd-surface-muted">
                  <Skeleton label="Memuat berkas…" />
                </div>
              )}
            </div>
          </Panel>

          {/* Panel Kanan: Cocokkan dua hal ini saja & Keputusan */}
          <div className="space-y-4">
            <Panel className="space-y-4 p-5 sm:p-6">
              <h2 className="text-xl font-black text-dd-ink border-b border-dd-line pb-3">
                Cocokkan dua hal ini saja
              </h2>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-dd-muted">Nama pada akun</p>
                <p className="mt-1 text-2xl font-black text-dd-ink">{current.user.displayName}</p>
                {current.user.profileName && current.user.profileName !== current.user.displayName && (
                  <p className="mt-1 text-xs text-dd-muted">
                    Nama yang diisi pada form: <strong className="text-dd-ink">{current.user.profileName}</strong>
                  </p>
                )}
                {current.user.phoneMasked && (
                  <p className="mt-0.5 text-xs text-dd-muted">{current.user.phoneMasked}</p>
                )}
              </div>

              <div className="pt-3 border-t border-dd-line">
                <p className="text-xs font-bold uppercase tracking-wider text-dd-muted">Tanggal lahir pada akun</p>
                <p className="mt-1 text-xl font-black text-dd-ink">
                  {formatBirthDate(current.user.birthDate ?? current.user.dateOfBirth)}
                </p>
              </div>

              <p className="rounded-dd-md border border-dd-line bg-dd-surface-muted p-3 text-xs sm:text-sm text-dd-muted leading-relaxed">
                Nomor identitas tidak perlu dibaca atau dicatat. Yang diperlukan hanya nama dan tanggal lahir cocok dengan foto.
              </p>
            </Panel>

            {chooser ? (
              <Panel className="p-5">
                <div
                  role="group"
                  aria-label={chooser === 'PHOTO' ? 'Alasan minta foto ulang' : 'Alasan tolak'}
                  className="space-y-2"
                >
                  <p className="text-sm font-semibold text-dd-ink">
                    {chooser === 'PHOTO' ? 'Minta foto ulang, pilih alasan' : 'Tolak, pilih alasan'} (tekan angkanya, Esc batal)
                  </p>
                  {reasons.map((reason, index) => (
                    <Button
                      key={reason}
                      variant="secondary"
                      className="w-full justify-start text-xs sm:text-sm"
                      onClick={() => chooseReason(reason)}
                    >
                      {index + 1}. {reasonLabels[reason]}
                    </Button>
                  ))}
                  {otherSelected && (
                    <form
                      className="space-y-2 pt-2"
                      onSubmit={(event) => {
                        event.preventDefault();
                        if (note.trim().length >= 3) decide('reject', 'OTHER_REQUIRES_NOTE', note);
                      }}
                    >
                      <label className="block text-sm font-semibold text-dd-ink" htmlFor="fast-review-note">
                        Jelaskan alasannya
                      </label>
                      <input
                        id="fast-review-note"
                        autoFocus
                        value={note}
                        maxLength={500}
                        onChange={(event) => setNote(event.target.value)}
                        className="w-full rounded-dd-md border border-dd-border-interactive bg-white px-3 py-2 text-sm"
                      />
                      <Button type="submit" disabled={note.trim().length < 3}>
                        Kirim alasan
                      </Button>
                    </form>
                  )}
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setChooser(null);
                      setOtherSelected(false);
                    }}
                  >
                    Batal
                  </Button>
                </div>
              </Panel>
            ) : (
              <div className="grid gap-2.5">
                {/* Tombol 1: Cocok, setujui (S) */}
                <Button
                  disabled={!canDecide || !shown[current.key]}
                  aria-label="Setujui (S)"
                  className="w-full justify-between text-sm font-bold min-h-11 shadow-sm"
                  onClick={() => decide('approve')}
                >
                  <span className="flex items-center gap-2">
                    <Check className="size-4" aria-hidden="true" />
                    <span>Cocok, setujui</span>
                  </span>
                  <kbd className="rounded bg-white/20 px-2 py-0.5 text-xs font-mono font-bold">S</kbd>
                </Button>

                {/* Tombol 2: Foto tidak terbaca, minta ulang (U) */}
                <Button
                  variant="secondary"
                  disabled={!canDecide}
                  aria-label="Minta foto ulang (U)"
                  className="w-full justify-between text-sm font-semibold min-h-11"
                  onClick={() => setChooser('PHOTO')}
                >
                  <span>Foto tidak terbaca, minta ulang</span>
                  <kbd className="rounded border border-dd-border-interactive bg-dd-surface-muted px-2 py-0.5 text-xs font-mono font-bold text-dd-ink">
                    U
                  </kbd>
                </Button>

                {/* Tombol 3: Tidak cocok, tolak (T) */}
                <Button
                  variant="danger"
                  disabled={!canDecide}
                  aria-label="Tolak (T)"
                  className="w-full justify-between text-sm font-semibold min-h-11"
                  onClick={() => setChooser('REJECT')}
                >
                  <span className="flex items-center gap-2">
                    <X className="size-4" aria-hidden="true" />
                    <span>Tidak cocok, tolak</span>
                  </span>
                  <kbd className="rounded bg-white/20 px-2 py-0.5 text-xs font-mono font-bold">T</kbd>
                </Button>

                {/* Tombol 4: Ragu, lewati dulu (L) */}
                <Button
                  variant="ghost"
                  aria-label="Lewati (L)"
                  className="w-full justify-between text-sm font-semibold min-h-11 border border-dd-line hover:bg-dd-surface-muted"
                  onClick={skip}
                >
                  <span className="flex items-center gap-2">
                    <SkipForward className="size-4" aria-hidden="true" />
                    <span>Ragu, lewati dulu</span>
                  </span>
                  <kbd className="rounded border border-dd-border-interactive bg-dd-surface-muted px-2 py-0.5 text-xs font-mono font-bold text-dd-ink">
                    L
                  </kbd>
                </Button>
              </div>
            )}

            {/* Kotak Informasi Penjelas Mockup 17 */}
            <div className="rounded-dd-lg border border-dd-line bg-dd-surface-muted p-4 text-xs sm:text-sm text-dd-muted space-y-2 leading-relaxed">
              <p>
                Setelah diputuskan, berkas berikutnya langsung muncul. Keputusan bisa dibatalkan dalam 10 detik dengan{' '}
                <kbd className="rounded border border-dd-border-interactive bg-white px-1.5 py-0.5 text-xs font-mono font-bold text-dd-ink">
                  Z
                </kbd>.
              </p>
              <p>
                Yang dilewati masuk ke daftar <strong>Perlu dilihat ulang</strong>, tidak hilang.
              </p>
              <p className="text-dd-muted text-[11px] pt-2 border-t border-dd-line">
                Tidak ada tombol setujui banyak sekaligus. Satu berkas satu keputusan, karena ini menentukan siapa yang boleh masuk studio.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
