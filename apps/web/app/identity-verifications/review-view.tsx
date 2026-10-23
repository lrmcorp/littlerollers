'use client';

import { RefreshCw, Trash2, ShieldCheck, UserCheck, Search, Filter } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  verificationClient,
  type DocumentKind,
  type DocumentReviewStatus,
  type DocumentScanStatus,
  type IdentityVerificationReviewCase,
  type IdentityVerificationReviewFilters,
  type IdentityVerificationReviewSummary,
  type VerificationDocument,
} from '@/api-clients/identity-verification-client';
import { StatusBadge } from '../ui';
import { AdminPageHeader } from '../components/admin/admin-page-header';
import { useSessionContext } from '../session-context';
import { Button } from '../components/actions';
import {
  AdminPageState,
  AdminSkeleton,
  Badge,
  DataTable,
  FilterBar,
  Pagination,
  Panel,
} from '../components/admin/admin-ui';
import { DateInput, SearchInput, Textarea } from '../components/forms';
import {
  AlertBanner,
  DestructiveDialog,
  Drawer,
  messageForApiError,
  useAppFeedback,
} from '../components/app-feedback';
import {
  ageLabel,
  DecisionDialog,
  DocumentBadge,
  DocumentReviewCard,
  FilterSelect,
  kindLabel,
  type RejectionReason,
  scanLabels,
  statusLabels,
  SummaryButton,
} from './review-components';
import { ADMIN_PAGE_SIZE } from '../lib/pagination';

type ReviewClient = Pick<
  typeof verificationClient,
  'reviewQueue' | 'authorizeView' | 'readPrivateFile' | 'decide' | 'delete'
>;

const emptySummary: IdentityVerificationReviewSummary = {
  totalCustomers: 0,
  totalDocuments: 0,
  pendingDocuments: 0,
  approvedDocuments: 0,
  rejectedDocuments: 0,
  deletionIssues: 0,
};

function queryValue(name: string, fallback = '') {
  return typeof window === 'undefined'
    ? fallback
    : (new URLSearchParams(window.location.search).get(name) ?? fallback);
}

export function IdentityReviewView({
  client = verificationClient,
  capabilitiesOverride,
}: {
  client?: ReviewClient;
  capabilitiesOverride?: readonly string[];
}) {
  const feedback = useAppFeedback();
  const session = useSessionContext();
  const capabilities = capabilitiesOverride ?? session?.session?.capabilities ?? [];
  const sessionReady = Boolean(capabilitiesOverride || session?.session);
  const canReview = sessionReady && capabilities.includes('identity-verification:read');
  const canDecide = sessionReady && capabilities.includes('identity-verification:decide');
  const canDelete = sessionReady && capabilities.includes('identity-verification:delete');
  const [items, setItems] = useState<IdentityVerificationReviewCase[]>([]);
  const [summary, setSummary] = useState(emptySummary);
  const [generatedAt, setGeneratedAt] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ReturnType<typeof messageForApiError>>();
  const [draftQ, setDraftQ] = useState(() => queryValue('q'));
  const [q, setQ] = useState(() => queryValue('q'));
  const [status, setStatus] = useState(() =>
    queryValue('status', queryValue('customerUserId') ? '' : 'PENDING'),
  );
  const [kind, setKind] = useState(() => queryValue('kind'));
  const [scanStatus, setScanStatus] = useState(() => queryValue('scanStatus'));
  const [from, setFrom] = useState(() => queryValue('from'));
  const [until, setUntil] = useState(() => queryValue('until'));
  const [customerUserId] = useState(() => queryValue('customerUserId'));
  const [page, setPage] = useState(() => Math.max(1, Number(queryValue('page', '1')) || 1));
  const [cursor, setCursor] = useState<string>();
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [pageMeta, setPageMeta] = useState<{
    hasMore: boolean;
    currentPage?: number;
    totalPages?: number;
    totalCount?: number;
    nextCursor: string | null;
  }>();
  const [cursorHistory, setCursorHistory] = useState<(string | undefined)[]>([]);
  const [selected, setSelected] = useState<IdentityVerificationReviewCase>();
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [previewErrors, setPreviewErrors] = useState<
    Record<string, { title: string; message: string }>
  >({});
  const previewUrls = useRef(new Set<string>());
  const [previewLoading, setPreviewLoading] = useState<string>();
  const [decision, setDecision] = useState<{
    document: VerificationDocument;
    kind: 'approve' | 'reject';
  }>();
  const [deleteTarget, setDeleteTarget] = useState<VerificationDocument>();
  const [submitting, setSubmitting] = useState(false);
  const [staleDocumentId, setStaleDocumentId] = useState<string>();

  const resetPage = useCallback(() => {
    setPage(1);
    setCursor(undefined);
    setCursorHistory([]);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQ(draftQ.trim());
      resetPage();
    }, 300);
    return () => window.clearTimeout(timer);
  }, [draftQ, resetPage]);

  const filters = useMemo<IdentityVerificationReviewFilters>(
    () => ({
      q: q || undefined,
      status: (status || undefined) as DocumentReviewStatus | undefined,
      kind: (kind || undefined) as DocumentKind | undefined,
      scanStatus: (scanStatus || undefined) as DocumentScanStatus | undefined,
      from: from ? `${from}T00:00:00.000Z` : undefined,
      until: until ? `${until}T23:59:59.999Z` : undefined,
      cursor,
      page,
      limit: ADMIN_PAGE_SIZE,
      customerUserId: customerUserId || undefined,
    }),
    [cursor, customerUserId, from, kind, page, q, scanStatus, status, until],
  );

  const load = useCallback(async () => {
    if (!canReview) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(undefined);
    try {
      const result = await client.reviewQueue(filters);
      setItems(result.items);
      setSummary({ ...emptySummary, ...(result.summary || {}) });
      setNextCursor(result.page.nextCursor);
      setPageMeta(result.page);
      setGeneratedAt(result.generatedAt);
    } catch (cause) {
      setError(messageForApiError(cause));
    } finally {
      setLoading(false);
    }
  }, [canReview, client, filters]);

  useEffect(() => void load(), [load]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (status) params.set('status', status);
    if (kind) params.set('kind', kind);
    if (scanStatus) params.set('scanStatus', scanStatus);
    if (from) params.set('from', from);
    if (until) params.set('until', until);
    if (page > 1) params.set('page', String(page));
    if (customerUserId) params.set('customerUserId', customerUserId);
    window.history.replaceState(
      window.history.state,
      '',
      `/identity-verifications${params.size ? `?${params}` : ''}`,
    );
  }, [customerUserId, from, kind, page, q, scanStatus, status, until]);

  useEffect(
    () => () => {
      for (const url of previewUrls.current) URL.revokeObjectURL(url);
      previewUrls.current.clear();
    },
    [],
  );

  const closeDrawer = () => {
    for (const url of previewUrls.current) URL.revokeObjectURL(url);
    previewUrls.current.clear();
    setPreviews({});
    setPreviewErrors({});
    setSelected(undefined);
    setStaleDocumentId(undefined);
  };

  const loadPreview = async (document: VerificationDocument) => {
    setPreviewLoading(document.id);
    setPreviewErrors((current) => {
      const next = { ...current };
      delete next[document.id];
      return next;
    });
    try {
      const authorization = await client.authorizeView(document.id);
      const blob = await client.readPrivateFile(authorization.url);
      const url = URL.createObjectURL(blob);
      setPreviews((current) => {
        if (current[document.id]) {
          URL.revokeObjectURL(current[document.id]!);
          previewUrls.current.delete(current[document.id]!);
        }
        previewUrls.current.add(url);
        return { ...current, [document.id]: url };
      });
    } catch (cause) {
      const mapped = messageForApiError(cause);
      setPreviewErrors((current) => ({ ...current, [document.id]: mapped }));
    } finally {
      setPreviewLoading(undefined);
    }
  };

  useEffect(() => {
    if (!selected) return;
    for (const doc of selected.documents) {
      if (!['DELETED', 'PENDING_DELETION'].includes(doc.status) && !previews[doc.id]) {
        void loadPreview(doc);
      }
    }
  }, [selected?.id]);

  const updateSelectedDocument = (document: VerificationDocument) => {
    setSelected((current) =>
      current
        ? {
            ...current,
            documents: current.documents.map((item) => (item.id === document.id ? document : item)),
          }
        : current,
    );
  };

  const submitDecision = async (
    document: VerificationDocument,
    kind: 'approve' | 'reject',
    reasonCode?: RejectionReason,
    note?: string,
  ) => {
    setSubmitting(true);
    setStaleDocumentId(undefined);
    try {
      const result = await client.decide(document.id, kind, {
        expectedVersion: document.version,
        reasonCode,
        note,
      });
      updateSelectedDocument(result);
      setDecision(undefined);
      feedback.showToast({
        tone: 'success',
        title: kind === 'approve' ? 'Dokumen disetujui' : 'Perbaikan diminta',
        message: `${kindLabel(document.kind)} berhasil diperbarui.`,
        correlationReference: result.auditReference,
      });
      await load();
    } catch (cause) {
      const mapped = messageForApiError(cause);
      if ((cause as { response?: { status?: number } })?.response?.status === 409)
        setStaleDocumentId(document.id);
      feedback.showAlert({ tone: 'danger', ...mapped });
    } finally {
      setSubmitting(false);
    }
  };

  const refreshSelected = async () => {
    if (!selected) return;
    try {
      const result = await client.reviewQueue({ q: selected.user.id, limit: 1 });
      setSelected(result.items[0]);
      setStaleDocumentId(undefined);
    } catch (cause) {
      feedback.showAlert({ tone: 'danger', ...messageForApiError(cause) });
    }
  };

  const submitDeletion = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!deleteTarget) return;
    const reason = String(new FormData(event.currentTarget).get('reason') ?? '').trim();
    setSubmitting(true);
    try {
      const result = await client.delete(deleteTarget.id, {
        expectedVersion: deleteTarget.version,
        reason,
      });
      updateSelectedDocument({ ...deleteTarget, status: result.status, version: result.version });
      setDeleteTarget(undefined);
      feedback.showToast({
        tone: result.status === 'DELETE_FAILED' ? 'warning' : 'success',
        title:
          result.status === 'DELETE_FAILED' ? 'Penghapusan perlu dicoba ulang' : 'File dihapus',
        correlationReference: result.auditReference,
      });
      await load();
    } catch (cause) {
      const mapped = messageForApiError(cause);
      if ((cause as { response?: { status?: number } })?.response?.status === 409)
        setStaleDocumentId(deleteTarget.id);
      feedback.showAlert({ tone: 'danger', ...mapped });
    } finally {
      setSubmitting(false);
    }
  };

  if (!sessionReady) return <AdminSkeleton rows={5} />;
  if (!canReview) return <AdminPageState kind="forbidden" />;

  const resetFilters = () => {
    setDraftQ('');
    setQ('');
    setStatus('PENDING');
    setKind('');
    setScanStatus('');
    setFrom('');
    setUntil('');
    resetPage();
  };

  return (
    <section className="space-y-6 font-sans text-dd-ink" aria-labelledby="identity-review-title">
      <div className="space-y-4">
        <AdminPageHeader
          title="Verifikasi pelanggan"
          titleId="identity-review-title"
          description="Cari pelanggan, bandingkan selfie dan KTP, lalu ambil keputusan yang tercatat."
          badges={<StatusBadge tone="success">Hak akses terverifikasi</StatusBadge>}
          actions={
            <>
              <Button
                variant="secondary"
                disabled={loading}
                leadingIcon={
                  <RefreshCw
                    className={`size-4 ${loading ? 'animate-spin' : ''}`}
                    aria-hidden="true"
                  />
                }
                onClick={() => void load()}
              >
                Segarkan
              </Button>
            </>
          }
        />
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-dd-muted">
          <span className="font-semibold text-dd-ink">
            {(summary.totalCustomers ?? 0).toLocaleString('id-ID')} pelanggan
          </span>
          <span>•</span>
          <span className="font-semibold text-dd-ink">
            {(summary.totalDocuments ?? 0).toLocaleString('id-ID')} dokumen
          </span>
          <span>•</span>
          <span>
            Diperbarui{' '}
            {generatedAt
              ? new Date(generatedAt).toLocaleString('id-ID', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })
              : '—'}
          </span>
        </div>
      </div>

      {/* Summary KPI Filter Buttons */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <SummaryButton
          label="Pelanggan dalam antrean"
          value={summary.pendingCustomers ?? summary.pendingDocuments}
          active={status === 'PENDING'}
          onClick={() => {
            setStatus(status === 'PENDING' ? '' : 'PENDING');
            resetPage();
          }}
        />
        <SummaryButton
          label="Pelanggan disetujui"
          value={summary.approvedCustomers ?? summary.approvedDocuments}
          active={status === 'APPROVED'}
          onClick={() => {
            setStatus(status === 'APPROVED' ? '' : 'APPROVED');
            resetPage();
          }}
        />
        <SummaryButton
          label="Perlu diperbaiki"
          value={summary.rejectedDocuments}
          active={status === 'REJECTED'}
          onClick={() => {
            setStatus(status === 'REJECTED' ? '' : 'REJECTED');
            resetPage();
          }}
        />
        <SummaryButton
          label="Masalah penghapusan"
          value={summary.deletionIssues}
          active={status === 'DELETE_FAILED'}
          tone="danger"
          onClick={() => {
            setStatus(status === 'DELETE_FAILED' ? '' : 'DELETE_FAILED');
            resetPage();
          }}
        />
      </div>

      {/* Filter Bar */}
      <FilterBar>
        <SearchInput
          label="Cari pelanggan atau ID"
          value={draftQ}
          onChange={(event) => setDraftQ(event.target.value)}
          placeholder="Nama, nomor telepon, atau UUID"
          wrapperClassName="min-w-[min(100%,18rem)] flex-1"
        />
        <FilterSelect
          label="Status"
          value={status}
          onChange={(value) => {
            setStatus(value);
            resetPage();
          }}
          options={Object.entries(statusLabels)}
        />
        <FilterSelect
          label="Dokumen"
          value={kind}
          onChange={(value) => {
            setKind(value);
            resetPage();
          }}
          options={[
            ['SELFIE', 'Selfie'],
            ['KTP_FRONT', 'KTP depan'],
          ]}
        />
        <FilterSelect
          label="Status scan"
          value={scanStatus}
          onChange={(value) => {
            setScanStatus(value);
            resetPage();
          }}
          options={Object.entries(scanLabels)}
        />
        <DateInput
          label="Dari"
          value={from}
          onChange={(event) => {
            setFrom(event.target.value);
            resetPage();
          }}
          wrapperClassName="min-w-40"
        />
        <DateInput
          label="Sampai"
          value={until}
          onChange={(event) => {
            setUntil(event.target.value);
            resetPage();
          }}
          wrapperClassName="min-w-40"
        />
        <Button variant="ghost" onClick={resetFilters}>
          Reset
        </Button>
      </FilterBar>

      {error && (
        <AlertBanner
          tone="danger"
          {...error}
          action={{ label: 'Coba lagi', onSelect: () => void load() }}
        />
      )}

      {/* Data Table */}
      <DataTable<IdentityVerificationReviewCase>
        items={items}
        loading={loading}
        rowKey={(item) => item.id}
        onRowClick={(item) => setSelected(item)}
        rowNumberOffset={(page - 1) * ADMIN_PAGE_SIZE}
        showRowNumbers={true}
        emptyTitle={
          q || kind || scanStatus || from || until
            ? 'Tidak ada hasil yang sesuai'
            : 'Antrean verifikasi kosong'
        }
        emptyDescription={
          q || kind || scanStatus || from || until
            ? 'Ubah pencarian atau reset filter untuk melihat data lain.'
            : 'Tidak ada pelanggan yang perlu diperiksa pada status ini.'
        }
        columns={[
          {
            id: 'customer',
            header: 'Pelanggan',
            cell: (item) => (
              <div className="py-1">
                <strong className="font-bold text-sm text-dd-ink">{item.user.displayName}</strong>
                <p className="mt-0.5 text-xs text-dd-muted">
                  {item.user.phoneMasked ?? 'Kontak tidak tersedia'}
                </p>
              </div>
            ),
          },
          {
            id: 'selfie',
            header: 'Selfie',
            cell: (item) => (
              <DocumentBadge
                document={item.documents.find((document) => document.kind === 'SELFIE')}
              />
            ),
          },
          {
            id: 'ktp',
            header: 'KTP',
            cell: (item) => (
              <DocumentBadge
                document={item.documents.find((document) => document.kind === 'KTP_FRONT')}
              />
            ),
          },
          {
            id: 'age',
            header: 'Umur antrean',
            cell: (item) => (
              <span className="text-xs font-semibold text-dd-muted">{ageLabel(item.oldestAt)}</span>
            ),
          },
          {
            id: 'action',
            header: <span className="sr-only">Tindakan</span>,
            cell: (item) => (
              <Button
                variant="secondary"
                size="sm"
                onClick={(event) => {
                  event.stopPropagation();
                  setSelected(item);
                }}
              >
                Periksa
              </Button>
            ),
          },
        ]}
        mobileCard={(item) => (
          <div className="grid gap-3 p-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <strong className="text-sm font-bold text-dd-ink">{item.user.displayName}</strong>
                <p className="text-xs text-dd-muted">
                  {item.user.phoneMasked ?? 'Kontak tidak tersedia'}
                </p>
              </div>
              <span className="text-xs text-dd-muted">{ageLabel(item.oldestAt)}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <DocumentBadge
                document={item.documents.find((document) => document.kind === 'SELFIE')}
              />
              <DocumentBadge
                document={item.documents.find((document) => document.kind === 'KTP_FRONT')}
              />
            </div>
            <Button variant="secondary" size="sm" fullWidth onClick={() => setSelected(item)}>
              Periksa
            </Button>
          </div>
        )}
      />

      <Pagination
        hasPrevious={page > 1}
        hasNext={Boolean(pageMeta?.hasMore || nextCursor)}
        currentPage={page}
        totalPages={pageMeta?.totalPages ?? Math.max(1, Math.ceil((summary?.totalCustomers ?? 0) / ADMIN_PAGE_SIZE))}
        totalItems={summary?.totalCustomers}
        pageSize={ADMIN_PAGE_SIZE}
        onPrevious={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => p + 1)}
        onPageChange={(targetPage) => setPage(targetPage)}
      />

      {/* Review Drawer */}
      <Drawer
        open={Boolean(selected)}
        onClose={closeDrawer}
        title={selected ? `Verifikasi · ${selected.user.displayName}` : 'Verifikasi pelanggan'}
        description="Periksa kejelasan foto, bandingkan wajah dengan foto KTP, lalu tentukan keputusan verifikasi."
        className="max-w-5xl"
        footer={
          <div className="flex w-full items-center justify-between gap-3">
            <div className="text-xs text-dd-muted">
              {staleDocumentId && 'Status dokumen berubah. Klik Segarkan Data untuk memuat ulang.'}
            </div>
            <div className="flex items-center gap-2">
              {staleDocumentId && (
                <Button variant="secondary" onClick={() => void refreshSelected()}>
                  Segarkan Data
                </Button>
              )}
              <Button variant="secondary" onClick={closeDrawer}>
                Tutup
              </Button>
            </div>
          </div>
        }
      >
        {selected && (
          <div className="space-y-6">
            {staleDocumentId && (
              <AlertBanner
                tone="warning"
                title="Dokumen telah diperbarui"
                message="Dokumen telah diubah oleh reviewer lain atau diperbarui oleh pelanggan."
                action={{ label: 'Segarkan', onSelect: () => void refreshSelected() }}
              />
            )}

            <div className="rounded-dd-md border border-dd-line/80 bg-dd-surface-muted/30 p-4 text-xs leading-relaxed text-dd-muted">
              <strong className="block text-sm font-bold text-dd-ink mb-1">
                Panduan Pemeriksaan:
              </strong>
              1. Pastikan foto selfie menampilkan wajah pelanggan dengan jelas tanpa kacamata
              hitam/topi.
              <br />
              2. Pastikan KTP asli, seluruh sudut terlihat, nama &amp; NIK terbaca tajam.
              <br />
              3. Bandingkan kesesuaian wajah selfie dengan foto di KTP.
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <DocumentReviewCard
                document={selected.documents.find((doc) => doc.kind === 'SELFIE')}
                previewUrl={
                  previews[selected.documents.find((doc) => doc.kind === 'SELFIE')?.id ?? '']
                }
                previewError={
                  previewErrors[selected.documents.find((doc) => doc.kind === 'SELFIE')?.id ?? '']
                }
                previewLoading={
                  previewLoading === selected.documents.find((doc) => doc.kind === 'SELFIE')?.id
                }
                onPreview={(doc) => void loadPreview(doc)}
                onApprove={(doc) => setDecision({ document: doc, kind: 'approve' })}
                onReject={(doc) => setDecision({ document: doc, kind: 'reject' })}
                canDelete={canDelete}
                mayDecide={canDecide}
                onDelete={(doc) => setDeleteTarget(doc)}
              />
              <DocumentReviewCard
                document={selected.documents.find((doc) => doc.kind === 'KTP_FRONT')}
                previewUrl={
                  previews[selected.documents.find((doc) => doc.kind === 'KTP_FRONT')?.id ?? '']
                }
                previewError={
                  previewErrors[
                    selected.documents.find((doc) => doc.kind === 'KTP_FRONT')?.id ?? ''
                  ]
                }
                previewLoading={
                  previewLoading === selected.documents.find((doc) => doc.kind === 'KTP_FRONT')?.id
                }
                onPreview={(doc) => void loadPreview(doc)}
                onApprove={(doc) => setDecision({ document: doc, kind: 'approve' })}
                onReject={(doc) => setDecision({ document: doc, kind: 'reject' })}
                canDelete={canDelete}
                mayDecide={canDecide}
                onDelete={(doc) => setDeleteTarget(doc)}
              />
            </div>
          </div>
        )}
      </Drawer>

      {/* Decision Dialog */}
      {decision && (
        <DecisionDialog
          decision={decision}
          submitting={submitting}
          onClose={() => setDecision(undefined)}
          onSubmit={(doc, kind, reasonCode, note) => submitDecision(doc, kind, reasonCode, note)}
        />
      )}

      {/* Delete Dialog */}
      {deleteTarget && (
        <DestructiveDialog
          open
          busy={submitting}
          title={`Hapus permanen ${kindLabel(deleteTarget.kind)}?`}
          impact="File fisik akan dihapus permanen dari penyimpanan privat."
          onClose={() => setDeleteTarget(undefined)}
        >
          <form
            id="delete-document-form"
            onSubmit={(event) => void submitDeletion(event)}
            className="space-y-4"
          >
            <Textarea
              label="Alasan penghapusan (wajib audit)"
              name="reason"
              required
              minLength={5}
              placeholder="Contoh: Permintaan penghapusan data pribadi (GDPR/UU PDP)"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setDeleteTarget(undefined)}>
                Batal
              </Button>
              <Button type="submit" variant="danger" loading={submitting}>
                Hapus Permanen
              </Button>
            </div>
          </form>
        </DestructiveDialog>
      )}
    </section>
  );
}
