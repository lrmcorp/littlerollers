import { PrismaClient } from '@prisma/client';
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'node:fs';
import * as path from 'node:path';

const prisma = new PrismaClient();

// Parsing CLI arguments
const args = process.argv.slice(2);
const isSync = args.includes('--sync');
const v1DirIndex = args.indexOf('--v1-dir');
const v1Dir = v1DirIndex !== -1 ? args[v1DirIndex + 1] : process.env.V1_STORAGE_PATH || '';

const endpoint = process.env.OBJECT_STORAGE_ENDPOINT || 'http://127.0.0.1:9000';
const bucket = process.env.OBJECT_STORAGE_BUCKET || 'dailydose-private';
const accessKey = process.env.OBJECT_STORAGE_ACCESS_KEY || '';
const secretKey = process.env.OBJECT_STORAGE_SECRET_KEY || '';
const region = process.env.OBJECT_STORAGE_REGION || 'us-east-1';

const s3 = new S3Client({
  endpoint,
  region,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
  },
  forcePathStyle: true,
  tls: false,
});

function findFileRecursively(rootDir: string, targetFilename: string): string | null {
  if (!rootDir || !fs.existsSync(rootDir)) return null;

  const directPath = path.join(rootDir, targetFilename);
  if (fs.existsSync(directPath)) return directPath;

  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const found = findFileRecursively(path.join(rootDir, entry.name), targetFilename);
      if (found) return found;
    } else if (entry.name === targetFilename) {
      return path.join(rootDir, entry.name);
    }
  }
  return null;
}

async function main() {
  console.info('====================================================');
  console.info('📦 DailyDose V1 -> V2 Physical Media Sync Tool');
  console.info('====================================================');
  console.info(`Mode: ${isSync ? '🚀 EXECUTION (--sync)' : '🔍 DRY-RUN (Audit only)'}`);
  console.info(`Target MinIO: ${endpoint} / Bucket: ${bucket}`);
  console.info(`V1 Source Directory: ${v1Dir || '(Not specified, set --v1-dir <path>)'}\n`);

  // 1. Audit Bukti Pembayaran (Payment Proofs)
  console.info('📋 [1/2] Memeriksa data bukti pembayaran (bukti_pembayaran)...');
  const paymentProofs = await prisma.buktiPembayaran.findMany({
    select: {
      id: true,
      fileUrl: true,
      purchaseId: true,
    },
  });

  console.info(`Total rekaman bukti pembayaran di database: ${paymentProofs.length}`);

  let proofMatched = 0;
  let proofMissing = 0;
  let proofSynced = 0;

  for (const proof of paymentProofs) {
    const filename = path.basename(proof.fileUrl);
    if (!filename || filename === 'NULL') continue;

    const key = `proofs/${filename}`;

    if (v1Dir && fs.existsSync(v1Dir)) {
      const localSource = findFileRecursively(v1Dir, filename);
      if (localSource) {
        proofMatched++;
        if (isSync) {
          const content = fs.readFileSync(localSource);
          await s3.send(
            new PutObjectCommand({
              Bucket: bucket,
              Key: key,
              Body: content,
            }),
          );
          proofSynced++;
        }
      } else {
        proofMissing++;
      }
    }
  }

  if (v1Dir && fs.existsSync(v1Dir)) {
    console.info(`   ✓ Ditemukan di V1 storage: ${proofMatched} berkas`);
    console.info(`   ⚠️ Tidak ditemukan di V1 storage: ${proofMissing} berkas`);
    if (isSync) {
      console.info(`   🚀 Berhasil diunggah ke MinIO: ${proofSynced} berkas`);
    }
  } else {
    console.info('   ℹ️ Jalankan dengan flag --v1-dir <path> untuk memeriksa ketersediaan berkas fisik V1.');
  }

  // 2. Audit Foto Profil Pengguna (Avatars)
  console.info('\n👤 [2/2] Memeriksa foto profil pengguna (profil_pengguna)...');
  const profiles = await prisma.profilPengguna.findMany({
    where: {
      avatarUrl: { not: null },
    },
    select: {
      id: true,
      userId: true,
      fullName: true,
      avatarUrl: true,
    },
  });

  console.info(`Total pengguna dengan avatarUrl di database: ${profiles.length}`);
  let avatarMatched = 0;
  let avatarMissing = 0;

  for (const p of profiles) {
    if (!p.avatarUrl || p.avatarUrl === 'NULL') continue;
    const filename = path.basename(p.avatarUrl);

    if (v1Dir && fs.existsSync(v1Dir)) {
      const localSource = findFileRecursively(v1Dir, filename);
      if (localSource) avatarMatched++;
      else avatarMissing++;
    }
  }

  if (v1Dir && fs.existsSync(v1Dir)) {
    console.info(`   ✓ Ditemukan di V1 storage: ${avatarMatched} foto avatar`);
    console.info(`   ⚠️ Tidak ditemukan di V1 storage: ${avatarMissing} foto avatar`);
  }

  console.info('\n====================================================');
  console.info('✅ Selesai.');
  console.info('====================================================');
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error('❌ Error executing sync:', e);
  await prisma.$disconnect();
  process.exit(1);
});
