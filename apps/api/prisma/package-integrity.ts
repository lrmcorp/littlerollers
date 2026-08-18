import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';

type PackageRecord = Awaited<ReturnType<typeof loadPackages>>[number];

const db = new PrismaClient();
const repair = process.argv.includes('--repair');

async function loadPackages() {
  return db.paket.findMany({
    where: { status: 'ACTIVE' },
    include: {
      _count: {
        select: {
          purchases: true,
          customerPackages: true,
          promotions: true,
          voucherScopes: true,
        },
      },
    },
    orderBy: [{ branchId: 'asc' }, { businessKey: 'asc' }, { effectiveFrom: 'asc' }, { id: 'asc' }],
  });
}

function overlaps(left: PackageRecord, right: PackageRecord) {
  return (
    (!left.effectiveUntil || right.effectiveFrom < left.effectiveUntil) &&
    (!right.effectiveUntil || left.effectiveFrom < right.effectiveUntil)
  );
}

function referenceCount(item: PackageRecord) {
  return (
    item._count.purchases +
    item._count.customerPackages +
    item._count.promotions +
    item._count.voucherScopes
  );
}

async function main() {
  const packages = await loadPackages();
  const groups = new Map<string, PackageRecord[]>();
  for (const item of packages) {
    const key = `${item.branchId}:${item.businessKey}`;
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  const issues = [...groups.entries()].flatMap(([key, items]) =>
    items.flatMap((left, index) =>
      items.slice(index + 1).flatMap((right) =>
        overlaps(left, right)
          ? [
              {
                key,
                left: {
                  id: left.id,
                  name: left.name,
                  effectiveFrom: left.effectiveFrom,
                  effectiveUntil: left.effectiveUntil,
                  references: referenceCount(left),
                },
                right: {
                  id: right.id,
                  name: right.name,
                  effectiveFrom: right.effectiveFrom,
                  effectiveUntil: right.effectiveUntil,
                  references: referenceCount(right),
                },
              },
            ]
          : [],
      ),
    ),
  );

  if (repair) {
    const repaired = new Set<string>();
    for (const issue of issues) {
      const candidates = [issue.left, issue.right].sort(
        (left, right) =>
          right.references - left.references ||
          right.effectiveFrom.getTime() - left.effectiveFrom.getTime() ||
          right.id.localeCompare(left.id),
      );
      const keep = candidates[0]!;
      const legacy = candidates[1]!;
      if (repaired.has(legacy.id)) continue;
      const stillActive = await db.paket.findFirst({
        where: { id: legacy.id, status: 'ACTIVE' },
        select: { id: true },
      });
      if (!stillActive) continue;
      const current = packages.find((item) => item.id === legacy.id)!;
      const repairedAt = new Date();
      const closedAt =
        current.effectiveUntil ??
        (repairedAt > current.effectiveFrom
          ? repairedAt
          : new Date(current.effectiveFrom.getTime() + 1));
      await db.$transaction([
        db.paket.update({
          where: { id: legacy.id },
          data: {
            status: 'INACTIVE',
            businessKey: `${current.businessKey}-LEGACY-${legacy.id.slice(0, 8)}`,
            effectiveUntil: closedAt,
            version: { increment: 1 },
          },
        }),
        db.auditLog.create({
          data: {
            id: randomUUID(),
            actorType: 'SYSTEM',
            action: 'master.package_revision_integrity_repaired',
            objectType: 'Package',
            objectId: legacy.id,
            branchId: current.branchId,
            correlationId: `package-integrity:${legacy.id}`,
            beforeMasked: {
              businessKey: current.businessKey,
              status: current.status,
              overlappingPackageId: keep.id,
            },
            afterMasked: {
              status: 'INACTIVE',
              legacyRevision: true,
              effectiveUntil: closedAt.toISOString(),
              referencesPreserved: legacy.references,
            },
          },
        }),
      ]);
      repaired.add(legacy.id);
    }
  }

  console.info(
    JSON.stringify(
      {
        mode: repair ? 'REPAIR' : 'REPORT',
        activePackages: packages.length,
        issueCount: issues.length,
        issues,
      },
      null,
      2,
    ),
  );
  if (!repair && issues.length) process.exitCode = 2;
}

void main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : 'Package integrity check failed.');
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
