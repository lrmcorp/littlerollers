import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDelayedAction } from './use-delayed-action';

describe('useDelayedAction', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('sends the action only after the delay, counting down in seconds', () => {
    const run = vi.fn();
    const { result } = renderHook(() => useDelayedAction(10_000));
    act(() => {
      result.current.schedule('Setujui pembayaran', run);
    });
    expect(result.current.pending).toEqual({ label: 'Setujui pembayaran', secondsLeft: 10 });
    act(() => vi.advanceTimersByTime(4_000));
    expect(result.current.pending?.secondsLeft).toBe(6);
    expect(run).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(6_000));
    expect(run).toHaveBeenCalledTimes(1);
    expect(result.current.pending).toBeNull();
  });

  it('never sends a cancelled action', () => {
    const run = vi.fn();
    const { result } = renderHook(() => useDelayedAction(10_000));
    act(() => {
      result.current.schedule('Tolak', run);
    });
    act(() => result.current.cancel());
    act(() => vi.advanceTimersByTime(20_000));
    expect(run).not.toHaveBeenCalled();
    expect(result.current.pending).toBeNull();
  });

  it('accepts one waiting action at a time', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { result } = renderHook(() => useDelayedAction(10_000));
    act(() => {
      expect(result.current.schedule('A', first)).toBe(true);
      expect(result.current.schedule('B', second)).toBe(false);
    });
    act(() => vi.advanceTimersByTime(10_000));
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).not.toHaveBeenCalled();
  });

  it('sends a waiting decision when the page is closed instead of dropping it', () => {
    const run = vi.fn();
    const { result, unmount } = renderHook(() => useDelayedAction(10_000));
    act(() => {
      result.current.schedule('Setujui', run);
    });
    unmount();
    expect(run).toHaveBeenCalledTimes(1);
  });
});
