'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface DelayedActionState {
  label: string;
  secondsLeft: number;
}

/**
 * Menunda sebuah aksi (mis. keputusan uang atau identitas) selama beberapa detik agar petugas masih bisa
 * membatalkannya sebelum dikirim ke server. Setelah terkirim, aksinya tidak bisa dibalik. Bila halaman ditutup
 * saat menunggu, aksi dikirim (petugas sudah memutuskan), bukan dibuang.
 */
export function useDelayedAction(delayMs = 10_000) {
  const [pending, setPending] = useState<DelayedActionState | null>(null);
  const runRef = useRef<(() => void | Promise<void>) | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (tickRef.current) clearInterval(tickRef.current);
    timerRef.current = null;
    tickRef.current = null;
  }, []);

  /** Kirim sekarang (dipakai timer, dan saat halaman ditutup). */
  const flush = useCallback(() => {
    const run = runRef.current;
    runRef.current = null;
    clearTimers();
    setPending(null);
    if (run) void run();
  }, [clearTimers]);

  /** Jadwalkan aksi; mengembalikan false bila sudah ada aksi yang menunggu. */
  const schedule = useCallback(
    (label: string, run: () => void | Promise<void>) => {
      if (runRef.current) return false;
      runRef.current = run;
      setPending({ label, secondsLeft: Math.max(0, Math.ceil(delayMs / 1000)) });
      timerRef.current = setTimeout(flush, Math.max(0, delayMs));
      tickRef.current = setInterval(
        () => setPending((current) => (current ? { ...current, secondsLeft: Math.max(0, current.secondsLeft - 1) } : current)),
        1000,
      );
      return true;
    },
    [delayMs, flush],
  );

  /** Batalkan sebelum terkirim. */
  const cancel = useCallback(() => {
    runRef.current = null;
    clearTimers();
    setPending(null);
  }, [clearTimers]);

  useEffect(
    () => () => {
      const run = runRef.current;
      runRef.current = null;
      clearTimers();
      if (run) void run();
    },
    [clearTimers],
  );

  return { pending, schedule, cancel, flush };
}
