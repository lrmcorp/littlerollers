'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
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
} from '../../identity-verification-client';
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
  SELFIE: 'Selfie photo',
  KTP_FRONT: 'Front of KTP',
};

const reasonLabels: Record<string, string> = {
  BLURRY: 'The photo is blurry',
  GLARE: 'Glare is covering the document',
  CROPPED: 'Part of the document is cut off',
  DOCUMENT_UNREADABLE: 'We cannot read the details on the document',
  FACE_MISMATCH: 'The face does not match the document',
  WRONG_DOCUMENT: 'This is not the right document',
  OTHER_REQUIRES_NOTE: 'The document needs a fix',
};

const statusCopy = {
  PENDING: {
    eyebrow: 'Being checked',
    title: 'We have your documents',
    description:
      'Our team is checking your selfie and KTP privately. You do not need to upload again unless we ask for a fix.',
  },
  ACTION_REQUIRED: {
    eyebrow: 'Needs a fix',
    title: 'One more step to finish verification',
    description: 'Read the note on the document below, then upload a clearer photo.',
  },
  APPROVED: {
    eyebrow: 'Verified',
    title: 'Your identity is approved',
    description: 'You can now buy packages and book sessions from your Little Rollers account.',
  },
} as const;

function documentStatus(document: VerificationDocument) {
  if (document.status === 'APPROVED')
    return { label: 'Approved', className: 'bg-dd-success-soft text-dd-success' };
  if (document.status === 'REJECTED')
    return { label: 'Upload again', className: 'bg-dd-warning-soft text-dd-warning' };
  if (document.status === 'PENDING_DELETION')
    return { label: 'Being deleted', className: 'bg-dd-surface-muted text-dd-muted' };
  if (document.status === 'DELETE_FAILED')
    return {
      label: 'Deletion needs another try',
      className: 'bg-dd-danger-soft text-dd-danger',
    };
  if (document.status === 'DELETED')
    return { label: 'Deleted', className: 'bg-dd-surface-muted text-dd-muted' };
  return { label: 'Being checked', className: 'bg-dd-brass-soft text-dd-forest' };
}

function documentDescription(document: VerificationDocument) {
  if (document.status === 'APPROVED')
    return 'This document passed the check and cannot be replaced.';
  if (document.status === 'REJECTED')
    return (
      reasonLabels[document.rejectionReasonCode ?? ''] ??
      'Please fix the photo so we can continue the check.'
    );
  if (document.status === 'PENDING_DELETION')
    return 'The old document is being deleted safely. Contact us if this does not change.';
  if (document.status === 'DELETE_FAILED')
    return 'Deleting the document ran into a problem. The file stays private and our team will follow up.';
  if (document.status === 'DELETED') return 'The document was deleted and cannot be shown.';
  if (document.scanStatus === 'PENDING')
    return 'The file safety check is running. You can upload again if we ask for a fix.';
  if (['ERROR', 'REJECTED', 'INFECTED'].includes(document.scanStatus))
    return 'The file check needs a reviewer to follow up. The file stays private meanwhile.';
  return 'The document is being checked. You can upload again if we ask for a fix.';
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
    <PreviewModal
      open
      title={documentLabels[document.kind]}
      description="Private documents open through a short, one-time link."
      onClose={onClose}
      className="max-w-2xl"
    >
      <div className="grid min-h-64 place-items-center rounded-dd-lg bg-dd-surface-muted p-4">
        {preview.state === 'loading' ? (
          <p role="status">Opening the document securely…</p>
        ) : preview.state === 'error' ? (
          <p role="alert" className="text-dd-danger">
            The document could not be shown. Close this and try again.
          </p>
        ) : (
          <img
            src={preview.url}
            alt={`Your ${documentLabels[document.kind].toLowerCase()}`}
            className="max-h-[65vh] rounded-dd-md object-contain"
          />
        )}
      </div>
      <p className="mt-3 text-xs leading-5 text-dd-muted">
        This link is private, works once, and is not saved by your browser.
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
      title: 'Cancel the new upload?',
      message: 'The photo you picked will be removed.',
      confirmLabel: 'Remove photo',
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
      title={`Upload a new ${documentLabels[document.kind].toLowerCase()}`}
      description="Compare the current document with the new photo before sending."
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
            Cancel
          </Button>
          <Button
            type="submit"
            form="identity-replacement-form"
            disabled={!file || state === 'success'}
            loading={state === 'uploading'}
            loadingLabel="Mengunggah…"
          >
            {state === 'success' ? 'Document received' : 'Send new document'}
          </Button>
        </div>
      }
    >
      <div className="rounded-dd-lg bg-dd-surface-muted p-4 text-sm leading-6 text-dd-muted">
        Make sure the photo is sharp, the whole document is visible, there is no glare, and it is a
        JPG, PNG or WebP up to 8 MB.
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-dd-muted">
            Current document
          </p>
          <div className="grid min-h-40 place-items-center rounded-dd-lg bg-dd-surface-muted p-3">
            {currentPreview.state === 'ready' ? (
              <img
                src={currentPreview.url}
                alt={`Current ${documentLabels[document.kind].toLowerCase()}`}
                className="max-h-44 rounded-dd-md object-contain"
              />
            ) : (
              <span className="text-sm text-dd-muted">
                {currentPreview.state === 'loading' ? 'Opening…' : 'Preview not available'}
              </span>
            )}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-dd-muted">
            New document
          </p>
          <div className="grid min-h-40 place-items-center rounded-dd-lg bg-dd-surface-muted p-3">
            {preview ? (
              <img
                src={preview}
                alt="Preview of the new document"
                className="max-h-44 rounded-dd-md object-contain"
              />
            ) : (
              <span className="text-sm text-dd-muted">Nothing chosen yet</span>
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
            setMessage('Choose a JPG, PNG or WebP image up to 8 MB.');
            feedback.showToast({
              tone: 'warning',
              title: 'This file will not work',
              message: 'Use a JPG, PNG or WebP image up to 8 MB.',
            });
            return;
          }
          setState('uploading');
          setMessage('Uploading and checking the document…');
          try {
            await verificationClient.replace(document.kind, {
              file,
              expectedVersion: document.version,
            });
            setState('success');
            setMessage('We received the new document. Your verification status is updated.');
            await onComplete();
            feedback.showToast({
              tone: 'success',
              title: 'New document received',
              message: `Your ${documentLabels[document.kind].toLowerCase()} is back in the queue to check.`,
            });
            onClose();
          } catch (error) {
            const status = (error as { response?: { status?: number } }).response?.status;
            setState(status === 409 ? 'stale' : 'error');
            setMessage(
              status === 409
                ? 'The document status changed. Close this panel and reload before trying again.'
                : status === 422
                  ? 'The file did not pass the check. Use an original, undamaged, clear photo.'
                  : status === 503
                    ? 'Private storage is unavailable right now. Please try again shortly.'
                    : 'The document did not upload. Check your connection and try again.',
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
            {file ? 'Change the chosen photo' : 'Choose a new photo'}
          </span>
          <span className="mt-1 text-xs text-dd-muted">
            {file ? `${(file.size / 1_000_000).toFixed(1)} MB` : 'JPG, PNG or WebP · up to 8 MB'}
          </span>
          <input
            className="sr-only"
            aria-label="Choose a new photo"
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
          title: 'That next page is not valid',
          message: 'Once you are verified, we will take you to the packages page.',
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
            title: 'Verified',
            message: 'Taking you back to what you were doing.',
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
      <div aria-label="Loading verification status" className="animate-pulse space-y-5">
        <div className="h-52 rounded-[22px] bg-dd-surface-muted" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-60 rounded-[22px] bg-dd-surface-muted" />
          <div className="h-60 rounded-[22px] bg-dd-surface-muted" />
        </div>
      </div>
    );

  if (state === 'error' && !summary)
    return (
      <section className="mx-auto max-w-xl rounded-[22px] border border-dd-danger/20 bg-white p-8 text-center">
        <RefreshCw className="mx-auto size-9 text-dd-danger" />
        <h1 className="mt-4 font-display text-2xl text-dd-forest">
          Your verification status did not load
        </h1>
        <p className="mt-2 text-sm leading-6 text-dd-muted">
          The service may be unavailable, or you were signed out.
        </p>
        <Button type="button" onClick={() => void load()} className="mt-5">
          Try again
        </Button>
      </section>
    );

  if (!summary?.documents.length)
    return (
      <section className="mx-auto max-w-xl rounded-[22px] border border-dd-line bg-white p-8 text-center">
        <FileCheck2 className="mx-auto size-9 text-dd-muted" />
        <h1 className="mt-4 font-display text-2xl text-dd-forest">We cannot find your documents</h1>
        <p className="mt-2 text-sm leading-6 text-dd-muted">
          Contact the Little Rollers team so they can check your registration documents.
        </p>
        <Link className="mt-5 inline-flex font-bold text-dd-forest" href="/contact">
          Contact us
        </Link>
      </section>
    );

  const copy = statusCopy[summary.status];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[22px] border border-dd-line bg-white">
        <div className="grid gap-7 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:p-10">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-dd-brass-dark">
              {copy.eyebrow}
            </span>
            <h1 className="mt-3 max-w-2xl font-display text-3xl text-dd-forest sm:text-4xl">
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
                    See the timetable
                  </Link>
                  <Link
                    className="rounded-dd-md border border-dd-line bg-white px-5 py-3 text-sm font-bold text-dd-ink no-underline"
                    href="/account"
                  >
                    Back to my account
                  </Link>
                </>
              )}
              {summary.status === 'APPROVED' && (
                <>
                  <Link
                    className="rounded-dd-md bg-dd-forest px-5 py-3 text-sm font-bold text-white no-underline"
                    href="/packages"
                  >
                    See packages
                  </Link>
                  <Link
                    className="rounded-dd-md border border-dd-line bg-white px-5 py-3 text-sm font-bold text-dd-ink no-underline"
                    href="/classes"
                  >
                    Book a session
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="rounded-dd-lg bg-dd-sidebar p-5 text-white">
            <ShieldCheck className="size-7 text-dd-brass" />
            <h2 className="mt-4 mb-0 font-display text-lg text-white">Your progress</h2>
            <ol className="mt-4 grid list-none gap-3 p-0">
              {['Documents received', 'Being checked', 'Done'].map((label, index) => (
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
            <h2 id="documents-title" className="m-0 font-display text-2xl text-dd-forest">
              Your documents
            </h2>
          </div>
          <span className="hidden text-xs text-dd-muted sm:block">Updates every 20 seconds</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {summary.documents.map((document) => {
            const status = documentStatus(document);
            return (
              <article
                id={`verification-document-${document.kind}`}
                tabIndex={-1}
                className={`rounded-[22px] border bg-white p-5 outline-none transition sm:p-6 ${
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
                {document.rejectionNote && document.status === 'REJECTED' && (
                  <p className="mt-3 rounded-dd-md bg-dd-warning-soft p-3 text-sm leading-6 text-dd-warning">
                    Catatan reviewer: {document.rejectionNote}
                  </p>
                )}
                {document.status === 'REJECTED' && (
                  <Button
                    type="button"
                    onClick={() => setReplacement(document)}
                    fullWidth
                    className="mt-5"
                  >
                    Upload again
                  </Button>
                )}
                {['PENDING_DELETION', 'DELETE_FAILED', 'DELETED'].includes(document.status) && (
                  <Link
                    className="mt-4 inline-flex text-sm font-bold text-dd-forest"
                    href="/contact"
                  >
                    Contact us
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
                    View document
                  </Button>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <aside className="grid gap-4 rounded-[22px] border border-dd-line bg-dd-surface-muted p-5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
        <LockKeyhole className="size-6 text-dd-forest" />
        <div>
          <h2 className="m-0 text-sm font-bold">Your privacy</h2>
          <p className="mt-1 text-xs leading-5 text-dd-muted">
            Files are kept in private storage, never made public, and every time a reviewer opens
            one it is logged.
          </p>
        </div>
        <Link
          className="inline-flex items-center gap-2 text-sm font-bold text-dd-forest"
          href="/contact"
        >
          <HelpCircle className="size-4" aria-hidden="true" /> Help
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
