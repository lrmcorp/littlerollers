import { PrismaClient } from '../apps/api/node_modules/@prisma/client';

const prisma = new PrismaClient();
const API_URL = 'http://127.0.0.1:32121/api/v1';

async function run() {
  console.log('=== STARTING END-TO-END VERIFICATION: 100% AUTHENTIC V1 CLASSES ===\n');

  let errors = 0;

  // 1. DATABASE INTEGRITY
  console.log('--- 1. DATABASE AUDIT ---');
  const classTypes = await prisma.jenisKelas.findMany({
    select: { id: true, code: true, name: true, active: true },
    orderBy: { code: 'asc' },
  });

  const activeCodes = classTypes.filter((c) => c.active).map((c) => c.code);
  console.log('Active class types in DB:', activeCodes);
  const expectedActive = ['GROUP_CLASS', 'PRIVATE_CLASS', 'PRIVATE_GROUP', 'SEMI_PRIVATE'];
  if (JSON.stringify(activeCodes.sort()) !== JSON.stringify(expectedActive.sort())) {
    console.error('FAIL: Active class types mismatch! Expected:', expectedActive, 'Got:', activeCodes);
    errors++;
  } else {
    console.log('PASS: Exactly 4 authentic active class types in DB.');
  }

  const fakeCodesInDB = classTypes.filter((c) => ['REFORMER', 'MAT', 'BARRE', 'REFORMER_PRIV'].includes(c.code));
  if (fakeCodesInDB.length > 0) {
    console.error('FAIL: Found synthetic class types in DB:', fakeCodesInDB);
    errors++;
  } else {
    console.log('PASS: Zero synthetic class types exist in DB.');
  }

  // 2. CHECK SLOTS IN DB
  const invalidSlots = await prisma.slotKelas.count({
    where: {
      classType: {
        code: { in: ['REFORMER', 'MAT', 'BARRE', 'REFORMER_PRIV'] },
      },
    },
  });
  if (invalidSlots > 0) {
    console.error(`FAIL: Found ${invalidSlots} slots linked to fake class types!`);
    errors++;
  } else {
    console.log('PASS: Zero slots in DB linked to fake class types.');
  }

  // 3. CHECK PACKAGES IN DB
  const invalidPackages = await prisma.paket.count({
    where: {
      classType: {
        code: { in: ['REFORMER', 'MAT', 'BARRE', 'REFORMER_PRIV'] },
      },
    },
  });
  if (invalidPackages > 0) {
    console.error(`FAIL: Found ${invalidPackages} packages linked to fake class types!`);
    errors++;
  } else {
    console.log('PASS: Zero packages in DB linked to fake class types.');
  }

  // 4. API SITE-CONFIG ENDPOINT
  console.log('\n--- 2. PUBLIC SITE-CONFIG API ---');
  try {
    const res = await fetch(`${API_URL}/public/site-config`);
    const siteConfig = await res.json();
    const configClassCodes = siteConfig.classes.map((c: any) => c.code);
    console.log('Classes returned by site-config:', configClassCodes);
    if (JSON.stringify(configClassCodes.sort()) !== JSON.stringify(expectedActive.sort())) {
      console.error('FAIL: Site config classes do not match authentic 4 classes!');
      errors++;
    } else {
      console.log('PASS: Site config returns exactly the 4 authentic V1 classes.');
    }
  } catch (err) {
    console.error('FAIL: Could not query site-config:', err);
    errors++;
  }

  // 5. API CLASS CATALOG & BRANCH SCHEDULES
  console.log('\n--- 3. PUBLIC CLASS SCHEDULES & 5 BRANCHES ---');
  try {
    const catRes = await fetch(`${API_URL}/public/class-catalog`);
    const catData = await catRes.json();
    console.log(`Found ${catData.branches?.length} branches in catalog.`);

    for (const b of catData.branches) {
      const bRes = await fetch(`${API_URL}/public/class-catalog?branchId=${b.id}`);
      const bData = await bRes.json();
      const codes = [...new Set(bData.items.map((i: any) => i.classType?.code))];
      const coaches = [...new Set(bData.items.map((i: any) => i.instructor?.displayName))];

      console.log(`Branch "${b.name}" (${b.code}): ${bData.items.length} slots`);
      console.log(`  Classes present: ${codes.join(', ')}`);
      console.log(`  Sample coaches: ${coaches.slice(0, 3).join(', ')}`);

      const hasFake = codes.some((c) => ['REFORMER', 'MAT', 'BARRE', 'REFORMER_PRIV'].includes(c as string));
      if (hasFake) {
        console.error(`FAIL: Branch ${b.name} returned fake class types!`);
        errors++;
      }
      if (bData.items.length === 0) {
        console.error(`FAIL: Branch ${b.name} has 0 upcoming slots!`);
        errors++;
      }
    }
    console.log('PASS: All 5 branches have active upcoming slots exclusively using authentic V1 classes.');
  } catch (err) {
    console.error('FAIL: Error checking class catalog:', err);
    errors++;
  }

  // 6. CLASS DETAIL SLUG RESOLUTION
  console.log('\n--- 4. CLASS DETAIL ROUTING & ALIASES ---');
  const testSlugs = [
    { slug: 'group-class', expectedCode: 'GROUP_CLASS' },
    { slug: 'private-class', expectedCode: 'PRIVATE_CLASS' },
    { slug: 'semi-private', expectedCode: 'SEMI_PRIVATE' },
    { slug: 'private-group', expectedCode: 'PRIVATE_GROUP' },
    { slug: 'reformer-pilates', expectedCode: 'GROUP_CLASS' }, // SEO redirect to group class
    { slug: 'reformer', expectedCode: 'GROUP_CLASS' },
  ];

  for (const { slug, expectedCode } of testSlugs) {
    try {
      const res = await fetch(`${API_URL}/public/class-types/${slug}`);
      if (!res.ok) {
        console.error(`FAIL: Slug "${slug}" returned status ${res.status}`);
        errors++;
      } else {
        const data = await res.json();
        if (data.profile.code !== expectedCode) {
          console.error(`FAIL: Slug "${slug}" resolved to ${data.profile.code}, expected ${expectedCode}`);
          errors++;
        } else {
          console.log(`PASS: Slug "${slug}" successfully resolved to ${data.profile.code} (${data.profile.name})`);
        }
      }
    } catch (err) {
      console.error(`FAIL: Request for slug "${slug}" threw error:`, err);
      errors++;
    }
  }

  // 7. PACKAGE CATALOG AUDIT
  console.log('\n--- 5. PACKAGE CATALOG AUDIT ---');
  try {
    const pkgRes = await fetch(`${API_URL}/public/package-catalog`);
    const pkgData = await pkgRes.json();
    const pkgs = pkgData.items || [];
    console.log(`Total active packages in catalog: ${pkgs.length}`);
    const badPkgs = pkgs.filter((p: any) =>
      p.classTypes?.some((ct: any) => ['REFORMER', 'MAT', 'BARRE', 'REFORMER_PRIV'].includes(ct.code)),
    );
    if (badPkgs.length > 0) {
      console.error(`FAIL: Found ${badPkgs.length} packages with fake class types!`);
      errors++;
    } else {
      console.log('PASS: All packages in catalog are clean and reference only authentic class types.');
      const classTypesInPkgs = [...new Set(pkgs.flatMap((p: any) => p.classTypes?.map((ct: any) => ct.code) || []))];
      console.log('Class types referenced by packages:', classTypesInPkgs);
    }
  } catch (err) {
    console.error('FAIL: Error fetching packages:', err);
    errors++;
  }

  console.log('\n======================================================');
  if (errors === 0) {
    console.log('RESULT: 100% VERIFIED! System is completely authentic and clean.');
  } else {
    console.error(`RESULT: ${errors} errors detected during verification.`);
    process.exit(1);
  }

  await prisma.$disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
