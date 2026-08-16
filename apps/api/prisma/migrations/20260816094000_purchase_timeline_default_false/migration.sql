-- Runtime events are first-class events and must default to non-derived.
-- Legacy/backfilled timeline events explicitly write derived = true.
ALTER TABLE `PurchaseTimelineEvent`
  MODIFY `derived` BOOLEAN NOT NULL DEFAULT false;
