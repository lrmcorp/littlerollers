'use client';

import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type FeedbackTone = 'success' | 'info' | 'warning' | 'danger';

export type FeedbackAction = {
  label: string;
  onSelect(): void;
};

export type AppToast = {
  id?: string;
  tone: FeedbackTone;
  title: string;
  message?: string;
  durationMs?: number;
  dismissible?: boolean;
  correlationReference?: string;
  action?: FeedbackAction;
};

export type AppAlert = Omit<AppToast, 'durationMs'> & {
  closeLabel?: string;
};

export type ConfirmationOptions = {
  tone?: 'warning' | 'danger';
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  correlationReference?: string;
};

type FeedbackContextValue = {
  showToast(input: AppToast): string;
  showAlert(input: AppAlert): string;
  confirm(input: ConfirmationOptions): Promise<boolean>;
  dismiss(id: string): void;
  dismissAll(): void;
};

type Stored<T> = T & { id: string };

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

const icons = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  danger: AlertCircle,
};

const toneClasses = {
  success: 'border-emerald-200 bg-dd-success-soft text-dd-success',
  info: 'border-sky-200 bg-dd-info-soft text-dd-info',
  warning: 'border-amber-200 bg-dd-warning-soft text-dd-warning',
  danger: 'border-red-200 bg-dd-danger-soft text-dd-danger',
};

const newFeedbackId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `feedback-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export function messageForApiError(error: unknown): {
  title: string;
  message: string;
  correlationReference?: string;
} {
  const response = (
    error as {
      response?: { status?: number; correlationId?: string; data?: { code?: string } };
    }
  )?.response;
  const code = response?.data?.code;
  const known: Record<string, [string, string]> = {
    STALE_VERSION: ['Data telah berubah', 'Muat ulang data terbaru sebelum mencoba kembali.'],
    FORBIDDEN: ['Akses tidak tersedia', 'Akun Anda tidak memiliki izin untuk tindakan ini.'],
    UNAUTHORIZED: ['Sesi telah berakhir', 'Silakan masuk kembali untuk melanjutkan.'],
    VALIDATION_ERROR: [
      'Periksa kembali data',
      'Beberapa informasi belum valid atau belum lengkap.',
    ],
    NOT_FOUND: ['Data tidak ditemukan', 'Data mungkin telah dipindahkan atau tidak lagi tersedia.'],
    SERVICE_UNAVAILABLE: ['Layanan belum tersedia', 'Coba kembali beberapa saat lagi.'],
  };
  const fallback: [string, string] =
    response?.status === 401
      ? known.UNAUTHORIZED!
      : response?.status === 403
        ? known.FORBIDDEN!
        : response?.status === 409
          ? known.STALE_VERSION!
          : ['Terjadi kendala', 'Permintaan belum dapat diproses. Silakan coba kembali.'];
  const [title, message] = (code && known[code]) || fallback;
  return { title, message, correlationReference: response?.correlationId };
}

export function AlertBanner({
  tone,
  title,
  message,
  correlationReference,
  action,
}: Omit<AppAlert, 'id'>) {
  const Icon = icons[tone];
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      aria-live={tone === 'danger' ? 'assertive' : 'polite'}
      className={`flex gap-3 rounded-dd-lg border p-4 ${toneClasses[tone]}`}
    >
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <strong className="block text-sm">{title}</strong>
        {message && <p className="mt-1 text-sm leading-6 opacity-90">{message}</p>}
        {correlationReference && (
          <p className="mt-2 text-xs opacity-70">Referensi: {correlationReference}</p>
        )}
        {action && (
          <button type="button" className="mt-3" onClick={action.onSelect}>
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}

export function Modal({
  open,
  title,
  description,
  children,
  onClose,
  closeOnEscape = true,
  closeOnBackdrop = true,
  className = '',
}: {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose(): void;
  closeOnEscape?: boolean;
  closeOnBackdrop?: boolean;
  className?: string;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusable = () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
    focusable()[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape) {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0]!;
      const last = items.at(-1)!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      previousFocus?.focus();
    };
  }, [closeOnEscape, onClose, open]);
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[120] grid place-items-center overflow-y-auto bg-dd-sidebar/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (closeOnBackdrop && event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        className={`w-full max-w-lg rounded-dd-xl border border-dd-line bg-dd-surface p-6 shadow-dd-float motion-reduce:transition-none ${className}`}
      >
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-xl font-semibold text-dd-ink">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-2 text-sm leading-6 text-dd-muted">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            aria-label="Tutup dialog"
            onClick={onClose}
            className="grid size-10 min-h-0 shrink-0 place-items-center rounded-full border border-dd-line bg-white p-0 text-dd-muted"
          >
            <X className="size-4" />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}

export function Drawer(props: Parameters<typeof Modal>[0]) {
  return (
    <Modal
      {...props}
      className={`ml-auto min-h-full max-w-xl rounded-none ${props.className ?? ''}`}
    />
  );
}

function ToastItem({ toast, onDismiss }: { toast: Stored<AppToast>; onDismiss(id: string): void }) {
  const Icon = icons[toast.tone];
  useEffect(() => {
    if (toast.durationMs === 0) return;
    const timer = window.setTimeout(() => onDismiss(toast.id), toast.durationMs ?? 5000);
    return () => window.clearTimeout(timer);
  }, [onDismiss, toast.durationMs, toast.id]);
  return (
    <div
      role={toast.tone === 'danger' ? 'alert' : 'status'}
      className={`pointer-events-auto flex w-full gap-3 rounded-dd-lg border p-4 shadow-dd-float ${toneClasses[toast.tone]}`}
    >
      <Icon className="mt-0.5 size-5 shrink-0" />
      <div className="min-w-0 flex-1">
        <strong className="block text-sm">{toast.title}</strong>
        {toast.message && <p className="mt-1 text-sm leading-5 opacity-90">{toast.message}</p>}
        {toast.correlationReference && (
          <p className="mt-2 text-xs opacity-70">Referensi: {toast.correlationReference}</p>
        )}
        {toast.action && (
          <button type="button" className="mt-2" onClick={toast.action.onSelect}>
            {toast.action.label}
          </button>
        )}
      </div>
      {toast.dismissible !== false && (
        <button
          type="button"
          aria-label={`Tutup pesan ${toast.title}`}
          onClick={() => onDismiss(toast.id)}
          className="grid size-8 min-h-0 place-items-center border-0 bg-transparent p-0 text-current"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

export function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: Stored<AppToast>[];
  onDismiss(id: string): void;
}) {
  return (
    <div
      aria-label="Pesan aplikasi"
      className="pointer-events-none fixed inset-x-4 top-4 z-[150] ml-auto grid max-w-sm gap-3 sm:left-auto sm:right-5"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

export function AppFeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Stored<AppToast>[]>([]);
  const [alerts, setAlerts] = useState<Stored<AppAlert>[]>([]);
  const [confirmation, setConfirmation] = useState<{
    input: ConfirmationOptions;
    resolve(value: boolean): void;
  } | null>(null);
  const dismiss = useCallback((id: string) => {
    setToasts((items) => items.filter((item) => item.id !== id));
    setAlerts((items) => items.filter((item) => item.id !== id));
  }, []);
  const value = useMemo<FeedbackContextValue>(
    () => ({
      showToast(input) {
        const id = input.id ?? newFeedbackId();
        setToasts((items) => [...items.filter((item) => item.id !== id), { ...input, id }]);
        return id;
      },
      showAlert(input) {
        const id = input.id ?? newFeedbackId();
        setAlerts((items) => [...items.filter((item) => item.id !== id), { ...input, id }]);
        return id;
      },
      confirm(input) {
        return new Promise<boolean>((resolve) => setConfirmation({ input, resolve }));
      },
      dismiss,
      dismissAll() {
        setToasts([]);
        setAlerts([]);
      },
    }),
    [dismiss],
  );
  const currentAlert = alerts[0];
  const resolveConfirmation = (result: boolean) => {
    confirmation?.resolve(result);
    setConfirmation(null);
  };
  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
      <Modal
        open={Boolean(currentAlert)}
        title={currentAlert?.title ?? ''}
        description={currentAlert?.message}
        onClose={() => currentAlert && dismiss(currentAlert.id)}
      >
        {currentAlert?.correlationReference && (
          <p className="text-xs text-dd-muted">Referensi: {currentAlert.correlationReference}</p>
        )}
        <div className="mt-5 flex justify-end gap-3">
          {currentAlert?.action && (
            <button type="button" onClick={currentAlert.action.onSelect}>
              {currentAlert.action.label}
            </button>
          )}
          <button type="button" onClick={() => currentAlert && dismiss(currentAlert.id)}>
            {currentAlert?.closeLabel ?? 'Tutup'}
          </button>
        </div>
      </Modal>
      <Modal
        open={Boolean(confirmation)}
        title={confirmation?.input.title ?? ''}
        description={confirmation?.input.message}
        onClose={() => resolveConfirmation(false)}
      >
        {confirmation?.input.correlationReference && (
          <p className="text-xs text-dd-muted">
            Referensi: {confirmation.input.correlationReference}
          </p>
        )}
        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={() => resolveConfirmation(false)}>
            {confirmation?.input.cancelLabel ?? 'Batal'}
          </button>
          <button
            type="button"
            onClick={() => resolveConfirmation(true)}
            className={confirmation?.input.tone === 'danger' ? 'bg-dd-danger text-white' : ''}
          >
            {confirmation?.input.confirmLabel ?? 'Lanjutkan'}
          </button>
        </div>
      </Modal>
    </FeedbackContext.Provider>
  );
}

export function useAppFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) throw new Error('useAppFeedback must be used within AppFeedbackProvider');
  return context;
}
