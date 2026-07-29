'use client';

import Link from 'next/link';
import { useState } from 'react';
import { MasterView } from './master-view';
import type { MasterTab } from './master-view';
import { PaymentAccountsView } from './payment-accounts-view';

export default function MasterPage() {
  const [activeTab, setActiveTab] = useState<MasterTab>('branches');
  return (
    <>
      <MasterView activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'packages' && (
        <section className="rounded-dd-lg border border-dd-line bg-dd-surface p-6 shadow-dd-card">
          <h2>Paket aktif dan historis</h2>
          <p className="text-dd-muted">
            Pengelolaan paket memiliki workspace tersendiri agar harga, masa aktif, dan histori
            tetap mudah diaudit.
          </p>
          <Link className="button-primary inline-flex" href="/workspace/packages">
            Buka workspace Paket
          </Link>
        </section>
      )}
      {activeTab === 'accounts' && <PaymentAccountsView />}
    </>
  );
}
