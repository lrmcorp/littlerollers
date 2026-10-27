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
import { AdminPageHeader } from '../components/admin/admin-page-header';
import { AdminEmptyState, Panel } from '../components/admin/admin-ui';
import { Button } from '../components/actions';
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
    <section className="space-y-5" aria-labelledby="fast-review-title">
      <AdminPageHeader
        title="Mode cepat verifikasi identitas"
        titleId="fast-review-title"
        description="Satu berkas satu layar. Keputusan dikirim 10 detik setelah ditekan; sebelum itu masih bisa dibatalkan."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href="/identity-verifications" className="inline-flex items-center gap-1.5 text-sm font-semibold text-dd-forest">
              <ArrowLeft className="size-4" aria-hidden="true" /> Kembali ke daftar
            </Link>
            <Button
              variant="secondary"
              leadingIcon={<RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />}
              disabled={loading}
              onClick={() => void load()}
            >
              Muat ulang
            </Button>
          </div>
        }
      />

      {error && <AlertBanner tone="danger" title={error.title} message={error.message} />}
      {!canDecide && (
        <AlertBanner tone="info" title="Mode hanya baca" message="Keputusan dilakukan petugas yang berwenang menyetujui identitas." />
      )}

      <p className="text-sm font-semibold text-dd-ink" aria-live="polite">
        Sisa antrean: {remaining} berkas
        {revisit.length > 0 && ` · ${revisit.length} perlu dilihat ulang`}
      </p>

      {delayed.pending && (
        <div role="status" className="space-y-2 rounded-dd-md border border-dd-forest bg-dd-forest/5 p-3 text-sm text-dd-ink">
          <p>
            <strong>{delayed.pending.label}</strong> akan dikirim dalam {delayed.pending.secondsLeft} detik. Setelah
            terkirim, keputusan tidak bisa dibatalkan.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" leadingIcon={<Undo2 className="size-4" aria-hidden="true" />} onClick={undo}>
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
        <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Panel className="p-5">
            <h2 className="text-lg font-semibold text-dd-ink">{kindLabel(current.document.kind)}</h2>
            {previews[current.key] ? (
              <>
                <ProofImageViewer
                  src={previews[current.key]!}
                  alt={`${kindLabel(current.document.kind)} ${current.user.displayName}`}
                  onLoad={() => setShown((value) => ({ ...value, [current.key]: true }))}
                  onError={() => setPreviewFailed((value) => ({ ...value, [current.key]: true }))}
                />
                {previewFailed[current.key] && (
                  <p className="mt-3 text-sm font-semibold text-dd-danger" role="alert">
                    Berkas ini tidak dapat ditampilkan, jadi belum bisa disetujui. Pilih Minta foto ulang (U) atau Lewati (L).
                  </p>
                )}
              </>
            ) : previewFailed[current.key] && !previews[current.key] ? (
              <AlertBanner
                tone="warning"
                title="Berkas belum dapat dibuka"
                message="Lewati berkas ini (L) atau muat ulang halaman, lalu coba lagi."
              />
            ) : (
              <div className="mt-5 grid min-h-[420px] place-items-center rounded-dd-lg border border-dashed border-dd-line bg-dd-surface-muted">
                <Skeleton label="Memuat berkas…" />
              </div>
            )}
          </Panel>

          <Panel className="space-y-4 p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-dd-muted">Nama pada akun</p>
              <p className="mt-1 text-2xl font-bold text-dd-ink">{current.user.displayName}</p>
              {current.user.profileName && current.user.profileName !== current.user.displayName && (
                <p className="mt-2 text-sm text-dd-muted">
                  Nama yang diisi pada form: <strong className="text-dd-ink">{current.user.profileName}</strong>
                </p>
              )}
              {current.user.phoneMasked && <p className="mt-1 text-sm text-dd-muted">{current.user.phoneMasked}</p>}
            </div>
            <p className="rounded-dd-md border border-dd-line bg-dd-surface-muted p-3 text-sm text-dd-muted">
              Cocokkan nama pada berkas dengan nama di atas. Nomor identitas tidak perlu dibaca atau dicatat.
            </p>

            {chooser ? (
              <div role="group" aria-label={chooser === 'PHOTO' ? 'Alasan minta foto ulang' : 'Alasan tolak'} className="space-y-2">
                <p className="text-sm font-semibold text-dd-ink">
                  {chooser === 'PHOTO' ? 'Minta foto ulang, pilih alasan' : 'Tolak, pilih alasan'} (tekan angkanya, Esc batal)
                </p>
                {reasons.map((reason, index) => (
                  <Button
                    key={reason}
                    variant="secondary"
                    className="w-full justify-start"
                    onClick={() => chooseReason(reason)}
                  >
                    {index + 1}. {reasonLabels[reason]}
                  </Button>
                ))}
                {otherSelected && (
                  <form
                    className="space-y-2"
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
                      className="w-full rounded-dd-md border border-dd-border-interactive bg-white px-3 py-2"
                    />
                    <Button type="submit" disabled={note.trim().length < 3}>
                      Kirim alasan
                    </Button>
                  </form>
                )}
                <Button variant="ghost" onClick={() => { setChooser(null); setOtherSelected(false); }}>
                  Batal
                </Button>
              </div>
            ) : (
              <div className="grid gap-2">
                <Button disabled={!canDecide || !shown[current.key]} leadingIcon={<Check className="size-4" aria-hidden="true" />} onClick={() => decide('approve')}>
                  Setujui (S)
                </Button>
                <Button variant="secondary" disabled={!canDecide} onClick={() => setChooser('PHOTO')}>
                  Minta foto ulang (U)
                </Button>
                <Button variant="danger" disabled={!canDecide} leadingIcon={<X className="size-4" aria-hidden="true" />} onClick={() => setChooser('REJECT')}>
                  Tolak (T)
                </Button>
                <Button variant="ghost" leadingIcon={<SkipForward className="size-4" aria-hidden="true" />} onClick={skip}>
                  Lewati (L)
                </Button>
              </div>
            )}
          </Panel>
        </div>
      )}
    </section>
  );
}
