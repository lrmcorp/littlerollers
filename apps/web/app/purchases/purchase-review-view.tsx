'use client';
import { useState } from 'react';
import {
  browserPurchaseReviewClient,
  purchaseFailure,
  type PurchaseReviewClient,
  type ReviewPurchase,
} from '../purchase-client';
import { ConfirmationPanel, EmptyState, Feedback, Skeleton, StatusBadge } from '../ui';
import { useActiveBranchState, useSessionContext } from '../session-context';

export function PurchaseReviewView({
  client = browserPurchaseReviewClient,
}: {
  client?: PurchaseReviewClient;
}) {
  const [branchId, setBranchId] = useActiveBranchState();
  const sessionContext = useSessionContext();
  const canReview = !sessionContext || sessionContext.hasCapability('purchase:review');
  const canDecide = !sessionContext || sessionContext.hasCapability('purchase:decide');
  const hasMfa = !sessionContext || sessionContext.session?.assurance === 'MFA';
  const [items, setItems] = useState<ReviewPurchase[]>([]);
  const [selected, setSelected] = useState<ReviewPurchase | null>(null);
  const [reasonCode, setReasonCode] = useState<
    'PROOF_INVALID' | 'AMOUNT_MISMATCH' | 'DUPLICATE_PURCHASE' | 'OTHER_REVIEW_REQUIRED'
  >('PROOF_INVALID');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const run = async (action: () => Promise<void>) => {
    setLoading(true);
    setError('');
    try {
      await action();
    } catch (cause) {
      setError(purchaseFailure(cause));
    } finally {
      setLoading(false);
    }
  };
  const decided = async (status: 'APPROVED' | 'REJECTED') => {
    setItems((current) =>
      current.map((item) =>
        item.id === selected?.id ? { ...item, status, version: item.version + 1 } : item,
      ),
    );
    setSelected(null);
    setMessage(`Purchase ${status}.`);
  };
  return (
    <section className="card" aria-labelledby="review-title">
      <p className="eyebrow">Internal decision queue</p>
      <h2 id="review-title">Review purchase</h2>
      <div className="context-bar">
        <StatusBadge tone="warning">MFA wajib</StatusBadge>
      </div>
      <label>
        Cabang review
        <input value={branchId} onChange={(event) => setBranchId(event.target.value)} />
      </label>
      <button
        disabled={!branchId || loading || !canReview}
        onClick={() =>
          run(async () => {
            const result = await client.list(branchId);
            setItems(result);
            setMessage(result.length ? 'Queue dimuat.' : 'Queue kosong.');
          })
        }
      >
        Muat queue
      </button>
      <ul aria-label="Purchase pending">
        {items.map((item) => (
          <li key={item.id}>
            <button disabled={item.status !== 'PENDING'} onClick={() => setSelected(item)}>
              {item.packageNameSnapshot} · Rp{item.priceRpSnapshot} · {item.status}
            </button>
          </li>
        ))}
      </ul>
      {!loading && items.length === 0 && (
        <EmptyState
          title="Queue kosong"
          description="Pilih cabang dan muat purchase yang menunggu keputusan."
        />
      )}
      {selected && (
        <div role="dialog" aria-modal="true" aria-labelledby="decision-title">
          <h3 id="decision-title">Konfirmasi keputusan</h3>
          <ConfirmationPanel title="Konsekuensi keputusan">
            Approval membuat customer package dan ledger PURCHASE. Rejection tidak mengubah saldo.
          </ConfirmationPanel>
          <p>
            {selected.packageNameSnapshot} · {selected.sessionCountSnapshot} sesi
          </p>
          <button
            disabled={!canReview}
            onClick={() =>
              run(async () => {
                const proof = await client.authorizeProof(selected.paymentProofId);
                setMessage(`Proof tersedia sampai ${proof.expiresAt.toISOString()}.`);
              })
            }
          >
            Buka proof privat
          </button>
          <button
            disabled={!canDecide || !hasMfa}
            onClick={() =>
              run(async () =>
                decided(await client.approve(selected.id, selected.version, crypto.randomUUID())),
              )
            }
          >
            Setujui purchase
          </button>
          <label>
            Kode penolakan
            <select
              value={reasonCode}
              onChange={(event) => setReasonCode(event.target.value as typeof reasonCode)}
            >
              <option>PROOF_INVALID</option>
              <option>AMOUNT_MISMATCH</option>
              <option>DUPLICATE_PURCHASE</option>
              <option>OTHER_REVIEW_REQUIRED</option>
            </select>
          </label>
          <button
            disabled={!canDecide || !hasMfa}
            onClick={() =>
              run(async () =>
                decided(
                  await client.reject(
                    selected.id,
                    selected.version,
                    reasonCode,
                    crypto.randomUUID(),
                  ),
                ),
              )
            }
          >
            Tolak purchase
          </button>
          <button onClick={() => setSelected(null)}>Batal</button>
        </div>
      )}
      {loading && <Skeleton label="Memproses keputusan purchase" />}
      {message && !loading && <Feedback kind="status">{message}</Feedback>}
      {error && <Feedback kind="error">{error}</Feedback>}
    </section>
  );
}
