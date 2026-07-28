import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AppLoadingProvider,
  appLoading,
  completeNavigation,
  useAppLoading,
  useTrackedRouter,
} from './app-loading';

const navigation = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => navigation,
}));

function LoadingHarness() {
  const loading = useAppLoading();
  const router = useTrackedRouter();
  return (
    <>
      <button
        type="button"
        onClick={() => {
          const token = loading.start('Memuat pesanan…');
          window.setTimeout(() => loading.finish(token), 500);
        }}
      >
        Mulai
      </button>
      <button
        type="button"
        onClick={() => void loading.track(Promise.resolve(), { mode: 'background' })}
      >
        Background
      </button>
      <button type="button" onClick={() => router.push('/orders')}>
        Programmatic
      </button>
      <a href="/packages" onClick={(event) => event.preventDefault()}>
        Paket internal
      </a>
      <a href="/#studio" onClick={(event) => event.preventDefault()}>
        Hash halaman
      </a>
      <a href="https://example.com" onClick={(event) => event.preventDefault()}>
        Eksternal
      </a>
    </>
  );
}

describe('global top loading', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    navigation.push.mockReset();
    navigation.replace.mockReset();
    navigation.back.mockReset();
  });

  afterEach(() => {
    completeNavigation();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('delays short work, keeps concurrent work counted, and completes visibly', () => {
    render(
      <AppLoadingProvider>
        <LoadingHarness />
      </AppLoadingProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Mulai' }));
    act(() => vi.advanceTimersByTime(119));
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByRole('progressbar', { name: 'Memuat pesanan…' })).toBeVisible();

    let second: ReturnType<typeof appLoading.start>;
    act(() => {
      second = appLoading.start('Memuat detail…');
    });
    act(() => vi.advanceTimersByTime(380));
    expect(screen.getByRole('progressbar')).toBeVisible();
    act(() => appLoading.finish(second));
    act(() => vi.advanceTimersByTime(500));
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('does not show background work and always finishes a rejected task', async () => {
    render(
      <AppLoadingProvider>
        <LoadingHarness />
      </AppLoadingProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Background' }));
    act(() => vi.advanceTimersByTime(500));
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();

    const failure = appLoading.track(Promise.reject(new Error('failed')), {
      label: 'Menyimpan…',
    });
    await expect(failure).rejects.toThrow('failed');
    act(() => vi.advanceTimersByTime(500));
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('clears abandoned foreground work through the watchdog', () => {
    render(
      <AppLoadingProvider>
        <LoadingHarness />
      </AppLoadingProvider>,
    );

    act(() => {
      appLoading.start('Menunggu layanan…');
    });
    act(() => vi.advanceTimersByTime(120));
    expect(screen.getByRole('progressbar', { name: 'Menunggu layanan…' })).toBeVisible();

    act(() => vi.advanceTimersByTime(60_000));
    act(() => vi.advanceTimersByTime(500));
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('tracks internal and programmatic navigation but ignores hash and external links', () => {
    render(
      <AppLoadingProvider>
        <LoadingHarness />
      </AppLoadingProvider>,
    );

    fireEvent.click(screen.getByRole('link', { name: 'Hash halaman' }));
    fireEvent.click(screen.getByRole('link', { name: 'Eksternal' }));
    act(() => vi.advanceTimersByTime(150));
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: 'Paket internal' }));
    act(() => vi.advanceTimersByTime(120));
    expect(screen.getByRole('progressbar')).toBeVisible();
    completeNavigation();
    act(() => vi.advanceTimersByTime(500));

    fireEvent.click(screen.getByRole('button', { name: 'Programmatic' }));
    expect(navigation.push).toHaveBeenCalledWith('/orders');
    act(() => vi.advanceTimersByTime(120));
    expect(screen.getByRole('progressbar')).toBeVisible();
  });
});
