'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  Suspense,
  type ReactNode,
} from 'react';

export type AppLoadingToken = string & { readonly __brand: 'AppLoadingToken' };

export type AppLoadingTaskOptions = {
  label?: string;
  mode?: 'foreground' | 'background';
};

export type AppLoadingController = {
  readonly isLoading: boolean;
  start(options?: string | AppLoadingTaskOptions): AppLoadingToken;
  finish(token: AppLoadingToken): void;
  track<T>(task: Promise<T> | (() => Promise<T>), options?: AppLoadingTaskOptions): Promise<T>;
};

type LoadingSnapshot = {
  count: number;
  label: string;
  revision: number;
};

type StoredTask = {
  label: string;
  timeout: ReturnType<typeof setTimeout> | null;
};

const WATCHDOG_MS = 60_000;
const listeners = new Set<() => void>();
const tasks = new Map<AppLoadingToken, StoredTask>();
let revision = 0;
let navigationToken: AppLoadingToken | null = null;
let latestSnapshot: LoadingSnapshot = { count: 0, label: 'Memuat…', revision: 0 };
const serverSnapshot: LoadingSnapshot = { count: 0, label: 'Memuat…', revision: 0 };

function updateSnapshot() {
  revision += 1;
  latestSnapshot = {
    count: tasks.size,
    label: Array.from(tasks.values()).at(-1)?.label ?? 'Memuat…',
    revision,
  };
  listeners.forEach((listener) => listener());
}

function newToken() {
  return (
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `loading-${Date.now()}-${Math.random().toString(36).slice(2)}`
  ) as AppLoadingToken;
}

export const appLoading = {
  start(options: string | AppLoadingTaskOptions = {}): AppLoadingToken {
    const normalized = typeof options === 'string' ? { label: options } : options;
    const token = newToken();
    if (normalized.mode === 'background') return token;
    const task: StoredTask = {
      label: normalized.label ?? 'Memuat…',
      timeout: null,
    };
    task.timeout = setTimeout(() => {
      if (!tasks.has(token)) return;
      tasks.delete(token);
      updateSnapshot();
    }, WATCHDOG_MS);
    tasks.set(token, task);
    updateSnapshot();
    return token;
  },
  finish(token: AppLoadingToken) {
    const task = tasks.get(token);
    if (!task) return;
    if (task.timeout) clearTimeout(task.timeout);
    tasks.delete(token);
    if (navigationToken === token) navigationToken = null;
    updateSnapshot();
  },
  async track<T>(
    task: Promise<T> | (() => Promise<T>),
    options: AppLoadingTaskOptions = {},
  ): Promise<T> {
    if (options.mode === 'background') return typeof task === 'function' ? task() : task;
    const token = this.start(options);
    try {
      return await (typeof task === 'function' ? task() : task);
    } finally {
      this.finish(token);
    }
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    return latestSnapshot;
  },
  getServerSnapshot(): LoadingSnapshot {
    return serverSnapshot;
  },
};

export function startNavigation(label = 'Memuat halaman…') {
  if (!navigationToken) navigationToken = appLoading.start(label);
  return navigationToken;
}

export function completeNavigation() {
  if (!navigationToken) return;
  appLoading.finish(navigationToken);
  navigationToken = null;
}

export function foregroundFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
  label = 'Memuat data…',
) {
  return appLoading.track(() => fetch(input, init), { label });
}

const LoadingContext = createContext<AppLoadingController | null>(null);

function GlobalTopLoader({ snapshot }: { snapshot: LoadingSnapshot }) {
  const active = snapshot.count > 0;
  const [visible, setVisible] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [progress, setProgress] = useState(0);
  const shownAt = useRef(0);
  const delayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (active) {
      if (completionTimer.current) clearTimeout(completionTimer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setCompleting(false);
      if (!visible && !delayTimer.current) {
        delayTimer.current = setTimeout(() => {
          delayTimer.current = null;
          shownAt.current = Date.now();
          setProgress(15);
          setVisible(true);
        }, 120);
      }
      return;
    }

    if (delayTimer.current) {
      clearTimeout(delayTimer.current);
      delayTimer.current = null;
    }
    if (!visible) return;
    const remaining = Math.max(0, 300 - (Date.now() - shownAt.current));
    completionTimer.current = setTimeout(() => {
      setProgress(100);
      setCompleting(true);
      hideTimer.current = setTimeout(() => {
        setVisible(false);
        setCompleting(false);
        setProgress(0);
      }, 180);
    }, remaining);
  }, [active, visible]);

  useEffect(() => {
    if (!visible || !active) return;
    const interval = setInterval(() => {
      setProgress((current) => Math.min(90, current + Math.max(1, (90 - current) * 0.12)));
    }, 420);
    return () => clearInterval(interval);
  }, [active, visible]);

  useEffect(
    () => () => {
      if (delayTimer.current) clearTimeout(delayTimer.current);
      if (completionTimer.current) clearTimeout(completionTimer.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    },
    [],
  );

  if (!visible) return null;
  return (
    <>
      <div
        role="progressbar"
        aria-label={snapshot.label}
        aria-valuetext={completing ? 'Selesai memuat' : 'Sedang memuat'}
        className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-[3px] overflow-hidden bg-dd-forest/10"
      >
        <span
          className="block h-full origin-left bg-gradient-to-r from-dd-forest via-dd-forest to-dd-brass shadow-[0_0_10px_rgba(35,84,65,0.35)] transition-[width,opacity] duration-200 ease-out motion-reduce:transition-none"
          style={{ width: `${progress}%`, opacity: completing ? 0.85 : 1 }}
        />
      </div>
      <span className="sr-only" role="status" aria-live="polite">
        {completing ? 'Selesai memuat.' : snapshot.label}
      </span>
    </>
  );
}

function shouldTrackAnchor(event: MouseEvent, anchor: HTMLAnchorElement) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    anchor.hasAttribute('download') ||
    (anchor.target && anchor.target !== '_self')
  )
    return false;
  const next = new URL(anchor.href, window.location.href);
  if (!['http:', 'https:'].includes(next.protocol) || next.origin !== window.location.origin)
    return false;
  const current = new URL(window.location.href);
  if (next.pathname === current.pathname && next.search === current.search) return false;
  return true;
}

function NavigationLoadingLifecycle() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const destination = `${pathname}?${searchParams.toString()}`;

  useEffect(() => completeNavigation(), [destination]);
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest('a[href]');
      if (anchor instanceof HTMLAnchorElement && shouldTrackAnchor(event, anchor))
        startNavigation();
    };
    const onPopState = () => startNavigation();
    document.addEventListener('click', onClick, true);
    window.addEventListener('popstate', onPopState);
    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('popstate', onPopState);
    };
  }, []);
  return null;
}

export function AppLoadingProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(
    appLoading.subscribe,
    appLoading.getSnapshot,
    appLoading.getServerSnapshot,
  );
  const start = useCallback(
    (options?: string | AppLoadingTaskOptions) => appLoading.start(options),
    [],
  );
  const finish = useCallback((token: AppLoadingToken) => appLoading.finish(token), []);
  const track = useCallback(
    <T,>(task: Promise<T> | (() => Promise<T>), options?: AppLoadingTaskOptions) =>
      appLoading.track(task, options),
    [],
  );
  const value = useMemo<AppLoadingController>(
    () => ({ isLoading: snapshot.count > 0, start, finish, track }),
    [finish, snapshot.count, start, track],
  );
  return (
    <LoadingContext.Provider value={value}>
      {children}
      <Suspense fallback={null}>
        <NavigationLoadingLifecycle />
      </Suspense>
      <GlobalTopLoader snapshot={snapshot} />
    </LoadingContext.Provider>
  );
}

export function useAppLoading() {
  const context = useContext(LoadingContext);
  if (!context) throw new Error('useAppLoading must be used within AppLoadingProvider');
  return context;
}

export function useOptionalAppLoading() {
  return useContext(LoadingContext);
}

function destinationFor(href: string) {
  const next = new URL(href, window.location.href);
  return `${next.pathname}${next.search}`;
}

export function useTrackedRouter() {
  const router = useRouter();
  return useMemo(
    () => ({
      ...router,
      push(href: string, options?: Parameters<typeof router.push>[1]) {
        if (destinationFor(href) !== `${window.location.pathname}${window.location.search}`)
          startNavigation();
        return options === undefined ? router.push(href) : router.push(href, options);
      },
      replace(href: string, options?: Parameters<typeof router.replace>[1]) {
        if (destinationFor(href) !== `${window.location.pathname}${window.location.search}`)
          startNavigation();
        return options === undefined ? router.replace(href) : router.replace(href, options);
      },
      back() {
        startNavigation();
        return router.back();
      },
    }),
    [router],
  );
}
