import { foregroundFetch } from '../components/app-loading';

export type ApiFetchOptions = RequestInit & {
  label?: string;
  idempotent?: boolean;
};

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Universal direct-typed HTTP client helper for Dailydose Web Admin.
 * Handles baseUrl (/api/v1), automatic JSON parsing, credentials, and UI top-loader progress.
 */
export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { label = 'Memuat data…', idempotent = false, headers, ...rest } = options;
  const url = path.startsWith('/api/')
    ? path
    : `/api/v1${path.startsWith('/') ? path : `/${path}`}`;

  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...((headers as Record<string, string>) || {}),
  };

  if (options.body && typeof options.body === 'string' && !requestHeaders['Content-Type']) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (idempotent && !requestHeaders['idempotency-key']) {
    requestHeaders['idempotency-key'] = crypto.randomUUID();
  }

  const response = await foregroundFetch(
    url,
    {
      credentials: 'include',
      headers: requestHeaders,
      ...rest,
    },
    label,
  );

  if (!response.ok) {
    let errorData: unknown = null;
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      errorData = await response.json();
      if (typeof errorData === 'object' && errorData !== null) {
        const payload = errorData as Record<string, unknown>;
        if (typeof payload.message === 'string') errorMessage = payload.message;
        else if (typeof payload.detail === 'string') errorMessage = payload.detail;
        else if (typeof payload.title === 'string') errorMessage = payload.title;
      }
    } catch {
      // Body is not JSON, use status text
      if (response.statusText) errorMessage = response.statusText;
    }

    throw new ApiError(errorMessage, response.status, errorData);
  }

  // Handle empty responses (204 No Content, etc.)
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as unknown as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}
