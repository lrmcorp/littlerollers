'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
} from 'react';

type RevealState = 'static' | 'armed' | 'visible';

// useLayoutEffect agar status "armed" terpasang sebelum paint (tidak ada kedip).
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

type RevealProps = {
  children: ReactNode;
  /** Elemen pembungkus. Default `div`. */
  as?: ElementType;
  className?: string;
  /** Rasio elemen yang terlihat sebelum animasi dimulai. */
  threshold?: number;
};

/**
 * Fade + naik 25px saat elemen masuk viewport (gaya "Editorial Calm").
 *
 * - SSR dan tanpa JS: konten selalu terlihat (state `static`).
 * - Elemen yang sudah berada di viewport saat mount tidak dianimasikan.
 * - `prefers-reduced-motion` atau tanpa IntersectionObserver: langsung terlihat.
 * Gaya ada di `tailwind.css` lewat atribut `data-reveal`.
 */
export function Reveal({ children, as: Tag = 'div', className, threshold = 0.05 }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [state, setState] = useState<RevealState>('static');

  useIsomorphicLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || typeof IntersectionObserver === 'undefined') return;

    // Sudah terlihat di layar saat load → biarkan tampil tanpa animasi.
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) return;

    setState('armed');
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setState('visible');
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <Tag ref={ref} className={className} data-reveal={state === 'static' ? undefined : state}>
      {children}
    </Tag>
  );
}
