import type { NotificationCategory, NotificationTone } from '@prisma/client';
import type { SeedContext } from './context';

const fixtures: Array<{
  user: string;
  key: string;
  category: NotificationCategory;
  tone: NotificationTone;
  title: string;
  message: string;
  href: string;
  read: boolean;
  branch?: string;
}> = [
  { user: 'customer', key: 'verification', category: 'VERIFICATION', tone: 'WARNING', title: 'Verifikasi sedang diperiksa', message: 'Dokumen Anda telah diterima oleh tim Daily Dose.', href: '/account/verification', read: false, branch: 'DD-JKT' },
  { user: 'customer', key: 'booking', category: 'BOOKING', tone: 'SUCCESS', title: 'Booking berhasil dibuat', message: 'Jadwal latihan telah ditambahkan ke akun Anda.', href: '/bookings', read: true, branch: 'DD-JKT' },
  { user: 'admin', key: 'verification-queue', category: 'APPROVAL', tone: 'WARNING', title: 'Verifikasi menunggu review', message: 'Dokumen customer baru masuk ke antrean.', href: '/identity-verifications?status=PENDING', read: false, branch: 'DD-JKT' },
  { user: 'manager', key: 'reschedule-queue', category: 'APPROVAL', tone: 'WARNING', title: 'Reschedule menunggu keputusan', message: 'Permintaan reschedule baru perlu diperiksa.', href: '/bookings?rescheduleStatus=PENDING', read: false, branch: 'DD-JKT' },
  { user: 'manager-bsd', key: 'bsd-class-risk', category: 'CLASS', tone: 'WARNING', title: 'Kelas BSD perlu perhatian', message: 'Kelas mendatang belum mencapai minimum quota.', href: '/workspace/classes?risk=true', read: false, branch: 'DD-BSD' },
  { user: 'finance', key: 'payment-queue', category: 'PAYMENT', tone: 'WARNING', title: 'Pembayaran menunggu pemeriksaan', message: 'Bukti pembayaran baru masuk ke antrean Finance.', href: '/workspace/payments?status=PENDING', read: false },
  { user: 'ops', key: 'failed-job', category: 'OPERATIONS', tone: 'DANGER', title: 'Job operasional gagal', message: 'Satu job membutuhkan recovery.', href: '/operations?status=FAILED', read: false },
  { user: 'owner-jkt', key: 'branch-risk', category: 'CLASS', tone: 'WARNING', title: 'Kelas berisiko H-24', message: 'Kelas belum mencapai minimum quota.', href: '/workspace/classes?risk=true', read: false, branch: 'DD-JKT' },
  { user: 'ralamzah-super-owner', key: 'executive-alert', category: 'SYSTEM', tone: 'INFO', title: 'Ringkasan executive tersedia', message: 'Data performa seluruh cabang telah diperbarui.', href: '/workspace', read: false },
];

export async function seedNotifications(
  ctx: SeedContext,
  users: Record<string, string>,
  branches: Record<string, string>,
) {
  for (const item of fixtures) {
    const userId = users[item.user];
    if (!userId) continue;
    const eventKey = `seed:${item.key}`;
    await ctx.db.userNotification.upsert({
      where: { userId_eventKey: { userId, eventKey } },
      update: {
        category: item.category,
        tone: item.tone,
        title: item.title,
        message: item.message,
        href: item.href,
        branchId: item.branch ? branches[item.branch] : null,
        readAt: item.read ? ctx.at(-1) : null,
      },
      create: {
        id: ctx.id('user-notification', `${item.user}:${item.key}`),
        userId,
        eventKey,
        category: item.category,
        tone: item.tone,
        title: item.title,
        message: item.message,
        href: item.href,
        branchId: item.branch ? branches[item.branch] : null,
        readAt: item.read ? ctx.at(-1) : null,
        createdAt: ctx.at(item.read ? -1 : 0),
      },
    });
  }
}
