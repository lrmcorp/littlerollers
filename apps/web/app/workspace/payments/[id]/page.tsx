import { PaymentReviewDetailView } from './payment-review-detail-view';

export default async function PaymentReviewDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string | string[] }>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const returnTo = typeof query.returnTo === 'string' ? query.returnTo : undefined;
  return <PaymentReviewDetailView id={id} returnTo={returnTo} />;
}
