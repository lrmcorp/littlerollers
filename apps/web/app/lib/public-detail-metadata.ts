const apiBase = process.env.API_BASE_URL ?? 'http://127.0.0.1:32121';

export async function publicMetadataValue<T>(path: string, noStore = false): Promise<T | null> {
  try {
    const response = await fetch(
      `${apiBase}/api/v1${path}`,
      noStore
        ? { cache: 'no-store', headers: { Accept: 'application/json' } }
        : { next: { revalidate: 300 }, headers: { Accept: 'application/json' } },
    );
    if (!response.ok) return null;
    return response.json() as Promise<T>;
  } catch {
    return null;
  }
}
