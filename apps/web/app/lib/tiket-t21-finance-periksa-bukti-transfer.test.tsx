import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PurchaseReviewClient } from '../api-clients/purchase-client';
import { PaymentReviewDetailView } from '../workspace/payments/[id]/payment-review-detail-view';

const routerPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: routerPush }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const samplePurchase = {
  id: 'purchase-1',
  branchId: 'branch-1',
  userId: 'customer-1',
  packageId: 'package-1',
  paymentProofId: 'proof-1',
  packageNameSnapshot: 'Paket 10 Sesi Pilates',
  priceRpSnapshot: 2_000_000,
  payableAmountRpSnapshot: 2_000_844, // dengan kode unik
  sessionCountSnapshot: 10,
  durationDaysSnapshot: 30,
  status: 'WAITING_VERIFICATION' as const,
  submittedAt: new Date('2026-07-23T02:00:00Z'),
  version: 0,
  auditReference: null,
  customer: {
    id: 'customer-1',
    displayName: 'Alya Rahmawati',
    phoneMasked: '+62••••5678',
  },
  branch: { id: 'branch-1', code: 'SNP', name: 'Daily Dose Senopati', timezone: 'Asia/Jakarta' },
  paymentProof: {
    id: 'proof-1',
    uploadStatus: 'FINALIZED' as const,
    scanStatus: 'CLEAN' as const,
    mimeType: 'image/jpeg',
    sizeBytes: 2048,
  },
  activationSummary: null,
};

const secondPurchase = {
  ...samplePurchase,
  id: 'purchase-2',
  customer: {
    id: 'customer-2',
    displayName: 'Budi Santoso',
    phoneMasked: '+62••••9012',
  },
  submittedAt: new Date('2026-07-23T03:30:00Z'),
};

const createMockClient = (overrides: Partial<PurchaseReviewClient> = {}): PurchaseReviewClient => ({
  list: vi.fn().mockResolvedValue({
    items: [samplePurchase, secondPurchase],
    summary: {
      pending: 2,
      actionRequired: 0,
      approved: 0,
      rejected: 0,
      expired: 0,
      totalAmountRp: 4_001_688,
      agingOver24Hours: 0,
    },
    generatedAt: new Date('2026-07-23T04:00:00Z'),
    page: { nextCursor: null, hasMore: false },
  }),
  detail: vi.fn().mockResolvedValue({
    purchase: samplePurchase,
    timeline: {
      submittedAt: samplePurchase.submittedAt,
      proofFinalizedAt: new Date('2026-07-23T02:05:00Z'),
      decidedAt: null,
    },
    decisionActorMasked: null,
    activation: null,
    balance: {
      sessionCount: 10,
      available: 10,
      reserved: 0,
      used: 0,
    },
    usageHistory: { items: [], page: { nextCursor: null, hasMore: false } },
  }),
  loadProof: vi.fn().mockResolvedValue(new Blob(['fake-image-bytes'], { type: 'image/jpeg' })),
  approve: vi.fn().mockResolvedValue({
    purchase: { ...samplePurchase, status: 'APPROVED', version: 1 },
    customerPackage: {
      id: 'pkg-active-1',
      branchId: 'branch-1',
      customerUserId: 'customer-1',
      packageId: 'package-1',
      classTypeId: 'class-1',
      packageName: 'Paket 10 Sesi Pilates',
      branchName: 'Daily Dose Senopati',
      status: 'ACTIVE',
      activationDate: new Date('2026-07-23'),
      expiryAt: new Date('2026-08-22T00:00:00Z'),
      ledgerBalance: 10,
      reserved: 0,
      available: 10,
    },
  }),
  reject: vi.fn().mockResolvedValue({
    purchase: { ...samplePurchase, status: 'ACTION_REQUIRED', version: 1 },
  }),
  ...overrides,
});

describe('Tiket T-21: Layar Pemeriksaan Bukti Transfer untuk Finance (Mockup Papan 16)', () => {
  beforeEach(() => {
    routerPush.mockClear();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn().mockReturnValue('blob:mock-proof-image'),
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn(),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('1. Menyandingkan nominal paket dan nominal pada bukti berdampingan sebagai elemen terbesar dengan selisih tertulis kata', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const client = createMockClient();

    render(
      <PaymentReviewDetailView
        id="purchase-1"
        returnTo="/workspace/payments?status=WAITING_VERIFICATION"
        client={client}
        authorityOverride={{ canReview: true, canDecide: true }}
      />,
    );

    const group = await screen.findByRole('group', { name: 'Perbandingan nominal' });
    expect(group).toBeVisible();

    // Nominal paket (sistem): Rp 2.000.844
    expect(within(group).getByText(/2\.000\.844/)).toBeVisible();

    // Input nominal bukti
    const input = within(group).getByLabelText(/Nominal yang terlihat di bukti/);
    expect(input).toBeVisible();

    // Kasus 1: Selisih kurang (kode unik tidak terbawa)
    await user.type(input, '2.000.000');
    const statusKurang = within(group).getByRole('status');
    expect(statusKurang).toHaveTextContent(/Kurang Rp\s?844/i);
    expect(statusKurang).toHaveTextContent(/Kode unik mungkin tidak terbawa/i);

    // Kasus 2: Selisih lebih
    await user.clear(input);
    await user.type(input, '2.010.000');
    const statusLebih = within(group).getByRole('status');
    expect(statusLebih).toHaveTextContent(/Lebih Rp\s?9\.156/i);

    // Kasus 3: Sama persis
    await user.clear(input);
    await user.type(input, '2000844');
    const statusSama = within(group).getByRole('status');
    expect(statusSama).toHaveTextContent(/sama persis/i);
  });

  it('2. Menampilkan gambar bukti minimal 420px dengan kontrol perbesar, perkecil, putar, dan atur ulang', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const client = createMockClient();

    render(
      <PaymentReviewDetailView
        id="purchase-1"
        returnTo="/workspace/payments?status=WAITING_VERIFICATION"
        client={client}
        authorityOverride={{ canReview: true, canDecide: true }}
      />,
    );

    await screen.findByRole('group', { name: 'Perbandingan nominal' });

    // Buka gambar bukti
    const previewBtn = screen.getByRole('button', { name: 'Preview bukti' });
    await user.click(previewBtn);

    const image = await screen.findByRole('img', { name: /Bukti pembayaran Alya Rahmawati/ });
    expect(image).toBeVisible();

    // Pastikan container memiliki styling tinggi minimal 420px
    const container = image.closest('.min-h-\\[420px\\]');
    expect(container).not.toBeNull();

    // Uji kontrol Zoom In (skala naik menjadi 1.5)
    const zoomInBtn = screen.getByRole('button', { name: 'Perbesar' });
    await user.click(zoomInBtn);
    expect(image.style.transform).toContain('scale(1.5)');

    // Uji kontrol Putar (Rotate 90 deg)
    const rotateBtn = screen.getByRole('button', { name: 'Putar' });
    await user.click(rotateBtn);
    expect(image.style.transform).toContain('rotate(90deg)');

    // Uji kontrol Perkecil (Zoom Out kembali ke skala 1)
    const zoomOutBtn = screen.getByRole('button', { name: 'Perkecil' });
    await user.click(zoomOutBtn);
    expect(image.style.transform).toContain('scale(1)');

    // Uji kontrol Atur ulang
    await user.click(rotateBtn);
    expect(image.style.transform).toContain('rotate(180deg)');
    const resetBtn = screen.getByRole('button', { name: 'Atur ulang' });
    await user.click(resetBtn);
    expect(image.style.transform).toBe('rotate(0deg) scale(1)');
  });

  it('3. Menyediakan tiga tombol keputusan: Setujui dan aktifkan paket, Minta perbaikan bukti, dan Tolak pembayaran', async () => {
    const client = createMockClient();

    render(
      <PaymentReviewDetailView
        id="purchase-1"
        returnTo="/workspace/payments?status=WAITING_VERIFICATION"
        client={client}
        authorityOverride={{ canReview: true, canDecide: true }}
      />,
    );

    const approveBtn = await screen.findByRole('button', { name: 'Setujui pembayaran' });
    expect(approveBtn).toBeInTheDocument();
    expect(approveBtn).toHaveTextContent(/Setujui dan aktifkan paket/i);

    const requestRevisionBtn = screen.getByRole('button', { name: 'Minta perbaikan bukti' });
    expect(requestRevisionBtn).toBeInTheDocument();

    const rejectBtn = screen.getByRole('button', { name: 'Tolak sebagai duplikat' });
    expect(rejectBtn).toBeInTheDocument();
    expect(rejectBtn).toHaveTextContent(/Tolak pembayaran/i);
  });

  it('4. Tombol setujui tidak aktif sebelum gambar bukti dibuka dan ditampilkan di layar', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const client = createMockClient();

    render(
      <PaymentReviewDetailView
        id="purchase-1"
        returnTo="/workspace/payments?status=WAITING_VERIFICATION"
        client={client}
        authorityOverride={{ canReview: true, canDecide: true }}
      />,
    );

    const approveBtn = await screen.findByRole('button', { name: 'Setujui pembayaran' });
    // Sebelum gambar bukti dibuka, tombol setujui wajib disabled
    expect(approveBtn).toBeDisabled();

    // Buka preview bukti
    await user.click(screen.getByRole('button', { name: 'Preview bukti' }));
    const image = await screen.findByRole('img', { name: /Bukti pembayaran Alya Rahmawati/ });
    // Gambar masih dalam status memuat, tetap disabled
    expect(approveBtn).toBeDisabled();

    // Jika terjadi error saat muat gambar, tetap disabled
    fireEvent.error(image);
    expect(approveBtn).toBeDisabled();

    // Setelah gambar sukses onload di layar, tombol setujui aktif
    fireEvent.load(image);
    expect(approveBtn).toBeEnabled();
  });

  it('5. Memindahkan antrean ke bukti berikutnya, menunda pengiriman 10 detik dengan tombol batalkan', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const client = createMockClient();

    render(
      <PaymentReviewDetailView
        id="purchase-1"
        returnTo="/workspace/payments?status=WAITING_VERIFICATION"
        client={client}
        authorityOverride={{ canReview: true, canDecide: true }}
        decisionDelayMs={10_000}
      />,
    );

    // Minta perbaikan bukti
    const mintaPerbaikanBtn = await screen.findByRole('button', { name: 'Minta perbaikan bukti' });
    await user.click(mintaPerbaikanBtn);

    // Banner tunda 10 detik tampil dengan tombol batalkan
    const banner = await screen.findByText(/akan dikirim dalam 10 detik/i);
    expect(banner).toBeVisible();
    expect(client.reject).not.toHaveBeenCalled();

    // Tombol batalkan ditekan
    const cancelBtn = screen.getByRole('button', { name: 'Batalkan' });
    await user.click(cancelBtn);

    // Majukan waktu 15 detik, keputusan tidak boleh terkirim
    await vi.advanceTimersByTimeAsync(15_000);
    expect(client.reject).not.toHaveBeenCalled();
    expect(screen.queryByText(/akan dikirim dalam/i)).toBeNull();

    // Jalankan keputusan kedua tanpa pembatalan hingga selesai 10 detik
    await user.click(screen.getByRole('button', { name: 'Minta perbaikan bukti' }));
    expect(await screen.findByText(/akan dikirim dalam 10 detik/i)).toBeVisible();

    await vi.advanceTimersByTimeAsync(10_000);
    await waitFor(() => {
      expect(client.reject).toHaveBeenCalledWith(
        'purchase-1',
        0,
        'PROOF_INVALID',
        expect.any(String),
        undefined,
      );
    });

    // Otomatis berpindah ke bukti berikutnya di antrean
    expect(routerPush).toHaveBeenCalledWith(expect.stringContaining('/workspace/payments/purchase-2'));
  });

  it('6. Menolak adanya persetujuan banyak sekaligus (no bulk approval) untuk menjaga integritas buku besar', () => {
    const client = createMockClient();

    render(
      <PaymentReviewDetailView
        id="purchase-1"
        returnTo="/workspace/payments?status=WAITING_VERIFICATION"
        client={client}
        authorityOverride={{ canReview: true, canDecide: true }}
      />,
    );

    expect(screen.queryByRole('button', { name: /Setujui semua/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Setujui massal/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Bulk approve/i })).toBeNull();
  });

  it('7. Menampilkan layout Master-Detail dengan sidebar antrean bukti transfer menunggu dan filter urutan', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const client = createMockClient();

    render(
      <PaymentReviewDetailView
        id="purchase-1"
        returnTo="/workspace/payments?status=WAITING_VERIFICATION"
        client={client}
        authorityOverride={{ canReview: true, canDecide: true }}
      />,
    );

    // Sidebar antrean hadir
    const queueSidebar = await screen.findByRole('complementary', { name: 'Antrean bukti transfer' });
    expect(queueSidebar).toBeVisible();

    // Teks total bukti menunggu dan tertua dikirim
    expect(within(queueSidebar).getByText(/2 bukti/i)).toBeVisible();
    expect(within(queueSidebar).getByText(/Tertua dikirim/i)).toBeVisible();

    // List item antrean tampil
    expect(within(queueSidebar).getByText('Alya Rahmawati')).toBeVisible();
    expect(within(queueSidebar).getByText('Budi Santoso')).toBeVisible();

    // Filter urutan: Tertua dulu / Terbaru dulu
    const sortSelect = within(queueSidebar).getByLabelText('Urutan antrean');
    expect(sortSelect).toBeVisible();
    expect(sortSelect).toHaveValue('oldest');

    await user.selectOptions(sortSelect, 'newest');
    expect(sortSelect).toHaveValue('newest');
  });
});
