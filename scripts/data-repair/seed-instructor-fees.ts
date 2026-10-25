import { PrismaClient } from '../../apps/api/node_modules/@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const DEFAULT_RATES: Record<string, { feePerHour: number; ratePerSession: number }> = {
  'Group Class': { feePerHour: 150_000, ratePerSession: 120_000 },
  'Semi Private Class': { feePerHour: 180_000, ratePerSession: 150_000 },
  'Private Class': { feePerHour: 225_000, ratePerSession: 200_000 },
  'Private Group': { feePerHour: 200_000, ratePerSession: 175_000 },
  'Megaformer Class': { feePerHour: 250_000, ratePerSession: 220_000 },
};

export async function runSeedInstructorFees(apply: boolean) {
  const [instructors, branches, classTypes, existingFeesCount, existingRatesCount] =
    await Promise.all([
      prisma.user.findMany({
        where: { role: 'INSTRUCTOR', status: 'ACTIVE' },
        select: { id: true, displayName: true, email: true },
      }),
      prisma.cabang.findMany({
        where: { active: true },
        select: { id: true, code: true, name: true },
      }),
      prisma.jenisKelas.findMany({
        select: { id: true, name: true },
      }),
      prisma.instructorFee.count(),
      prisma.projectionRate.count(),
    ]);

  console.log(`[SEED INSTRUCTOR FEES] Mode: ${apply ? 'APPLY' : 'DRY_RUN'}`);
  console.log(`Total Instruktur Aktif: ${instructors.length}`);
  console.log(`Total Cabang Aktif: ${branches.length}`);
  console.log(`Total Tipe Kelas: ${classTypes.length}`);
  console.log(`Tarif Honor saat ini: ${existingFeesCount} baris`);
  console.log(`Tarif Proyeksi saat ini: ${existingRatesCount} baris`);

  const effectiveDate = new Date('2024-01-01T00:00:00.000Z');
  const feeRowsToCreate: Array<{
    instructorId: string;
    branchId: string;
    classTypeId: string;
    feePerJamRp: number;
    effectiveDate: Date;
  }> = [];

  const rateRowsToCreate: Array<{
    branchId: string;
    classTypeId: string;
    ratePerSesiRp: number;
    effectiveDate: Date;
  }> = [];

  for (const instructor of instructors) {
    for (const branch of branches) {
      for (const ct of classTypes) {
        const rateConfig = DEFAULT_RATES[ct.name] ?? { feePerHour: 150_000, ratePerSession: 120_000 };
        feeRowsToCreate.push({
          instructorId: instructor.id,
          branchId: branch.id,
          classTypeId: ct.id,
          feePerJamRp: rateConfig.feePerHour,
          effectiveDate,
        });
      }
    }
  }

  for (const branch of branches) {
    for (const ct of classTypes) {
      const rateConfig = DEFAULT_RATES[ct.name] ?? { feePerHour: 150_000, ratePerSession: 120_000 };
      rateRowsToCreate.push({
        branchId: branch.id,
        classTypeId: ct.id,
        ratePerSesiRp: rateConfig.ratePerSession,
        effectiveDate,
      });
    }
  }

  const auditReport = {
    executedAt: new Date().toISOString(),
    mode: apply ? 'APPLY' : 'DRY_RUN',
    instructorsCount: instructors.length,
    branchesCount: branches.length,
    classTypesCount: classTypes.length,
    feeRowsPlanned: feeRowsToCreate.length,
    rateRowsPlanned: rateRowsToCreate.length,
    sampleFees: feeRowsToCreate.slice(0, 5),
    sampleRates: rateRowsToCreate.slice(0, 5),
  };

  const outputDir = path.resolve(__dirname, '../../docs/arsip/uat/bukti');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, 'instructor_fees_audit.json');
  fs.writeFileSync(outputPath, JSON.stringify(auditReport, null, 2), 'utf-8');

  console.log(`Rencana pembuatan tarif honor: ${feeRowsToCreate.length} baris.`);
  console.log(`Rencana pembuatan tarif proyeksi: ${rateRowsToCreate.length} baris.`);
  console.log(`Laporan tersimpan di: ${outputPath}`);

  if (apply && existingFeesCount === 0) {
    // Gunakan createMany untuk efisiensi
    const feeChunks = [];
    const chunkSize = 500;
    for (let i = 0; i < feeRowsToCreate.length; i += chunkSize) {
      feeChunks.push(feeRowsToCreate.slice(i, i + chunkSize));
    }
    for (const chunk of feeChunks) {
      await prisma.instructorFee.createMany({ data: chunk });
    }
    console.log(`[APPLY] Berhasil membuat ${feeRowsToCreate.length} baris tarif honor instruktur.`);

    if (existingRatesCount === 0) {
      await prisma.projectionRate.createMany({ data: rateRowsToCreate });
      console.log(`[APPLY] Berhasil membuat ${rateRowsToCreate.length} baris tarif proyeksi.`);
    }
  } else if (apply) {
    console.log(`[APPLY] Tabel InstructorFee sudah memiliki ${existingFeesCount} data, melewatinya untuk menjaga integritas.`);
  }

  return auditReport;
}

if (require.main === module) {
  const isApply = process.argv.includes('--apply');
  runSeedInstructorFees(isApply)
    .catch((err) => {
      console.error('Error:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
