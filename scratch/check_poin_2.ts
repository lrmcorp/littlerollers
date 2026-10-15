import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
const prisma = new PrismaClient();

async function checkPoin2() {
  console.log('=== INVESTIGASI MENDALAM POIN 2 ===');
  
  // Check slots on 5, 6, 7 Okt 2026 (UTC: 2026-10-04T17:00 to 2026-10-07T17:00)
  const slots = await prisma.slotKelas.findMany({
    where: {
      startAt: {
        gte: new Date('2026-10-04T17:00:00Z'),
        lte: new Date('2026-10-07T23:59:59Z'),
      },
    },
    include: {
      branch: true,
      classType: true,
      room: true,
      bookings: {
        include: { user: true },
      },
    },
    orderBy: { startAt: 'asc' },
  });

  console.log(`Total slots around 5-7 Okt: ${slots.length}`);
  for (const s of slots) {
    const wibStart = new Date(s.startAt.getTime() + 7 * 3600 * 1000).toISOString().replace('T', ' ').substring(0, 16);
    const activeBookings = s.bookings.filter(b => ['BOOKED', 'ATTENDED'].includes(b.status));
    if (activeBookings.length >= 4 || s.capacity === 4 || s.bookedCount >= 4) {
      console.log(`Slot ID: ${s.id} | WIB: ${wibStart} | Branch: ${s.branch.name} | Class: ${s.classType.name} | Cap: ${s.capacity} | bookedCount: ${s.bookedCount} | ActiveBookings: ${activeBookings.length} (Total: ${s.bookings.length})`);
      if (activeBookings.length > 4 || s.capacity === 5) {
        for (const b of activeBookings) {
          console.log(`    Booking: ${b.bookingNumber} | User: ${b.user?.displayName} | Status: ${b.status} | Source: ${b.source} | Created: ${b.createdAt.toISOString()}`);
        }
      }
    }
  }
}

checkPoin2().catch(console.error).finally(() => prisma.$disconnect());
