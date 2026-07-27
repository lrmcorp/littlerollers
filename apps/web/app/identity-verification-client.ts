'use client';

export type VerificationStatus = 'PENDING' | 'ACTION_REQUIRED' | 'APPROVED';
export type DocumentKind = 'SELFIE' | 'KTP_FRONT';

export interface VerificationDocument {
  id: string;
  kind: DocumentKind;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PENDING_DELETION' | 'DELETE_FAILED' | 'DELETED';
  uploadStatus: string;
  scanStatus: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  rejectionReasonCode: string | null;
  rejectionNote: string | null;
  reviewedAt: string | null;
  deletedAt: string | null;
  version: number;
  user?: { id: string; displayName: string; phoneE164: string | null };
}

export interface VerificationSummary {
  status: VerificationStatus;
  documents: VerificationDocument[];
}

async function request(path: string, init?: RequestInit) {
  const isMultipart = init?.body instanceof FormData;
  const response = await fetch(`/api/v1${path}`, {
    credentials: 'include',
    ...init,
    headers: {
      ...(isMultipart ? {} : { 'Content-Type': 'application/json' }),
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) throw { response: { status: response.status }, body: await response.text() };
  return response.status === 204 ? undefined : response.json();
}

export const verificationClient = {
  register(input: {
    displayName: string;
    phone: string;
    email: string;
    password: string;
    consent: boolean;
    selfie: File;
    ktp: File;
  }) {
    const form = new FormData();
    form.set('displayName', input.displayName);
    form.set('phone', input.phone);
    form.set('email', input.email);
    form.set('password', input.password);
    form.set('consent', String(input.consent));
    form.set('selfie', input.selfie);
    form.set('ktp', input.ktp);
    return request('/auth/customer-registrations', { method: 'POST', body: form });
  },
  mine(): Promise<VerificationSummary> {
    return request('/identity-verification/me');
  },
  authorizeMine(kind: DocumentKind): Promise<{ url: string; expiresAt: string }> {
    return request(`/identity-verification/me/documents/${kind}/view-authorizations`, {
      method: 'POST',
    });
  },
  async readPrivateFile(url: string): Promise<Blob> {
    const response = await fetch(url, {
      credentials: 'include',
      cache: 'no-store',
      referrerPolicy: 'no-referrer',
    });
    if (!response.ok) throw { response: { status: response.status } };
    return response.blob();
  },
  replace(kind: DocumentKind, input: { file: File; expectedVersion: number }) {
    const form = new FormData();
    form.set('replacement', input.file);
    form.set('expectedVersion', String(input.expectedVersion));
    return request(`/identity-verification/me/documents/${kind}/replacements`, {
      method: 'POST',
      body: form,
    });
  },
  reviewQueue(status = 'PENDING'): Promise<{ items: VerificationDocument[] }> {
    return request(`/identity-verifications?status=${encodeURIComponent(status)}`);
  },
  decide(
    id: string,
    decision: 'approve' | 'reject',
    input: { expectedVersion: number; reasonCode?: string; note?: string },
  ) {
    return request(`/identity-verifications/${id}/decisions/${decision}`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
  authorizeView(id: string): Promise<{ url: string; expiresAt: string }> {
    return request(`/identity-verifications/${id}/view-authorizations`, { method: 'POST' });
  },
  delete(id: string, input: { expectedVersion: number; reason: string }) {
    return request(`/identity-verifications/${id}/delete`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
};
