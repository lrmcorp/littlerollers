'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';

/**
 * `next/image` yang jatuh ke gambar cadangan bila berkas tidak ada (mis. kunci gambar di database yang
 * menunjuk berkas yang belum diunggah), sehingga halaman publik tidak menampilkan gambar rusak.
 */
export function ResilientImage({
  src,
  fallbackSrc = '/images/public/studios/studio-reception.png',
  alt,
  ...props
}: Omit<ImageProps, 'src'> & { src: string; fallbackSrc?: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = failedSrc === src;
  return (
    <Image
      {...props}
      alt={alt}
      src={failed ? fallbackSrc : src}
      onError={(event) => {
        if (src !== fallbackSrc) setFailedSrc(src);
        props.onError?.(event);
      }}
    />
  );
}
