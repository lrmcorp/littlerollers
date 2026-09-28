export class ContentApiError extends Error {
  constructor(
    readonly status: number,
    readonly code?: string,
    readonly details: Array<{ field?: string; issue?: string }> = [],
  ) {
    super(code ?? `HTTP_${status}`);
  }
}

export async function request(path: string, init?: RequestInit) {
  const r = await fetch(`/api/v1${path}`, {
    credentials: 'include',
    ...init,
    headers: { 'content-type': 'application/json', ...init?.headers },
  });
  if (!r.ok) {
    const body = (await r.json().catch(() => ({}))) as {
      error?: { code?: string; details?: Array<{ field?: string; issue?: string }> };
    };
    throw new ContentApiError(r.status, body.error?.code, body.error?.details ?? []);
  }
  return r.json();
}

/** Pesan Indonesia untuk kegagalan simpan/terbit konten. `faq` memakai kata-kata untuk FAQ, bukan slider. */
export function contentFailure(error: unknown, fallback: string, context: 'slider' | 'faq' = 'slider'): string {
  const failure = error as ContentApiError;
  const issues = failure?.details?.map((detail) => detail.issue) ?? [];
  if (failure?.code === 'VALIDATION_ERROR') {
    if (context === 'faq') {
      if (issues.includes('TOO_SHORT')) return 'Pertanyaan dan jawaban minimal 5 karakter.';
      if (issues.includes('REQUIRED')) return 'Pertanyaan dan jawaban setiap butir wajib diisi.';
      if (issues.includes('TOO_LONG'))
        return 'Ada pertanyaan (maks. 200 karakter) atau jawaban (maks. 1500 karakter) yang terlalu panjang.';
      return 'Isi FAQ belum valid. Isi minimal 1 dan maksimal 50 pertanyaan.';
    }
    if (issues.includes('UNSAFE_URL'))
      return 'Alamat gambar atau tautan tombol tidak aman. Gunakan alamat relatif (mis. /packages) atau https.';
    if (issues.includes('REQUIRED')) return 'Judul, deskripsi, dan gambar setiap slide wajib diisi.';
    if (issues.includes('TOO_LONG')) return 'Ada teks slide yang terlalu panjang. Persingkat lalu coba lagi.';
    return 'Isi slider belum valid. Periksa jumlah slide (maks. 10), durasi, dan isian setiap slide.';
  }
  if (failure?.code === 'INVALID_STATE')
    return 'Konten ini sudah tidak berstatus draf. Muat ulang halaman lalu coba lagi.';
  if (failure?.status === 403 || failure?.status === 404)
    return context === 'faq'
      ? 'Anda tidak memiliki izin mengelola FAQ.'
      : 'Anda tidak memiliki izin mengelola konten beranda.';
  return fallback;
}
