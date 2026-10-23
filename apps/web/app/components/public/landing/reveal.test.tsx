import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Reveal } from './reveal';

type ObserverCallback = (entries: Array<{ isIntersecting: boolean }>) => void;

let callbacks: ObserverCallback[] = [];
const disconnect = vi.fn();

function mockViewport({ reduceMotion = false, top = 2000 } = {}) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation(() => ({ matches: reduceMotion })),
  );
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: ObserverCallback) {
        callbacks.push(callback);
      }
      observe() {}
      disconnect = disconnect;
    },
  );
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    top,
    bottom: top + 100,
  } as DOMRect);
}

describe('Reveal', () => {
  beforeEach(() => {
    callbacks = [];
    disconnect.mockClear();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('arms elements below the fold and reveals them when they intersect', () => {
    mockViewport();
    render(<Reveal className="x">Konten</Reveal>);
    const el = screen.getByText('Konten');
    expect(el).toHaveAttribute('data-reveal', 'armed');

    act(() => callbacks[0]!([{ isIntersecting: true }]));
    expect(el).toHaveAttribute('data-reveal', 'visible');
    expect(disconnect).toHaveBeenCalled();
  });

  it('keeps content visible without animation when already in the viewport', () => {
    mockViewport({ top: 50 });
    render(<Reveal>Konten</Reveal>);
    expect(screen.getByText('Konten')).not.toHaveAttribute('data-reveal');
  });

  it('does not animate when the user prefers reduced motion', () => {
    mockViewport({ reduceMotion: true });
    render(<Reveal>Konten</Reveal>);
    expect(screen.getByText('Konten')).not.toHaveAttribute('data-reveal');
    expect(callbacks).toHaveLength(0);
  });

  it('keeps content visible when IntersectionObserver is unavailable', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));
    vi.stubGlobal('IntersectionObserver', undefined);
    render(<Reveal as="section">Konten</Reveal>);
    const el = screen.getByText('Konten');
    expect(el.tagName).toBe('SECTION');
    expect(el).not.toHaveAttribute('data-reveal');
  });
});
