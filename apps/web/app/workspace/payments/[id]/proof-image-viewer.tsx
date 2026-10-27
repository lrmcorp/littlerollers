'use client';

import { useState } from 'react';
import { Maximize2, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '../../../components/actions';

const ZOOM_STEPS = [1, 1.5, 2, 3] as const;

/** Gambar bukti transfer dengan tinggi minimal 420 px, perbesar, dan putar, supaya angka kecil terbaca. */
export function ProofImageViewer({
  src,
  alt,
  onLoad,
  onError,
}: {
  src: string;
  alt: string;
  /** Dipanggil saat gambar benar-benar tampil di layar (bukan hanya selesai diunduh). */
  onLoad?: () => void;
  onError?: () => void;
}) {
  const [zoomIndex, setZoomIndex] = useState(0);
  const [rotation, setRotation] = useState(0);
  const zoom = ZOOM_STEPS[zoomIndex]!;
  return (
    <div className="mt-5 space-y-2">
      <div className="flex flex-wrap items-center gap-2" role="toolbar" aria-label="Kontrol gambar bukti">
        <Button
          variant="secondary"
          size="sm"
          leadingIcon={<ZoomIn className="size-4" aria-hidden="true" />}
          disabled={zoomIndex === ZOOM_STEPS.length - 1}
          onClick={() => setZoomIndex((index) => Math.min(ZOOM_STEPS.length - 1, index + 1))}
        >
          Perbesar
        </Button>
        <Button
          variant="secondary"
          size="sm"
          leadingIcon={<ZoomOut className="size-4" aria-hidden="true" />}
          disabled={zoomIndex === 0}
          onClick={() => setZoomIndex((index) => Math.max(0, index - 1))}
        >
          Perkecil
        </Button>
        <Button
          variant="secondary"
          size="sm"
          leadingIcon={<RotateCw className="size-4" aria-hidden="true" />}
          onClick={() => setRotation((value) => (value + 90) % 360)}
        >
          Putar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          leadingIcon={<Maximize2 className="size-4" aria-hidden="true" />}
          disabled={zoomIndex === 0 && rotation === 0}
          onClick={() => {
            setZoomIndex(0);
            setRotation(0);
          }}
        >
          Atur ulang
        </Button>
        <span className="text-sm text-dd-muted" aria-live="polite">
          Perbesaran {Math.round(zoom * 100)} persen
        </span>
      </div>
      <div className="min-h-[420px] max-h-[40rem] overflow-auto rounded-dd-lg border border-dd-border-interactive bg-white p-2">
        {/* eslint-disable-next-line @next/next/no-img-element -- blob: URL privat dari server */}
        <img
          src={src}
          alt={alt}
          onLoad={onLoad}
          onError={onError}
          className="mx-auto h-auto max-w-full origin-center"
          style={{ transform: `rotate(${rotation}deg) scale(${zoom})`, transition: 'none' }}
        />
      </div>
    </div>
  );
}
