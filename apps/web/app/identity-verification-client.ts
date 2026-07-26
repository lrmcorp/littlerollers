'use client';

export type VerificationStatus = 'PENDING' | 'ACTION_REQUIRED' | 'APPROVED';
export type DocumentKind = 'SELFIE' | 'KTP_FRONT';

export interface VerificationDocument {
  id: string;
  kind: DocumentKind;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DELETED';
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

export interface FileMetadata {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  sha256: string;
}

async function request(path: string, init?: RequestInit) {
  const response = await fetch(`/api/v1${path}`, {
    credentials: 'include',
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!response.ok) throw { response: { status: response.status }, body: await response.text() };
  return response.status === 204 ? undefined : response.json();
}

export async function fileMetadata(file: File): Promise<FileMetadata> {
  const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
  return {
    fileName: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
    sha256: [...new Uint8Array(digest)]
      .map((value) => value.toString(16).padStart(2, '0'))
      .join(''),
  };
}

export const verificationClient = {
  register(input: {
    displayName: string;
    phone: string;
    email: string;
    password: string;
    consent: boolean;
    selfie: FileMetadata;
    ktp: FileMetadata;
  }) {
    return request('/auth/customer-registrations', { method: 'POST', body: JSON.stringify(input) });
  },
  mine(): Promise<VerificationSummary> {
    return request('/identity-verification/me');
  },
  replace(kind: DocumentKind, input: FileMetadata & { expectedVersion: number }) {
    return request(`/identity-verification/me/documents/${kind}/replacements`, {
      method: 'POST',
      body: JSON.stringify(input),
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
