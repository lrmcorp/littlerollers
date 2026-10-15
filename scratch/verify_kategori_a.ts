import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
  const log: string[] = [];
  function p(str: string) {
    console.log(str);
    log.push(str);
  }

  p('=== HASIL AUDIT KATEGORI A ===\n');

  // POIN 2: Overcapacity
  try {
    p('--- POIN 2: Overcapacity Check (5-7 Okt 2026) ---');
    const slots = await prisma.slotKelas.findMany({
      where: {
        startAt: {
          gte: new Date('2026-10-01T00:00:00Z'),
          lte: new Date('2026-10-15T23:59:59Z'),
        },
      },
      include: {
        classType: true,
        branch: true,
        bookings: {
          where: { status: { in: ['BOOKED', 'ATTENDED'] } },
          include: { user: true },
        },
      },
      orderBy: [{ startAt: 'asc' }],
    });

    const overcap = slots.filter(s => s.bookings.length > s.capacity || s.bookedCount > s.capacity);
    p(`Total slot 1-15 Okt: ${slots.length}`);
    p(`Total slot overcapacity: ${overcap.length}`);
    for (const s of overcap) {
      p(`\n[OVERCAPACITY DETECTED] Slot ID: ${s.id}`);
      p(`  Waktu: ${s.startAt.toISOString().replace('T', ' ').substring(0, 19)} WIB | Cabang: ${s.branch?.name} | Kelas: ${s.classType?.name}`);
      p(`  Kapasitas: ${s.capacity} | bookedCount di DB: ${s.bookedCount} | Active Bookings count: ${s.bookings.length}`);
      p(`  Daftar Booking (${s.bookings.length}):`);
      for (const b of s.bookings) {
        p(`    - ${b.user?.displayName} (${b.user?.email}) [Status: ${b.status}, No: ${b.bookingNumber}]`);
      }
    }

    // Check specifically Muara Karang 7 Okt
    const mk7Oct = slots.filter(s => s.branch?.name?.toLowerCase().includes('muara karang') && s.startAt.toISOString().split('T')[0] === '2026-10-07');
    p(`\nDetail Semua Slot Muara Karang 7 Okt: ${mk7Oct.length} slot`);
    for (const s of mk7Oct) {
      p(`  Jam: ${s.startAt.toISOString().substring(11, 16)} - ${s.endAt.toISOString().substring(11, 16)} | Kelas: ${s.classType?.name} | Kapasitas: ${s.capacity} | bookedCount: ${s.bookedCount} | Real Bookings: ${s.bookings.length}`);
    }
  } catch (err: any) {
    p(`Poin 2 error: ${err.message}`);
  }

  // POIN 4: Pembayaran Menunggu & Kode Unik
  try {
    p('\n--- POIN 4: Pembayaran Menunggu & Kode Unik ---');
    const waitingPurchases = await prisma.pembelian.findMany({
      where: { status: { in: ['PENDING', 'WAITING_VERIFICATION'] } },
      select: {
        id: true,
        invoiceNumber: true,
        createdAt: true,
        totalAmountRp: true,
        subtotalRp: true,
        discountRp: true,
        status: true,
        paymentMethod: true,
        user: { select: { displayName: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    p(`Total Pembelian PENDING/WAITING_VERIFICATION: ${waitingPurchases.length}`);
    // Unique codes: nominal ending not in 000
    const withUniqueCodes = waitingPurchases.filter(p => p.totalAmountRp % 1000 !== 0);
    p(`Pembelian dengan kode unik (akhiran bukan 000): ${withUniqueCodes.length}`);
    if (withUniqueCodes.length > 0) {
      p(`Oldest: ${withUniqueCodes[0].createdAt.toISOString().split('T')[0]} - ${withUniqueCodes[0].invoiceNumber} (Rp ${withUniqueCodes[0].totalAmountRp.toLocaleString('id-ID')})`);
      p(`Sample 5 pembelian dengan kode unik:`);
      for (const pItem of withUniqueCodes.slice(0, 5)) {
        p(`  Invoice: ${pItem.invoiceNumber} | Customer: ${pItem.user?.displayName} | Created: ${pItem.createdAt.toISOString().split('T')[0]} | Total: Rp ${pItem.totalAmountRp.toLocaleString('id-ID')} | Status: ${pItem.status}`);
      }
    }
  } catch (err: any) {
    p(`Poin 4 error: ${err.message}`);
  }

  // POIN 6: Kasus Lusianna (8 Sessions PVG)
  try {
    p('\n--- POIN 6: Kasus Lusianna ---');
    const lusiannaUsers = await prisma.user.findMany({
      where: {
        OR: [
          { displayName: { contains: 'Lusianna' } },
          { profile: { fullName: { contains: 'Lusianna' } } },
        ],
      },
      include: {
        customerPackages: {
          include: {
            package: true,
            purchase: true,
          },
        },
        purchases: {
          include: { package: true },
        },
        bookings: {
          include: {
            classSlot: {
              include: { classType: true, branch: true },
            },
          },
        },
      },
    });
    p(`User bernama Lusianna ditemukan: ${lusiannaUsers.length}`);
    for (const u of lusiannaUsers) {
      p(`User: ${u.displayName} (${u.email}) ID: ${u.id}`);
      p(`  Pembelian Paket (${u.purchases.length}):`);
      for (const pur of u.purchases) {
        p(`    Invoice: ${pur.invoiceNumber} | Paket: ${pur.package?.name} | Status: ${pur.status} | Total: Rp ${pur.totalAmountRp}`);
      }
      p(`  Paket Pelanggan (Customer Packages) (${u.customerPackages.length}):`);
      for (const cp of u.customerPackages) {
        p(`    ID: ${cp.id} | Paket: ${cp.package?.name} | Sisa: ${cp.remainingSessions}/${cp.totalSessions} | Terpakai: ${cp.usedSessions} | Status Paket: ${cp.status} | Status Pembelian: ${cp.purchase?.status}`);
      }
      p(`  Booking Kelas (${u.bookings.length}):`);
      for (const b of u.bookings) {
        p(`    Booking ${b.bookingNumber} | Tanggal: ${b.classSlot?.startAt?.toISOString()} | Status: ${b.status} | PaketPelangganId: ${b.customerPackageId}`);
      }
    }
  } catch (err: any) {
    p(`Poin 6 error: ${err.message}`);
  }

  // POIN 8: Booking Kembar
  try {
    p('\n--- POIN 8: Booking Kembar ---');
    const checkKembarNames = ['Fera Julia', 'Sherly Luciana', 'Hermi Subianty'];
    for (const name of checkKembarNames) {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { displayName: { contains: name } },
            { profile: { fullName: { contains: name } } },
          ],
        },
        include: {
          bookings: {
            where: { status: { in: ['BOOKED', 'ATTENDED'] } },
            include: {
              classSlot: { include: { branch: true, classType: true } },
            },
          },
        },
      });
      for (const u of users) {
        p(`User: ${u.displayName} (ID: ${u.id}) Total booking aktif: ${u.bookings.length}`);
        const map: Record<string, typeof u.bookings> = {};
        for (const b of u.bookings) {
          map[b.classSlotId] = map[b.classSlotId] || [];
          map[b.classSlotId].push(b);
        }
        for (const [slotId, bList] of Object.entries(map)) {
          if (bList.length > 1) {
            const sample = bList[0];
            p(`  [KEMBAR ${bList.length}x] Slot ${slotId} | ${sample.classSlot?.startAt?.toISOString()} | Cabang: ${sample.classSlot?.branch?.name} | Kelas: ${sample.classSlot?.classType?.name}`);
            for (const b of bList) {
              p(`    - Booking No: ${b.bookingNumber} | Source: ${b.source} | Created: ${b.createdAt.toISOString()}`);
            }
          }
        }
      }
    }
  } catch (err: any) {
    p(`Poin 8 error: ${err.message}`);
  }

  // POIN 9: Voucher
  try {
    p('\n--- POIN 9: Voucher ---');
    const vouchers = await prisma.voucher.findMany({
      orderBy: { createdAt: 'desc' },
    });
    p(`Total voucher: ${vouchers.length}`);
    const julyVoucher = vouchers.filter(v => v.code.toUpperCase().includes('JULY') || v.code.toUpperCase().includes('JUL'));
    p(`Voucher July ditemukan: ${julyVoucher.length}`);
    for (const v of julyVoucher) {
      p(`  Kode: ${v.code} | DiskonType: ${v.discountType} | Nilai: ${v.discountValue} | ValidUntil: ${v.validUntil?.toISOString()} | Active: ${v.active}`);
    }
  } catch (err: any) {
    p(`Poin 9 error: ${err.message}`);
  }

  // POIN 10: Angka Dashboard
  try {
    p('\n--- POIN 10: Perbandingan Angka Dashboard & Verifikasi ---');
    const allPembelian = await prisma.pembelian.findMany({
      select: { status: true },
    });
    const waitingVerification = allPembelian.filter(p => p.status === 'WAITING_VERIFICATION').length;
    const pending = allPembelian.filter(p => p.status === 'PENDING').length;
    const paid = allPembelian.filter(p => p.status === 'PAID').length;
    p(`Pembelian WAITING_VERIFICATION: ${waitingVerification}`);
    p(`Pembelian PENDING: ${pending}`);
    p(`Pembelian PAID: ${paid}`);
    p(`Total Pembelian Semua Status: ${allPembelian.length}`);

    // Branch bookings via raw query or aggregate to avoid prepared statement limits
    const branchBookings = await prisma.cabang.findMany({
      select: {
        id: true,
        name: true,
        code: true,
      },
    });
    for (const b of branchBookings) {
      const activeBookingsCount = await prisma.pemesananKelas.count({
        where: {
          classSlot: { branchId: b.id },
          status: 'BOOKED',
        },
      });
      const totalSlotCount = await prisma.slotKelas.count({
        where: { branchId: b.id },
      });
      p(`Cabang: ${b.name} (${b.code}) -> Total Slot: ${totalSlotCount}, Active Bookings: ${activeBookingsCount}`);
    }
  } catch (err: any) {
    p(`Poin 10 error: ${err.message}`);
  }

  // POIN 11: Honor & Profit
  try {
    p('\n--- POIN 11: Honor Instruktur & Finansial ---');
    const feeCount = await prisma.instructorFee.count();
    const fees = await prisma.instructorFee.findMany({ take: 10 });
    p(`Total record InstructorFee: ${feeCount}`);
    for (const f of fees) {
      p(`  Fee record: Branch=${f.branchId}, ClassType=${f.classTypeId}, BaseRate=${f.baseRate}`);
    }

    const otherCosts = await prisma.otherCost.count();
    p(`Total otherCosts in DB: ${otherCosts}`);
  } catch (err: any) {
    p(`Poin 11 error: ${err.message}`);
  }

  // POIN 12: Paket Admin vs Publik
  try {
    p('\n--- POIN 12: Katalog Paket ---');
    const allPaket = await prisma.paket.findMany({
      orderBy: { createdAt: 'desc' },
    });
    p(`Total paket di DB: ${allPaket.length}`);
    for (const pkg of allPaket) {
      p(`  Kode: ${pkg.code} | Nama: "${pkg.name}" | Status: ${pkg.status} | Harga: Rp ${pkg.priceRp.toLocaleString('id-ID')}`);
    }
  } catch (err: any) {
    p(`Poin 12 error: ${err.message}`);
  }

  // POIN 13: Data Tes
  try {
    p('\n--- POIN 13: Akun Tes/Dummy ---');
    const dummyUsers = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: 'example.com' } },
          { email: { contains: 'test' } },
          { displayName: { contains: 'test' } },
          { displayName: '-' },
          { displayName: { contains: 'dummy' } },
        ],
      },
      select: {
        id: true,
        displayName: true,
        email: true,
        role: true,
        status: true,
      },
    });
    p(`Total user dummy/test di DB: ${dummyUsers.length}`);
    for (const du of dummyUsers) {
      p(`  User: ${du.displayName} | Email: ${du.email} | Role: ${du.role} | Status: ${du.status}`);
    }
  } catch (err: any) {
    p(`Poin 13 error: ${err.message}`);
  }

  fs.writeFileSync(path.resolve(__dirname, 'audit_kategori_a_output.txt'), log.join('\n'));
  p('\nHasil ditulis ke scratch/audit_kategori_a_output.txt');
}

main().catch(console.error).finally(() => prisma.$disconnect());
