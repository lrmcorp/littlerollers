'use client';

import { Bell, CheckCheck, LoaderCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { browserNotificationClient, type UserNotification } from '../notification-client';

const toneDot = {
  success: 'bg-emerald-500',
  info: 'bg-sky-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
};

export function NotificationCenter({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [items, setItems] = useState<UserNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  const refresh = useCallback(async () => {
    setStatus('loading');
    try {
      const [page, count] = await Promise.all([
        browserNotificationClient.list({ limit: 12 }),
        browserNotificationClient.unreadCount(),
      ]);
      setItems(page.items);
      setNextCursor(page.page.nextCursor);
      setUnread(count.count);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 60_000);
    const visible = () => {
      if (document.visibilityState === 'visible') void refresh();
    };
    window.addEventListener('focus', visible);
    document.addEventListener('visibilitychange', visible);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', visible);
      document.removeEventListener('visibilitychange', visible);
    };
  }, [refresh]);

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    window.addEventListener('pointerdown', close);
    window.addEventListener('keydown', escape);
    return () => {
      window.removeEventListener('pointerdown', close);
      window.removeEventListener('keydown', escape);
    };
  }, [open]);

  const markRead = async (item: UserNotification) => {
    if (!item.readAt) {
      setItems((current) =>
        current.map((candidate) =>
          candidate.id === item.id ? { ...candidate, readAt: new Date().toISOString() } : candidate,
        ),
      );
      setUnread((current) => Math.max(0, current - 1));
      try {
        await browserNotificationClient.markRead(item.id);
      } catch {
        void refresh();
      }
    }
    setOpen(false);
  };

  return (
    <div className="relative" ref={root}>
      <button
        ref={trigger}
        type="button"
        aria-label={unread ? `Notifikasi, ${unread} belum dibaca` : 'Notifikasi'}
        aria-expanded={open}
        aria-controls="global-notification-center"
        onClick={() => setOpen((value) => !value)}
        className="relative grid size-10 min-h-0 shrink-0 place-items-center rounded-dd-md border border-dd-line bg-white p-0 text-dd-muted"
      >
        <Bell className="size-[18px]" aria-hidden="true" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-dd-danger px-1 text-[10px] font-bold text-white">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>
      {open && (
        <section
          id="global-notification-center"
          aria-label="Pusat notifikasi"
          className={`fixed inset-x-3 top-16 z-[80] overflow-hidden rounded-dd-lg border border-dd-line bg-white shadow-dd-float sm:absolute sm:inset-auto sm:right-0 sm:top-auto sm:mt-2 ${compact ? 'sm:w-[340px]' : 'sm:w-[390px]'}`}
        >
          <header className="flex items-center justify-between gap-3 border-b border-dd-line px-4 py-3">
            <div>
              <strong className="block text-sm">Notifikasi</strong>
              <span className="text-xs text-dd-muted">{unread} belum dibaca</span>
            </div>
            {unread > 0 && (
              <button
                type="button"
                className="inline-flex min-h-9 items-center gap-1.5 rounded-dd-sm border-0 bg-transparent px-2 text-xs font-semibold text-dd-forest"
                onClick={() =>
                  void browserNotificationClient.markAllRead().then(() => {
                    setUnread(0);
                    setItems((current) =>
                      current.map((item) => ({ ...item, readAt: new Date().toISOString() })),
                    );
                  })
                }
              >
                <CheckCheck className="size-4" /> Tandai semua
              </button>
            )}
          </header>
          <div className="max-h-[min(520px,70dvh)] overflow-y-auto" aria-live="polite">
            {status === 'loading' && items.length === 0 && (
              <div className="grid place-items-center gap-2 p-8 text-sm text-dd-muted">
                <LoaderCircle className="size-5 animate-spin motion-reduce:animate-none" />
                Memuat notifikasi…
              </div>
            )}
            {status === 'error' && (
              <div className="p-6 text-center">
                <p className="text-sm text-dd-muted">Notifikasi belum dapat dimuat.</p>
                <button
                  className="mt-3 inline-flex items-center gap-2"
                  onClick={() => void refresh()}
                >
                  <RefreshCw className="size-4" /> Coba lagi
                </button>
              </div>
            )}
            {status === 'ready' && items.length === 0 && (
              <div className="p-8 text-center">
                <Bell className="mx-auto size-6 text-dd-muted" />
                <strong className="mt-3 block text-sm">Belum ada notifikasi</strong>
                <p className="mt-1 text-xs leading-5 text-dd-muted">
                  Pembaruan penting akan muncul di sini.
                </p>
              </div>
            )}
            {items.map((item) => (
              <Link
                key={item.id}
                href={item.href ?? '#'}
                onClick={(event) => {
                  if (!item.href) event.preventDefault();
                  void markRead(item);
                }}
                className={`grid grid-cols-[auto_minmax(0,1fr)] gap-3 border-b border-dd-line px-4 py-3 text-dd-ink no-underline last:border-0 hover:bg-dd-surface-muted ${item.readAt ? 'opacity-70' : 'bg-dd-paper/50'}`}
              >
                <span
                  className={`mt-1.5 size-2 rounded-full ${toneDot[item.tone]}`}
                  aria-hidden="true"
                />
                <span className="min-w-0">
                  <strong className="block text-sm">{item.title}</strong>
                  <span className="mt-1 block text-xs leading-5 text-dd-muted">{item.message}</span>
                  <time className="mt-1 block text-[11px] text-dd-muted" dateTime={item.createdAt}>
                    {new Intl.DateTimeFormat('id-ID', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    }).format(new Date(item.createdAt))}
                  </time>
                </span>
              </Link>
            ))}
            {nextCursor && status === 'ready' && (
              <button
                type="button"
                className="min-h-11 w-full rounded-none border-0 border-t border-dd-line bg-white text-sm font-semibold text-dd-forest"
                onClick={() =>
                  void browserNotificationClient
                    .list({ cursor: nextCursor, limit: 12 })
                    .then((page) => {
                      setItems((current) => [...current, ...page.items]);
                      setNextCursor(page.page.nextCursor);
                    })
                }
              >
                Muat lebih banyak
              </button>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
