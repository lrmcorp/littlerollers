'use client';

import { RefreshCw, Trash2 } from 'lucide-react';
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
} from '../identity-verification-client';
import { PageHeader, StatusBadge } from '../ui';
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
  const [cursor, setCursor] = useState<string>();
  const [nextCursor, setNextCursor] = useState<string | null>(null);
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
      limit: 20,
      customerUserId: customerUserId || undefined,
    }),
    [cursor, customerUserId, from, kind, q, scanStatus, status, until],
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
      setSummary(result.summary);
      setNextCursor(result.page.nextCursor);
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
    if (customerUserId) params.set('customerUserId', customerUserId);
    window.history.replaceState(
      window.history.state,
      '',
      `/identity-verifications${params.size ? `?${params}` : ''}`,
    );
  }, [customerUserId, from, kind, q, scanStatus, status, until]);

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
      feedback.showAlert({ tone: 'danger', ...mapped });
    } finally {
      setPreviewLoading(undefined);
    }
  };

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
    const confirmed = await feedback.confirm({
      tone: kind === 'reject' ? 'warning' : undefined,
      title: kind === 'approve' ? 'Setujui dokumen?' : 'Minta perbaikan dokumen?',
      message: `${kindLabel(document.kind)} milik ${selected?.user.displayName ?? 'customer'} akan ${kind === 'approve' ? 'disetujui' : 'dikembalikan untuk diperbaiki'}.`,
      confirmLabel: kind === 'approve' ? 'Setujui' : 'Minta perbaikan',
    });
    if (!confirmed) return;
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
    <section className="space-y-6" aria-labelledby="identity-review-title">
      <Panel className="p-6 sm:p-8">
        <PageHeader
          eyebrow="Administrasi"
          title="Verifikasi customer"
          titleId="identity-review-title"
          description="Cari customer, bandingkan Selfie dan KTP, lalu ambil keputusan dengan jejak audit."
          context={
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone="success">Permission terverifikasi</StatusBadge>
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
            </div>
          }
        />
        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-dd-muted">
          <span>{summary.totalCustomers.toLocaleString('id-ID')} customer</span>
          <span>{summary.totalDocuments.toLocaleString('id-ID')} dokumen</span>
          <span>
            Diperbarui {generatedAt ? new Date(generatedAt).toLocaleString('id-ID') : '—'}
          </span>
        </div>
      </Panel>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <SummaryButton
          label="Dalam antrean"
          value={summary.pendingDocuments}
          active={status === 'PENDING'}
          onClick={() => {
            setStatus(status === 'PENDING' ? '' : 'PENDING');
            resetPage();
          }}
        />
        <SummaryButton
          label="Disetujui"
          value={summary.approvedDocuments}
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

      <FilterBar>
        <SearchInput
          label="Cari customer atau ID"
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

      <DataTable<IdentityVerificationReviewCase>
        items={items}
        loading={loading}
        rowKey={(item) => item.id}
        onRowClick={(item) => setSelected(item)}
        emptyTitle={
          q || kind || scanStatus || from || until
            ? 'Tidak ada hasil yang sesuai'
            : 'Antrean verifikasi kosong'
        }
        emptyDescription={
          q || kind || scanStatus || from || until
            ? 'Ubah pencarian atau reset filter untuk melihat data lain.'
            : 'Tidak ada customer yang perlu diperiksa pada status ini.'
        }
        columns={[
          {
            id: 'customer',
            header: 'Customer',
            cell: (item) => (
              <div>
                <strong>{item.user.displayName}</strong>
                <p className="mt-1 text-xs text-dd-muted">
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
          { id: 'age', header: 'Umur antrean', cell: (item) => ageLabel(item.oldestAt) },
          {
            id: 'action',
            header: <span className="sr-only">Tindakan</span>,
            cell: (item) => (
              <Button
                variant="secondary"
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
          <div className="grid gap-3">
            <div>
              <strong>{item.user.displayName}</strong>
              <p className="text-xs text-dd-muted">
                {item.user.phoneMasked ?? 'Kontak tidak tersedia'} · {ageLabel(item.oldestAt)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <DocumentBadge
                document={item.documents.find((document) => document.kind === 'SELFIE')}
              />
              <DocumentBadge
                document={item.documents.find((document) => document.kind === 'KTP_FRONT')}
              />
            </div>
            <Button variant="secondary">Periksa</Button>
          </div>
        )}
      />

      <Pagination
        hasPrevious={cursorHistory.length > 0}
        hasNext={Boolean(nextCursor) && !loading}
        totalLabel={`${summary.totalCustomers.toLocaleString('id-ID')} customer sesuai filter`}
        onPrevious={() => {
          const history = [...cursorHistory];
          setCursor(history.pop());
          setCursorHistory(history);
        }}
        onNext={() => {
          if (!nextCursor) return;
          setCursorHistory((history) => [...history, cursor]);
          setCursor(nextCursor);
        }}
      />

      <Drawer
        open={Boolean(selected)}
        title={selected ? `Verifikasi · ${selected.user.displayName}` : 'Verifikasi customer'}
        onClose={closeDrawer}
        className="max-w-4xl"
      >
        {selected && (
          <div className="space-y-6">
            <div className="rounded-dd-lg border border-dd-line bg-dd-surface-muted p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <strong>{selected.user.displayName}</strong>
                  <p className="mt-1 text-sm text-dd-muted">
                    {selected.user.phoneMasked ?? 'Kontak tidak tersedia'} · {selected.user.status}
                  </p>
                </div>
                <Badge
                  tone={
                    selected.verificationStatus === 'APPROVED'
                      ? 'success'
                      : selected.verificationStatus === 'ACTION_REQUIRED'
                        ? 'warning'
                        : 'neutral'
                  }
                >
                  {selected.verificationStatus === 'APPROVED'
                    ? 'Verifikasi selesai'
                    : selected.verificationStatus === 'ACTION_REQUIRED'
                      ? 'Perlu perbaikan'
                      : 'Sedang diperiksa'}
                </Badge>
              </div>
            </div>
            {staleDocumentId && (
              <AlertBanner
                tone="warning"
                title="Data dokumen telah berubah"
                message="Muat versi terbaru sebelum mengambil keputusan lain."
                action={{ label: 'Muat data terbaru', onSelect: () => void refreshSelected() }}
              />
            )}
            <div className="grid gap-4 lg:grid-cols-2">
              {(['SELFIE', 'KTP_FRONT'] as const).map((documentKind) => {
                const document = selected.documents.find((item) => item.kind === documentKind);
                return (
                  <DocumentReviewCard
                    key={documentKind}
                    document={document}
                    previewUrl={document ? previews[document.id] : undefined}
                    previewError={document ? previewErrors[document.id] : undefined}
                    previewLoading={document ? previewLoading === document.id : false}
                    onPreview={loadPreview}
                    onApprove={(item) => setDecision({ document: item, kind: 'approve' })}
                    onReject={(item) => setDecision({ document: item, kind: 'reject' })}
                    canDelete={canDelete}
                    mayDecide={canDecide}
                    onDelete={setDeleteTarget}
                  />
                );
              })}
            </div>
          </div>
        )}
      </Drawer>

      <DecisionDialog
        decision={decision}
        submitting={submitting}
        onClose={() => setDecision(undefined)}
        onSubmit={submitDecision}
      />
      <DestructiveDialog
        open={Boolean(deleteTarget)}
        title="Hapus file identitas secara permanen"
        impact="File privat tidak dapat dipulihkan dan customer mungkin perlu mengunggah dokumen baru."
        scope={selected?.user.displayName}
        busy={submitting}
        onClose={() => setDeleteTarget(undefined)}
        footer={
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              disabled={submitting}
              onClick={() => setDeleteTarget(undefined)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              form="identity-document-delete-form"
              variant="danger"
              leadingIcon={<Trash2 className="size-4" aria-hidden="true" />}
              loading={submitting}
            >
              Hapus permanen
            </Button>
          </div>
        }
      >
        <form id="identity-document-delete-form" className="grid gap-4" onSubmit={submitDeletion}>
          <Textarea
            label="Alasan penghapusan"
            name="reason"
            minLength={3}
            maxLength={500}
            required
          />
        </form>
      </DestructiveDialog>
    </section>
  );
}
