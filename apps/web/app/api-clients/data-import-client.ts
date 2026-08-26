export type ImportTargetTable =
  | 'USERS'
  | 'PACKAGES'
  | 'CUSTOMER_PACKAGES'
  | 'VOUCHERS'
  | 'BRANCHES';

export type ImportRowStatus = 'VALID' | 'DUPLICATE' | 'ERROR';

export interface ImportRowPreview {
  rowNumber: number;
  status: ImportRowStatus;
  errors: string[];
  warnings: string[];
  data: Record<string, any>;
  duplicateIdentifier?: string;
}

export interface ImportValidationResult {
  targetTable: ImportTargetTable;
  totalRows: number;
  validCount: number;
  duplicateCount: number;
  errorCount: number;
  rows: ImportRowPreview[];
}

export interface ImportExecutionResult {
  targetTable: ImportTargetTable;
  totalProcessed: number;
  insertedCount: number;
  updatedCount: number;
  skippedCount: number;
  errorCount: number;
  errors: Array<{ rowNumber: number; message: string }>;
}

export interface ImportExecutionRequest {
  targetTable: ImportTargetTable;
  rows: ImportRowPreview[];
  duplicateAction: 'SKIP' | 'UPDATE';
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/v1/data-import${path}`, {
    credentials: 'include',
    ...init,
    headers: { 'content-type': 'application/json', ...init?.headers },
  });
  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    const msg = (errBody as { message?: string }).message ?? `DATA_IMPORT_API_${response.status}`;
    throw new Error(msg);
  }
  return response.json() as Promise<T>;
}

export const browserDataImportClient = {
  /**
   * Download template Excel/CSV for the given table.
   * Returns a Blob so the caller can trigger a browser download.
   */
  downloadTemplate: async (
    targetTable: ImportTargetTable,
    format: 'xlsx' | 'csv' = 'xlsx',
  ): Promise<{ blob: Blob; filename: string }> => {
    const response = await fetch(
      `/api/v1/data-import/templates/${targetTable}?format=${format}`,
      { credentials: 'include' },
    );
    if (!response.ok) throw new Error(`TEMPLATE_DOWNLOAD_${response.status}`);
    const disposition = response.headers.get('content-disposition') ?? '';
    const filenameMatch = /filename="([^"]+)"/.exec(disposition);
    const filename = filenameMatch?.[1] ?? `template-${targetTable.toLowerCase()}.${format}`;
    const blob = await response.blob();
    return { blob, filename };
  },

  /**
   * Validate an uploaded file (Base64-encoded) and return a row-by-row preview.
   */
  validate: (body: {
    targetTable: ImportTargetTable;
    fileBase64: string;
    filename?: string;
  }) =>
    request<ImportValidationResult>('/validate', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  /**
   * Execute the import (insert / upsert) into the database.
   */
  execute: (body: ImportExecutionRequest) =>
    request<ImportExecutionResult>('/execute', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};
