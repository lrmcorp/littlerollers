import { PrismaClient } from '@prisma/client';
import { PackageCatalogService } from '../apps/api/src/packages/katalog-paket.service';
import { VoucherService } from '../apps/api/src/packages/voucher.service';
import { PackagePricingService } from '../apps/api/src/packages/kalkulasi-harga-paket.service';
import { PackageAccessService } from '../apps/api/src/packages/package-access.service';
import { PolicyService } from '../apps/api/src/identity/policy.service';
import { IdempotencyService } from '../apps/api/src/foundation/idempotency.service';
import { AuditService } from '../apps/api/src/foundation/audit.service';

const db = new PrismaClient();
const policy = new PolicyService();
const audit = new AuditService();
const idempotency = new IdempotencyService(db as any);
const access = new PackageAccessService(db as any, policy, audit);
const pricing = new PackagePricingService(db as any);

const catalogService = new PackageCatalogService(db as any, access, idempotency, audit);
const voucherService = new VoucherService(db as any, access, pricing, idempotency, audit);

const principal: any = {
  sessionId: 'test-session',
  userId: '00000000-0000-4000-8000-000000000100',
  roles: [{ role: 'SUPERADMIN' }],
  capabilities: ['master:manage', 'package:read', 'voucher:read', 'voucher:manage'],
  branchIds: ['a1000000-0000-4000-8000-000000000001'],
};

async function testServices() {
  console.log('--- Testing PackageCatalogService.list() ---');
  const pkgList = await catalogService.list(principal, { limit: '5' });
  console.log('✓ Package items count returned:', pkgList.items.length);
  console.log('✓ First package item:', pkgList.items[0]?.name, `(${pkgList.items[0]?.code})`, `Rp${pkgList.items[0]?.priceRp.toLocaleString('id-ID')}`);
  console.log('✓ Summary:', pkgList.summary);

  console.log('\n--- Testing PackageCatalogService.list(query: { q: "Group Class" }) ---');
  const searchResult = await catalogService.list(principal, { q: 'Group Class', limit: '3' });
  console.log('✓ Search results count:', searchResult.items.length);
  searchResult.items.forEach(p => console.log(`  - [${p.code}] ${p.name}`));

  console.log('\n--- Testing VoucherService.list() ---');
  const vList = await voucherService.list(principal, { limit: '5' });
  console.log('✓ Voucher items count returned:', vList.items.length);
  console.log('✓ First voucher item:', vList.items[0]?.name, `(${vList.items[0]?.code})`, vList.items[0]?.discountType, vList.items[0]?.discountValue);
  console.log('✓ Voucher summary:', vList.summary);

  console.log('\n--- Testing VoucherService.list(query: { q: "FIRSTIME" }) ---');
  const vSearch = await voucherService.list(principal, { q: 'FIRSTIME' });
  console.log('✓ Voucher search result:', vSearch.items.map(v => `[${v.code}] ${v.name} (dipakai: ${v.redeemedCount}x)`));

  await db.$disconnect();
}

testServices().catch((err) => {
  console.error('Service test error:', err);
  process.exit(1);
});
