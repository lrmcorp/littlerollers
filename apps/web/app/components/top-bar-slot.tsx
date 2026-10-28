'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/** Id elemen di bilah atas staf tempat halaman boleh menaruh kontrolnya sendiri. */
export const TOP_BAR_START_ID = 'dd-topbar-start';

/**
 * Menaruh kontrol halaman di sisi kiri bilah atas, menggantikan nama halaman.
 *
 * Mockup timetable menaruh navigasi minggu di bilah atas, bukan di badan halaman. Bilah atas
 * dimiliki kerangka aplikasi, jadi halaman mengirim isinya lewat portal. Bila kerangka tidak ada
 * (mis. komponen dirender sendirian di tes), isinya tampil di tempat agar tetap bisa dipakai.
 */
export function TopBarSlot({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<HTMLElement | null | undefined>(undefined);

  useEffect(() => {
    setTarget(document.getElementById(TOP_BAR_START_ID));
  }, []);

  // Belum tahu ada bilah atas atau tidak: jangan render dulu supaya tidak berkedip pindah tempat.
  if (target === undefined) return null;

  const isi = (
    <div
      data-topbar-override
      className="flex min-w-0 items-center gap-2.5 [&>*]:shrink-0 [&>:last-child]:shrink"
    >
      {children}
    </div>
  );
  return target ? createPortal(isi, target) : isi;
}
