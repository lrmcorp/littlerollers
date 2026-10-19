import 'reflect-metadata';
import { WhatsAppGatewayService, MockWhatsAppProvider, OfficialWhatsAppProvider } from './whatsapp-gateway.service';
import { ReminderScheduleService } from './reminder-schedule.service';
import { AutoCancelService } from '../classes/auto-cancel.service';
import { ROLE_CAPABILITIES } from '../identity/role-capabilities';
import { ROLES_KEY } from '../identity/roles.decorator';
import { OperationsAutomationController } from './operations-automation.controller';

describe('Prioritas 7 — Strict Non-Happy Path & Adversarial Suite', () => {
  describe('NHP-7.1: Robust Normalisasi Nomor Telepon & Injeksi Format Rusak', () => {
    let service: WhatsAppGatewayService;

    beforeEach(() => {
      service = new WhatsAppGatewayService({} as never);
    });

    it('menangani string kosong, spasi saja, dan null/undefined tanpa crash', () => {
      expect(service.normalizePhone('')).toBe('');
      expect(service.normalizePhone('   ')).toBe('');
      expect(service.normalizePhone(null as never)).toBe('');
      expect(service.normalizePhone(undefined as never)).toBe('');
    });

    it('menangani string tanpa karakter angka tanpa menghasilkan tanda tambah gantung (+)', () => {
      expect(service.normalizePhone('bukan-nomor')).toBe('');
      expect(service.normalizePhone('---')).toBe('');
      expect(service.normalizePhone('+++')).toBe('');
      expect(service.normalizePhone('@#$%^')).toBe('');
    });

    it('menormalisasi variasi nomor telepon Indonesia ke format baku E.164 (+62)', () => {
      expect(service.normalizePhone('081234567890')).toBe('+6281234567890');
      expect(service.normalizePhone('6281234567890')).toBe('+6281234567890');
      expect(service.normalizePhone('+6281234567890')).toBe('+6281234567890');
      expect(service.normalizePhone('81234567890')).toBe('+6281234567890');
      expect(service.normalizePhone('0812-3456-7890')).toBe('+6281234567890');
      expect(service.normalizePhone('(0812) 3456 7890')).toBe('+6281234567890');
    });

    it('menolak pengiriman sendMessage ke nomor invalid (< 8 digit) secara fail-safe', async () => {
      const result = await service.sendMessage({
        to: '081',
        text: 'Halo testing',
        recipientType: 'CUSTOMER',
        reminderType: 'TEST_INVALID',
      });

      expect(result.success).toBe(false);
      expect(result.status).toBe('FAILED');
      expect(result.error).toContain('Nomor telepon tujuan tidak valid');
    });
  });

  describe('NHP-7.2: In-Flight Lock & Deduplication Guard Pengiriman Bersamaan', () => {
    it('mencegah pengiriman ganda ketika dua proses memanggil nomor dan tipe sama serentak', async () => {
      const mockDb = {
        reminderLog: {
          findFirst: jest.fn(async () => null),
          create: jest.fn(async (args) => ({ id: 'log-1', ...args.data })),
        },
      };

      const gateway = new WhatsAppGatewayService(mockDb as never);
      const mockProvider = new MockWhatsAppProvider();
      gateway.setProvider(mockProvider);

      // Jalankan 2 pemanggilan serentak tanpa await berurutan
      const [res1, res2] = await Promise.all([
        gateway.sendMessage({
          to: '081234567890',
          text: 'Pesan pertama',
          recipientType: 'CUSTOMER',
          reminderType: 'EXPIRY_H7',
        }),
        gateway.sendMessage({
          to: '081234567890',
          text: 'Pesan kedua serentak',
          recipientType: 'CUSTOMER',
          reminderType: 'EXPIRY_H7',
        }),
      ]);

      const skipped = [res1, res2].filter((r) => r.status === 'SKIPPED_DUPLICATE');
      const sent = [res1, res2].filter((r) => r.status === 'SENT');

      expect(sent).toHaveLength(1);
      expect(skipped).toHaveLength(1);
      expect(skipped[0]?.provider).toBe('IDEMPOTENCY_GUARD');
    });
  });

  describe('NHP-7.3: Ketahanan Provider Meta API saat Network Gagal', () => {
    it('OfficialWhatsAppProvider mencatat FAILED dan tidak melempar unhandled exception saat fetch gagal', async () => {
      const provider = new OfficialWhatsAppProvider('mock-token', 'mock-phone-id');

      // Mock fetch global yang reject network error
      const originalFetch = global.fetch;
      global.fetch = jest.fn(async () => {
        throw new Error('ECONNREFUSED connect to graph.facebook.com:443');
      });

      try {
        const sendResult = await provider.sendMessage('081234567890', 'Uji coba ketahanan');
        expect(sendResult.success).toBe(false);
        expect(sendResult.error).toContain('ECONNREFUSED');
      } finally {
        global.fetch = originalFetch;
      }
    });

    it('OfficialWhatsAppProvider menangani respons HTTP 400 Bad Request dari Meta secara elegan', async () => {
      const provider = new OfficialWhatsAppProvider('mock-token', 'mock-phone-id');

      const originalFetch = global.fetch;
      global.fetch = jest.fn(async () => ({
        ok: false,
        status: 400,
        text: async () => '{"error":{"message":"Invalid OAuth access token"}}',
      } as never));

      try {
        const sendResult = await provider.sendMessage('081234567890', 'Uji coba error response');
        expect(sendResult.success).toBe(false);
        expect(sendResult.error).toContain('Meta API HTTP 400');
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  describe('NHP-7.4: Proteksi Mutlak Pelanggan Berhenti (Stopped Customer)', () => {
    it('mengecualikan 100% pelanggan dengan stoppedAt != null dari seluruh antrean pengingat', async () => {
      const now = new Date('2026-10-19T08:00:00Z');
      const mockDb = {
        paketPelanggan: {
          findMany: jest.fn(async (args) => {
            if (args?.where?.status === 'ACTIVE') {
              return [
                {
                  id: 'pkg-stopped',
                  validUntil: new Date('2026-10-20T00:00:00Z'), // H-1
                  remainingSessions: 3,
                  user: {
                    phone: '081299999999',
                    displayName: 'Member Berhenti',
                    stoppedAt: new Date('2026-08-01T00:00:00Z'), // Ditandai berhenti!
                  },
                  package: { name: 'Paket 10 Sesi' },
                },
              ];
            }
            return [];
          }),
        },
        reminderLog: {
          findMany: jest.fn(async () => []),
        },
      };

      const mockWhatsapp = {
        sendMessage: jest.fn(async () => ({ status: 'SENT' })),
        normalizePhone: jest.fn((p) => (p ? `+62${p.slice(1)}` : '')),
      };

      const mockTemplates = {
        whatsappText: jest.fn(async () => 'Pesan pengingat template'),
      };

      const service = new ReminderScheduleService(
        mockDb as never,
        mockWhatsapp as never,
        mockTemplates as never,
      );

      const result = await service.runCustomerExpiryReminders(now);

      // Customer yang berhenti wajib dihitung ke stoppedProtectedCount dan zero pesan dikirim
      expect(result.stoppedProtectedCount).toBe(1);
      expect(result.h1Count).toBe(0);
      expect(result.h3Count).toBe(0);
      expect(result.h7Count).toBe(0);
      expect(mockWhatsapp.sendMessage).not.toHaveBeenCalled();
    });
  });

  describe('NHP-7.5: Batas Maksimal 5x Follow-up Expired Renewal', () => {
    it('menghentikan follow-up expired jika riwayat ReminderLog sudah mencapai 5 kali', async () => {
      const now = new Date('2026-10-19T08:00:00Z');
      const mockDb = {
        paketPelanggan: {
          findMany: jest.fn(async (args) => {
            // Panggilan pertama untuk activePackages (kembalikan kosong)
            if (args.where?.status === 'ACTIVE') return [];
            // Panggilan kedua untuk expiredPackages
            return [
              {
                id: 'pkg-expired-5x',
                packageId: 'pkg-master-1',
                validUntil: new Date('2026-10-01T00:00:00Z'),
                user: {
                  phone: '081288888888',
                  displayName: 'Member Lama',
                  stoppedAt: null,
                  customerPackages: [],
                },
                package: { name: 'Paket Usang' },
              },
            ];
          }),
        },
        reminderLog: {
          findMany: jest.fn(async () => [
            { id: 'log-1', sentAt: new Date('2026-10-05') },
            { id: 'log-2', sentAt: new Date('2026-10-08') },
            { id: 'log-3', sentAt: new Date('2026-10-11') },
            { id: 'log-4', sentAt: new Date('2026-10-14') },
            { id: 'log-5', sentAt: new Date('2026-10-17') },
          ]),
        },
      };

      const mockWhatsapp = {
        sendMessage: jest.fn(async () => ({ status: 'SENT' })),
        normalizePhone: jest.fn((p) => (p ? `+62${p.slice(1)}` : '')),
      };

      const mockTemplates = {
        whatsappText: jest.fn(async () => 'Pesan renew'),
      };

      const service = new ReminderScheduleService(
        mockDb as never,
        mockWhatsapp as never,
        mockTemplates as never,
      );

      const result = await service.runCustomerExpiryReminders(now);

      // Karena sudah ada 5 riwayat, tidak boleh ada yang terkirim
      expect(result.expiredRenewCount).toBe(0);
      expect(mockWhatsapp.sendMessage).not.toHaveBeenCalled();
    });
  });

  describe('NHP-7.6: Conditional Claim & Race Condition Protection pada Auto-Cancel H-24', () => {
    it('melewati slot dan tidak mengirim notifikasi ganda jika staf telah membatalkan kelas saat evaluasi berjalan', async () => {
      process.env.ENABLE_AUTO_CANCEL = 'true';
      const now = new Date('2026-10-19T08:00:00Z');
      const startAt = new Date('2026-10-19T20:00:00Z'); // 12 jam lagi (< 24 jam)

      const tx = {
        slotKelas: {
          updateMany: jest.fn(async () => ({ count: 0 })), // Simulasi claim gagal karena status sudah berubah
        },
        pemesananKelas: { update: jest.fn() },
        sessionLedger: { create: jest.fn() },
      };

      const mockDb = {
        slotKelas: {
          findMany: jest.fn(async () => [
            {
              id: 'slot-race',
              branchId: 'b-1',
              classTypeId: 'ct-1',
              status: 'PUBLISHED',
              startAt,
              branch: { name: 'Green Garden', timezone: 'Asia/Jakarta' },
              classType: { name: 'Reformer Intro' },
              instructor: { phone: '0811111111', displayName: 'Instruktur' },
              bookings: [{ id: 'bkg-1', user: { phone: '0812222222' } }],
            },
          ]),
        },
        minQuotaSetting: {
          findUnique: jest.fn(async () => ({ active: true, minQuota: 3, cutoffHours: 24 })),
        },
        user: { findMany: jest.fn(async () => []) },
        $transaction: jest.fn(async (action: any) => action(tx)),
      };

      const mockWhatsapp = {
        sendMessage: jest.fn(async () => ({ success: true })),
      };

      const service = new AutoCancelService(mockDb as never, mockWhatsapp as never);
      const result = await service.evaluateClasses(now);

      // Klaim gagal (count: 0) -> slot diabaikan dan zero notifikasi terkirim
      expect(tx.slotKelas.updateMany).toHaveBeenCalled();
      expect(tx.pemesananKelas.update).not.toHaveBeenCalled();
      expect(mockWhatsapp.sendMessage).not.toHaveBeenCalled();
      expect(result.cancelledSlotsCount).toBe(0);
    });
  });

  describe('NHP-7.7: Keamanan Akses & Hak Peran Super Owner pada Pemicu Otomasi', () => {
    it('endpoint evaluasi auto-cancel dan reminders batch hanya boleh dipicu oleh SUPER_OWNER', () => {
      const getRoles = (methodName: keyof OperationsAutomationController) =>
        Reflect.getMetadata(ROLES_KEY, OperationsAutomationController.prototype[methodName]) as string[];

      expect(getRoles('evaluateAutoCancel')).toEqual(['SUPER_OWNER']);
      expect(getRoles('evaluateRemindersBatch')).toEqual(['SUPER_OWNER']);
    });

    it('peran ADMIN, MANAGER, dan CUSTOMER tidak memiliki kapabilitas automation:run', () => {
      expect(ROLE_CAPABILITIES.ADMIN).not.toContain('automation:run');
      expect(ROLE_CAPABILITIES.MANAGER).not.toContain('automation:run');
      expect(ROLE_CAPABILITIES.CUSTOMER).not.toContain('automation:run');
      expect(ROLE_CAPABILITIES.SUPER_OWNER).toContain('automation:run');
    });
  });
});
