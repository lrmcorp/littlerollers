import { PrismaClient } from '@prisma/client';
import { createHash, randomBytes } from 'node:crypto';

const prisma = new PrismaClient();
const sha256 = (v: string) => createHash('sha256').update(v).digest('hex');

async function main() {
  const booking = await prisma.pemesananKelas.findFirst({
    where: { status: 'BOOKED' },
    include: {
      user: true,
      classSlot: {
        include: { classType: true, branch: true, instructor: true }
      }
    }
  });

  if (!booking) {
    console.log('No BOOKED booking found');
    return;
  }

  // Update slot time so it's currently active (OPEN for check-in)
  const now = new Date();
  const startAt = new Date(now.getTime() + 15 * 60_000); // starts in 15 mins
  const endAt = new Date(now.getTime() + 75 * 60_000);   // ends in 75 mins
  await prisma.slotKelas.update({
    where: { id: booking.classSlotId },
    data: { startAt, endAt, status: 'PUBLISHED' }
  });

  const rawToken = randomBytes(32).toString('base64url');
  const tokenRecord = await prisma.checkInToken.create({
    data: {
      bookingId: booking.id,
      token: sha256(rawToken),
      expiresAt: endAt
    }
  });

  console.log('Created valid token:');
  console.log('Raw Token:', rawToken);
  console.log('Booking:', booking.id, 'User:', booking.user.displayName, 'Class:', booking.classSlot.classType.name);

  // Test API endpoint directly
  const res = await fetch(`http://127.0.0.1:32121/api/v1/check-ins/customer-link-info?token=${encodeURIComponent(rawToken)}`);
  console.log('API Status:', res.status);
  const data = await res.json();
  console.log('API Response:', JSON.stringify(data, null, 2));

  return rawToken;
}

main().finally(() => prisma.$disconnect());
