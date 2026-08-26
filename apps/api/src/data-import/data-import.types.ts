export type ImportTargetTable =
  | 'USERS'
  | 'PACKAGES'
  | 'CUSTOMER_PACKAGES'
  | 'VOUCHERS'
  | 'BRANCHES';

export type RowValidationStatus = 'VALID' | 'DUPLICATE' | 'ERROR';

export type DuplicateResolutionAction = 'SKIP' | 'UPDATE';

export interface ValidatedRowItem {
  rowNumber: number;
  status: RowValidationStatus;
  data: Record<string, any>;
  errors: string[];
  warnings: string[];
  duplicateIdentifier?: string;
}

export interface ValidationSummaryResponse {
  targetTable: ImportTargetTable;
  totalRows: number;
  validCount: number;
  duplicateCount: number;
  errorCount: number;
  rows: ValidatedRowItem[];
}

export interface ImportExecutionRequest {
  targetTable: ImportTargetTable;
  rows: ValidatedRowItem[];
  duplicateAction: DuplicateResolutionAction;
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
