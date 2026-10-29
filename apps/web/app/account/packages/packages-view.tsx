'use client';

import { useCallback, useEffect, useState } from 'react';
import { browserLedgerClient, type LedgerBalance } from '../../ledger-client';
import { ButtonLink } from '../../components/actions';
import { EmptyState, Feedback, PageHeader, Skeleton, StatusBadge } from '../../ui';
import { Pagination } from '../../components/admin/admin-ui';

export function CustomerPackagesView() {
  const [items, setItems] = useState<LedgerBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cursor, setCursor] = useState<string>();
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>();
  const [total, setTotal] = useState(0);

  const loadPage = useCallback(async (pageCursor?: string) => {
    setLoading(true);
    setError('');
    try {
      const value = await browserLedgerClient.list(undefined, pageCursor);
      setItems(value.items);
      setNextCursor(value.nextCursor);
      setTotal(value.summary.packageCount);
      setCursor(pageCursor);
      return true;
    } catch {
      setError('Your packages did not load. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPage();
  }, [loadPage]);
  return (
    <main className="space-y-6">
      <PageHeader
        variant="customer"
        eyebrow="Packages"
        title="My packages"
        description="Sessions left on each package and how long it stays valid."
        context={
          <ButtonLink variant="secondary" size="sm" href="/packages">
            Buy a package
          </ButtonLink>
        }
      />
      {error && <Feedback kind="error">{error}</Feedback>}
      {loading ? (
        <Skeleton label="Loading your packages" />
      ) : items.length === 0 ? (
        <EmptyState
          title="No active packages yet"
          description="A package appears here once we approve the payment for it."
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((item) => (
              <article
                className="rounded-[22px] border border-dd-line bg-white p-5 sm:p-6"
                key={item.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="m-0 text-sm font-semibold text-dd-forest">
                      {item.branchName ?? 'Little Rollers'}
                    </p>
                    <h2 className="mt-1 mb-0 font-display text-xl text-dd-forest">
                      {item.packageName ?? 'Package'}
                    </h2>
                    <p className="mt-1 text-sm text-dd-muted">
                      {item.classTypeName ?? 'Class'} ·{' '}
                      {(item.sessionDurationMinutesSnapshot ?? 60) >= 120 ? '2-hour' : '1-hour'}{' '}
                      sessions
                    </p>
                  </div>
                  <StatusBadge tone={item.status === 'ACTIVE' ? 'success' : 'warning'}>
                    {item.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                  </StatusBadge>
                </div>
                <dl className="mt-5 grid grid-cols-3 gap-2">
                  <div className="rounded-[15px] bg-lr-sun-soft p-3">
                    <dt className="text-xs text-dd-ink/75">Left to book</dt>
                    <dd className="mt-1 text-xl font-semibold">{item.available}</dd>
                  </div>
                  <div className="rounded-[15px] bg-lr-sky p-3">
                    <dt className="text-xs text-dd-ink/75">Booked</dt>
                    <dd className="mt-1 text-xl font-semibold">{item.reserved}</dd>
                  </div>
                  <div className="rounded-[15px] bg-lr-sky p-3">
                    <dt className="text-xs text-dd-ink/75">Balance</dt>
                    <dd className="mt-1 text-xl font-semibold">{item.ledgerBalance}</dd>
                  </div>
                </dl>
                <p className="mt-4 text-sm text-dd-muted">
                  Valid until {item.expiryAt.toLocaleDateString('en-GB')}
                </p>
                <ButtonLink
                  className="mt-5"
                  href={`/classes?branch=${encodeURIComponent(item.branchId)}#schedule`}
                >
                  Book a session
                </ButtonLink>
              </article>
            ))}
          </div>
          <Pagination
            hasPrevious={cursorHistory.length > 0 && !loading}
            hasNext={Boolean(nextCursor) && !loading}
            totalLabel={`Page ${cursorHistory.length + 1} · ${items.length} of ${total} packages`}
            labels={{ navigation: 'Pages', previous: 'Previous', next: 'Next' }}
            onPrevious={() => {
              const previous = cursorHistory.at(-1) ?? '';
              void loadPage(previous || undefined).then((loaded) => {
                if (loaded) setCursorHistory((current) => current.slice(0, -1));
              });
            }}
            onNext={() => {
              if (!nextCursor) return;
              void loadPage(nextCursor).then((loaded) => {
                if (loaded) setCursorHistory((current) => [...current, cursor ?? '']);
              });
            }}
          />
        </>
      )}
    </main>
  );
}
