export type BankFormat = 'GENERIC' | 'BCA' | 'MANDIRI';

export interface RawBankMutationRow {
  bankName: string;
  accountNumber?: string;
  transactionDate: Date;
  amountRp: number;
  description: string;
  referenceNumber?: string;
}

export interface BankMutationImportResult {
  totalParsed: number;
  insertedCount: number;
  duplicateCount: number;
  mutations: Array<{
    id: string;
    bankName: string;
    transactionDate: Date;
    amountRp: number;
    description: string;
    referenceNumber: string | null;
    status: string;
  }>;
}

export interface ReconciliationOutcome {
  totalProcessed: number;
  matchedCount: number;
  manualReviewCount: number;
  unmatchedCount: number;
  details: Array<{
    mutationId: string;
    amountRp: number;
    status: 'MATCHED' | 'MANUAL_REVIEW' | 'UNMATCHED';
    matchedPurchaseId?: string;
    invoiceNumber?: string;
    customerName?: string;
    reason?: string;
  }>;
}
