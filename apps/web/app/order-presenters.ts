import type { CustomerOrderTimelineType, OrderStatus } from './order-client';

export const orderStatusLabels: Record<OrderStatus, string> = {
  AWAITING_PAYMENT: 'Waiting for payment',
  PENDING: 'Being checked',
  ACTION_REQUIRED: 'Needs a fix',
  APPROVED: 'Approved',
  REJECTED: 'Not approved',
  EXPIRED: 'Expired',
};

export const orderReasonLabels: Record<string, string> = {
  PROOF_INVALID: 'We could not read the proof of payment. Upload a clearer photo or file.',
  AMOUNT_MISMATCH: 'The amount transferred does not match the total to pay.',
  DUPLICATE_PURCHASE: 'This order looks like a duplicate of another one.',
  OTHER_REVIEW_REQUIRED: 'The proof of payment needs another look or a fix.',
};

export function formatPaymentCode(code: number | null) {
  return code == null ? null : String(code).padStart(3, '0');
}

export const orderTimelineLabels: Record<
  CustomerOrderTimelineType,
  { title: string; description: string }
> = {
  ORDER_CREATED: {
    title: 'Order placed',
    description: 'We saved the price, package and club for this order.',
  },
  PAYMENT_DEADLINE_SET: {
    title: 'Payment deadline set',
    description: 'Please pay before the order expires.',
  },
  PROOF_SUBMITTED: {
    title: 'Proof of payment received',
    description: 'Your file was received and stored privately.',
  },
  PROOF_SCAN_COMPLETED: {
    title: 'File check finished',
    description: 'The file passed the safety check and is ready to review.',
  },
  ACTION_REQUIRED: {
    title: 'Fix requested',
    description: 'Our finance team asked for a new proof of payment.',
  },
  PAYMENT_APPROVED: {
    title: 'Payment approved',
    description: 'Our team confirmed your payment.',
  },
  PAYMENT_REJECTED: {
    title: 'Payment not approved',
    description: 'The order was closed after the payment check.',
  },
  ORDER_EXPIRED: {
    title: 'Order expired',
    description: 'The payment deadline passed.',
  },
  PACKAGE_ACTIVATED: {
    title: 'Package activated',
    description: 'The sessions were added to your account.',
  },
};
