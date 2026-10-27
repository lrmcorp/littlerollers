import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppFeedbackProvider } from '../components/app-feedback';
import type { IdentityVerificationReviewCase } from '@/api-clients/identity-verification-client';
import { FastReviewView } from '../identity-verifications/fast-review-view';

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const mockDoc = (id: string, overrides: Record<string, unknown> = {}) => ({
  id,
  kind: 'KTP_FRONT',
  status: 'PENDING',
  uploadStatus: 'FINALIZED',
  scanStatus: 'CLEAN',
  fileName: `${id}.jpg`,
  mimeType: 'image/jpeg',
  sizeBytes: 1500,
  rejectionReasonCode: null,
  rejectionNote: null,
  reviewedAt: null,
  deletedAt: null,
  createdAt: '2026-10-20T08:00:00Z',
  version: 1,
  ...overrides,
});

const mockCase = (
  userId: string,
  name: string,
  birthDate: string,
  documents: ReturnType<typeof mockDoc>[],
) =>
  ({
    id: `case-${userId}`,
    user: {
      id: userId,
      displayName: name,
      profileName: name,
      birthDate,
      phoneMasked: '+62••••8888',
      status: 'ACTIVE',
    },
    verificationStatus: 'PENDING',
    oldestAt: null,
    documents,
  }) as unknown as IdentityVerificationReviewCase;

const sampleCases = [
  mockCase('user-1', 'Alya Rahmawati', '1995-07-14', [
    mockDoc('doc-ktp-1'),
    mockDoc('doc-selfie-1', { kind: 'SELFIE', createdAt: '2026-10-20T08:05:00Z' }),
  ]),
  mockCase('user-2', 'Budi Santoso', '1990-12-25', [
    mockDoc('doc-ktp-2', { createdAt: '2026-10-21T09:00:00Z' }),
  ]),
];

const createMockClient = (overrides: Record<string, unknown> = {}) => ({
  reviewQueue: vi.fn().mockResolvedValue({
    items: sampleCases,
    summary: { pendingDocuments: 3 },
    page: { hasMore: false, nextCursor: null },
    generatedAt: '2026-10-27T08:00:00Z',
  }),
  authorizeView: vi.fn().mockResolvedValue({ url: '/private/id-doc', expiresAt: '2030-01-01' }),
  readPrivateFile: vi.fn().mockResolvedValue(new Blob(['fake-image'], { type: 'image/jpeg' })),
  decide: vi.fn().mockResolvedValue({ ...mockDoc('doc-ktp-1'), status: 'APPROVED' }),
  ...overrides,
});

const renderFastReview = (client = createMockClient()) =>
  render(
    <AppFeedbackProvider>
      <FastReviewView
        client={client as never}
        capabilitiesOverride={['identity-verification:read', 'identity-verification:decide']}
        decisionDelayMs={10_000}
      />
    </AppFeedbackProvider>,
  );

describe('Tiket T-22: Mode Cepat Antrean Verifikasi Identitas (Mockup Papan 17)', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn().mockReturnValue('blob:mock-id-image'),
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn(),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const triggerImageLoad = async (accessibleName: RegExp) => {
    const img = await screen.findByRole('img', { name: accessibleName });
    fireEvent.load(img);
    return img;
  };

  it('1. Satu berkas satu layar: foto identitas di kiri, nama dan tanggal lahir pada akun di kanan, serta teks privasi nomor identitas', async () => {
    renderFastReview();
    await triggerImageLoad(/KTP depan Alya Rahmawati/i);

    // Kiri: Foto identitas yang diunggah
    expect(screen.getByRole('heading', { name: 'Foto identitas yang diunggah' })).toBeVisible();
    expect(screen.getByText(/Area gambar identitas, lebar minimal 600 px/i)).toBeVisible();

    // Kanan: Card Cocokkan dua hal ini saja
    const matchHeading = screen.getByRole('heading', { name: 'Cocokkan dua hal ini saja' });
    expect(matchHeading).toBeVisible();

    // Nama pada akun
    expect(screen.getByText('Nama pada akun')).toBeVisible();
    expect(screen.getByText('Alya Rahmawati')).toBeVisible();

    // Tanggal lahir pada akun
    expect(screen.getByText('Tanggal lahir pada akun')).toBeVisible();
    expect(screen.getByText(/14 Juli 1995/i)).toBeVisible();

    // Teks privasi nomor identitas tidak perlu dibaca atau dicatat
    expect(
      screen.getByText(
        /Nomor identitas tidak perlu dibaca atau dicatat\. Yang diperlukan hanya nama dan tanggal lahir cocok dengan foto\./i,
      ),
    ).toBeVisible();
  });

  it('2. Menampilkan 4 tombol aksi berlabel Mockup 17 dengan badge pintasan keyboard (S, U, T, L)', async () => {
    renderFastReview();
    await triggerImageLoad(/KTP depan Alya Rahmawati/i);

    // Tombol 1: Cocok, setujui (S)
    const approveBtn = screen.getByRole('button', { name: 'Setujui (S)' });
    expect(approveBtn).toBeVisible();
    expect(within(approveBtn).getByText('Cocok, setujui')).toBeVisible();
    expect(within(approveBtn).getByText('S')).toBeVisible();

    // Tombol 2: Foto tidak terbaca, minta ulang (U)
    const requestRetryBtn = screen.getByRole('button', { name: 'Minta foto ulang (U)' });
    expect(requestRetryBtn).toBeVisible();
    expect(within(requestRetryBtn).getByText('Foto tidak terbaca, minta ulang')).toBeVisible();
    expect(within(requestRetryBtn).getByText('U')).toBeVisible();

    // Tombol 3: Tidak cocok, tolak (T)
    const rejectBtn = screen.getByRole('button', { name: 'Tolak (T)' });
    expect(rejectBtn).toBeVisible();
    expect(within(rejectBtn).getByText('Tidak cocok, tolak')).toBeVisible();
    expect(within(rejectBtn).getByText('T')).toBeVisible();

    // Tombol 4: Ragu, lewati dulu (L)
    const skipBtn = screen.getByRole('button', { name: 'Lewati (L)' });
    expect(skipBtn).toBeVisible();
    expect(within(skipBtn).getByText('Ragu, lewati dulu')).toBeVisible();
    expect(within(skipBtn).getByText('L')).toBeVisible();
  });

  it('3. Satu berkas bisa diputuskan tanpa menyentuh mouse/tetikus menggunakan tombol S, antrean langsung maju', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const client = createMockClient();
    renderFastReview(client);
    await triggerImageLoad(/KTP depan Alya Rahmawati/i);

    // Tekan tombol 's' di keyboard (tanpa mouse)
    await user.keyboard('s');

    // Berkas langsung maju ke selfie Alya Rahmawati
    await triggerImageLoad(/Selfie Alya Rahmawati/i);
    expect(screen.getByText(/akan dikirim dalam 10 detik/i)).toBeVisible();

    // Sebelum 10 detik, server belum dipanggil
    expect(client.decide).not.toHaveBeenCalled();

    // Setelah 10 detik lewat, keputusan dikirim ke server
    await act(() => vi.advanceTimersByTimeAsync(10_000));
    expect(client.decide).toHaveBeenCalledWith('doc-ktp-1', 'approve', {
      expectedVersion: 1,
      reasonCode: undefined,
      note: undefined,
    });
  });

  it('4. Membatalkan keputusan dengan pintasan Z selama dalam tahan 10 detik, tidak mengirim apa pun ke server', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const client = createMockClient();
    renderFastReview(client);
    await triggerImageLoad(/KTP depan Alya Rahmawati/i);

    // Setujui dengan keyboard
    await user.keyboard('s');
    await screen.findByRole('img', { name: /Selfie Alya Rahmawati/i });

    // Batalkan dengan keyboard 'z'
    await user.keyboard('z');

    // Berkas sebelumnya kembali ke layar
    expect(await screen.findByRole('img', { name: /KTP depan Alya Rahmawati/i })).toBeVisible();

    // Majukan 20 detik, tidak ada pemanggilan server
    await act(() => vi.advanceTimersByTimeAsync(20_000));
    expect(client.decide).not.toHaveBeenCalled();
    expect(screen.queryByText(/akan dikirim dalam/i)).toBeNull();
  });

  it('5. Berkas yang dilewati (L) masuk ke daftar Perlu dilihat ulang dan tidak hilang', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const client = createMockClient({
      reviewQueue: vi.fn().mockResolvedValue({
        items: [sampleCases[1]], // Hanya 1 berkas: Budi Santoso
        summary: { pendingDocuments: 1 },
        page: { hasMore: false, nextCursor: null },
        generatedAt: '2026-10-27T08:00:00Z',
      }),
    });
    renderFastReview(client);
    await triggerImageLoad(/KTP depan Budi Santoso/i);

    // Tekan 'l' untuk melewati berkas
    await user.keyboard('l');

    // Berkas utama selesai, masuk daftar perlu dilihat ulang
    expect(await screen.findByText('Berkas utama selesai')).toBeVisible();
    expect(screen.getByText(/1 perlu dilihat ulang/i)).toBeVisible();

    // Klik tombol periksa ulang berkas yang dilewati
    const revisitBtn = screen.getByRole('button', { name: 'Periksa ulang berkas yang dilewati' });
    await user.click(revisitBtn);

    // Berkas yang dilewati tampil kembali di layar
    expect(await screen.findByRole('img', { name: /KTP depan Budi Santoso/i })).toBeVisible();
    expect(client.decide).not.toHaveBeenCalled();
  });

  it('6. Penghitung sisa antrean dan progress bar terlihat terus di header', async () => {
    renderFastReview();
    await triggerImageLoad(/KTP depan Alya Rahmawati/i);

    // Judul halaman
    expect(screen.getByRole('heading', { name: 'Verifikasi identitas' })).toBeVisible();

    // Sisa antrean terlihat terus
    expect(screen.getByText(/Sisa antrean:\s*3\s*berkas/i)).toBeVisible();
    expect(screen.getByText(/Berkas ke 1 dari 3/i)).toBeVisible();

    // Tombol keluar dari mode cepat
    expect(screen.getByRole('link', { name: /Keluar dari mode cepat/i })).toHaveAttribute(
      'href',
      '/identity-verifications',
    );
  });

  it('7. Tidak ada tombol setujui banyak sekaligus (no bulk approval) untuk menjaga kepatuhan akses studio', () => {
    renderFastReview();
    expect(screen.queryByRole('button', { name: /Setujui semua/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Setujui massal/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Bulk approve/i })).toBeNull();
  });
});
