async function get<T>(path: string): Promise<T> {
  const response = await fetch(`/api/v1${path}`, { credentials: 'include' });
  if (!response.ok) throw new Error('REQUEST_FAILED');
  return response.json() as Promise<T>;
}

export interface InstructorSummary {
  id: string;
  displayName: string;
  email: string | null;
  phoneE164: string | null;
  status: string;
  assignments: Array<{ id: string; branch: { id: string; code: string; name: string } }>;
  compensationRp: number;
  _count: {
    instructedClassSlots: number;
    instructorAttendances: number;
    instructorHourLogs: number;
  };
}

export const instructorClient = {
  list(input: { q?: string; branchId?: string; cursor?: string }) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(input)) if (value) params.set(key, value);
    return get<{
      items: InstructorSummary[];
      summary: { total: number };
      page: { hasMore: boolean; nextCursor: string | null };
    }>(`/instructors?${params}`);
  },
  detail(id: string) {
    return get<Record<string, any>>(`/instructors/${encodeURIComponent(id)}`);
  },
};
