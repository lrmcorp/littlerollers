export class SupportApiError extends Error {
  constructor(
    readonly status: number,
    readonly code?: string,
  ) {
    super(code ?? `HTTP_${status}`);
  }
}

export async function supportApi<T = any>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/v1${path}`, {
    credentials: 'include',
    ...init,
    headers: { 'content-type': 'application/json', ...init?.headers },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      code?: string;
      error?: { code?: string };
    };
    throw new SupportApiError(response.status, body.code ?? body.error?.code);
  }
  return response.json() as Promise<T>;
}

const messages: Record<string, string> = {
  STALE_VERSION: 'Kasus ini diubah orang lain. Muat ulang halaman lalu ulangi perubahan Anda.',
  RESOURCE_NOT_FOUND: 'Kasus tidak ditemukan atau berada di luar cakupan cabang Anda.',
  FORBIDDEN: 'Anda tidak memiliki izin mengelola kasus bantuan.',
  VALIDATION_ERROR: 'Data belum valid. Periksa isian lalu coba lagi.',
};

export function supportFailure(error: unknown, fallback: string): string {
  const typed = error as { status?: number; code?: string };
  if (typed?.code && messages[typed.code]) return messages[typed.code]!;
  if (typed?.status === 403) return messages.FORBIDDEN!;
  if (typed?.status === 404) return messages.RESOURCE_NOT_FOUND!;
  if (typed?.status === 409) return messages.STALE_VERSION!;
  if (typed?.status === 400 || typed?.status === 422) return messages.VALIDATION_ERROR!;
  return fallback;
}
