import { resolvePublicImageUrl } from './public-image-url';

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export interface UploadImageResult {
  key: string;
  url: string;
  filename: string;
  sizeBytes?: number;
  mimeType?: string;
}

/**
 * Universal client-side image uploader.
 * Handles validation, base64 encoding, and uploading to the backend media API.
 */
export async function uploadImage(file: File, _folder?: string): Promise<UploadImageResult> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number])) {
    throw new Error('Format gambar tidak didukung. Harap pilih berkas JPG, PNG, atau WEBP.');
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error('Ukuran gambar melebihi batas maksimal 5 MB.');
  }

  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Gagal membaca berkas gambar.'));
    reader.readAsDataURL(file);
  });

  const res = await fetch('/api/v1/public-content-management/media-uploads', {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filename: file.name,
      mimeType: file.type,
      contentBase64: base64Data,
    }),
  });

  if (!res.ok) {
    let errorDetail = '';
    try {
      const errJson = await res.json();
      errorDetail = errJson.message || errJson.error || '';
    } catch {
      // Ignore json parse error
    }
    throw new Error(errorDetail ? `Upload gagal: ${errorDetail}` : `Gagal mengunggah gambar (${res.status})`);
  }

  const data = (await res.json()) as { key?: string; url?: string; filename?: string; sizeBytes?: number; mimeType?: string };
  const key = data.key || data.url || data.filename || '';

  return {
    key,
    url: data.url || `/api/v1/public-media/${key}`,
    filename: data.filename || file.name,
    sizeBytes: data.sizeBytes ?? file.size,
    mimeType: data.mimeType ?? file.type,
  };
}

/**
 * Universal resolver to get the accessible URL for any image key or absolute URL.
 * Aliased to resolvePublicImageUrl for clean media imports.
 */
export const resolveImageUrl = resolvePublicImageUrl;
