export type CustomerStatus = 'PENDING_ACTIVATION' | 'ACTIVE' | 'INACTIVE';

export interface CustomerSummary {
  id: string;
  displayName: string;
  email: string | null;
  phoneE164: string | null;
  status: CustomerStatus;
  stoppedAt?: string | null;
  isStopped?: boolean;
  version: number;
  verificationStatus: 'PENDING' | 'ACTION_REQUIRED' | 'APPROVED';
  emailVerified: boolean;
  mustChangePassword: boolean;
  activePackageCount: number;
  purchasedSessions: number;
  updatedAt: string;
  preferredBranch: { id: string; code: string; name: string } | null;
  profile: {
    barcode?: string | null;
    address?: string | null;
    genderCode?: string | null;
    gender?: string | null;
    countryCode?: string | null;
    birthDate?: string | null;
    nik?: string | null;
    emergencyContactName?: string | null;
    emergencyContactPhone?: string | null;
    notes?: string | null;
    ktpUrl?: string | null;
    selfieUrl?: string | null;
  } | null;
  _count: { purchases: number; customerBookings: number };
}

export interface CustomerDetailPurchase {
  id: string;
  invoiceNumber?: string;
  status: string;
  packageNameSnapshot?: string;
  priceRpSnapshot?: number;
  payableAmountRpSnapshot?: number;
  submittedAt: string;
  decidedAt?: string | null;
  paymentMethod?: string;
  branchName?: string | null;
  paymentProofUrl?: string | null;
}

export interface CustomerDetailPackage {
  id: string;
  status: string;
  sessionCountSnapshot?: number;
  remainingSessions: number;
  usedSessions: number;
  activationDate?: string | null;
  expiryAt?: string | null;
  package?: { name: string; sessionCount?: number };
}

export interface CustomerDetailBooking {
  id: string;
  bookingNumber?: string;
  status: string;
  classSlotId: string;
  createdAt: string;
  cancelledAt?: string | null;
  classTypeName?: string;
  instructorName?: string;
  startAt?: string;
  endAt?: string;
  branchName?: string | null;
  attendanceStatus?: string;
}

export interface CustomerDetailDocument {
  id?: string;
  kind: string;
  status: string;
  fileName?: string;
  reviewedAt: string | null;
  uploadedAt?: string | null;
  url?: string;
}

export interface CustomerList {
  items: CustomerSummary[];
  summary: { total: number };
  page: { hasMore: boolean; nextCursor: string | null };
}

export interface CustomerDetail extends CustomerSummary {
  createdAt: string;
  identities: Array<{ provider: string; verifiedAt: string | null; createdAt: string }>;
  identityDocuments: CustomerDetailDocument[];
  passwordCredential: {
    verifiedAt: string | null;
    passwordChangedAt: string;
    mustChangePassword: boolean;
  } | null;
  purchases: CustomerDetailPurchase[];
  customerPackages: CustomerDetailPackage[];
  customerBookings: CustomerDetailBooking[];
  voucherRedemptions: Array<Record<string, unknown>>;
  notifications: Array<Record<string, unknown>>;
  _count: {
    purchases: number;
    customerBookings: number;
    customerPackages: number;
    voucherRedemptions: number;
    notifications: number;
  };
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/v1${url}`, {
    credentials: 'include',
    ...init,
    headers: { 'content-type': 'application/json', ...init?.headers },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { code?: string };
    throw Object.assign(new Error(body.code || 'REQUEST_FAILED'), {
      status: response.status,
      code: body.code,
    });
  }
  return response.json() as Promise<T>;
}

export const customerClient = {
  list(input: Record<string, string | undefined>) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(input)) if (value) query.set(key, value);
    return request<CustomerList>(`/customers?${query}`);
  },
  detail(id: string) {
    return request<CustomerDetail>(`/customers/${encodeURIComponent(id)}`);
  },
  create(input: Record<string, unknown>, options: { stepUpToken?: string; idempotencyKey: string }) {
    return request<CustomerSummary>('/customers', {
      method: 'POST',
      headers: {
        // Backend belum memvalidasi step-up untuk pembuatan customer; kirim hanya bila ada.
        ...(options.stepUpToken ? { 'x-customer-step-up': options.stepUpToken } : {}),
        'idempotency-key': options.idempotencyKey,
      },
      body: JSON.stringify(input),
    });
  },
  updateProfile(
    id: string,
    input: Record<string, unknown>,
    options: { stepUpToken: string; idempotencyKey: string },
  ) {
    return request<{ id: string; version: number }>(
      `/customers/${encodeURIComponent(id)}/profile`,
      {
        method: 'PATCH',
        headers: {
          'x-customer-step-up': options.stepUpToken,
          'idempotency-key': options.idempotencyKey,
        },
        body: JSON.stringify(input),
      },
    );
  },
  setStatus(
    id: string,
    action: 'deactivate' | 'reactivate',
    input: { expectedVersion: number; reason: string },
    options: { stepUpToken: string; idempotencyKey: string },
  ) {
    return request<{ id: string; status: CustomerStatus; version: number }>(
      `/customers/${encodeURIComponent(id)}/${action}`,
      {
        method: 'POST',
        headers: {
          'x-customer-step-up': options.stepUpToken,
          'idempotency-key': options.idempotencyKey,
        },
        body: JSON.stringify(input),
      },
    );
  },
  markStopped(id: string, reason?: string) {
    return request<{ id: string; stoppedAt: string | null; isStopped: boolean; status: CustomerStatus }>(
      `/customers/${encodeURIComponent(id)}/mark-stopped`,
      {
        method: 'POST',
        body: JSON.stringify({ reason }),
      },
    );
  },
  unmarkStopped(id: string) {
    return request<{ id: string; stoppedAt: null; isStopped: boolean; status: CustomerStatus }>(
      `/customers/${encodeURIComponent(id)}/unmark-stopped`,
      {
        method: 'POST',
      },
    );
  },
};

