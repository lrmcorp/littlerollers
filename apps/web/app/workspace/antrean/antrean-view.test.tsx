import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type {
  AntreanTertinggal,
  ItemAntrean,
  WorkQueueClient,
} from '@/api-clients/work-queue-client';
import { AntreanView, catatanWaktu, keterangan, lamaMenunggu } from './antrean-view';

const NOW = new Date('2026-10-28T02:14:00Z').getTime();

const items: ItemAntrean[] = [
  {
    key: 'renewal',
    jumlah: 12,
    nada: 'TELAT',
    acuanPada: null,
    umurJam: 624,
    nilaiRp: 22_200_000,
    hot: 7,
    href: '/workspace/renewal',
  },
  {
    key: 'bukti',
    jumlah: 7,
    nada: 'MENUNGGU',
    acuanPada: null,
    umurJam: 30,
    nilaiRp: 12_950_000,
    href: '/workspace/payments?status=PENDING',
  },
  {
    key: 'kuota',
    jumlah: 2,
    nada: 'TENGGAT',
    acuanPada: '2026-10-28T10:30:00Z',
    umurJam: null,
    kelas: [
      { id: 's-1', nama: 'Group Reformer', mulai: '2026-10-28T10:30:00Z', terisi: 1, minimum: 4 },
      { id: 's-2', nama: 'Group Reformer', mulai: '2026-10-29T11:30:00Z', terisi: 2, minimum: 4 },
    ],
    href: '/workspace/classes',
  },
];

const client = (hasil: AntreanTertinggal | Error): WorkQueueClient => ({
  tertinggal: vi.fn(() =>
    hasil instanceof Error ? Promise.reject(hasil) : Promise.resolve(hasil),
  ),
});

describe('AntreanView', () => {
  it('menampilkan antrean sesuai urutan dari server, dengan tombol ke halaman kerjanya', async () => {
    render(<AntreanView now={NOW} client={client({ dibuatPada: '', items, gagal: [] })} />);

    const kartu = await screen.findAllByRole('listitem');
    expect(kartu.map((k) => within(k).getByRole('heading').textContent)).toEqual([
      '12 · Member yang paketnya sudah habis dan belum renew',
      '7 · Bukti transfer belum diperiksa',
      '2 · Kelas di bawah kuota minimum',
    ]);
    expect(within(kartu[0]!).getByRole('link', { name: 'Buka daftar' })).toHaveAttribute(
      'href',
      '/workspace/renewal',
    );
    expect(within(kartu[0]!).getByText('Paling lama menunggu 26 hari')).toBeVisible();
    expect(within(kartu[1]!).getByText('Masuk 1 hari lalu, masih dalam batas')).toBeVisible();
  });

  it('menyebut tampilan bersih hanya bila semua antrean berhasil dimuat', async () => {
    const { unmount } = render(
      <AntreanView now={NOW} client={client({ dibuatPada: '', items: [], gagal: [] })} />,
    );
    expect(await screen.findByText('Tidak ada antrean yang tertinggal')).toBeVisible();
    unmount();

    render(
      <AntreanView now={NOW} client={client({ dibuatPada: '', items: [], gagal: ['bukti'] })} />,
    );
    expect(await screen.findByText(/Sebagian antrean belum dapat dimuat/)).toHaveTextContent(
      'Bukti transfer belum diperiksa',
    );
    expect(screen.queryByText('Tidak ada antrean yang tertinggal')).toBeNull();
  });

  it('memberi tahu bila antrean gagal dimuat', async () => {
    render(<AntreanView now={NOW} client={client(new Error('x'))} />);
    expect(await screen.findByText(/Antrean belum dapat dimuat/)).toBeVisible();
  });
});

describe('kalimat antrean', () => {
  it('menyebut nilai rupiah dan segmen HOT pada renewal', () => {
    expect(keterangan(items[0]!, NOW, 'Asia/Jakarta')).toBe(
      'Nilai yang belum kembali Rp 22.200.000. 7 di antaranya segmen HOT, sesi habis lebih cepat dari masa berlaku.',
    );
  });

  it('menyebut kelas di bawah kuota dengan jam dan harinya', () => {
    expect(keterangan(items[2]!, NOW, 'Asia/Jakarta')).toMatch(
      /^Group Reformer 17\.30 hari ini, Group Reformer 18\.30 besok\./,
    );
    expect(catatanWaktu(items[2]!, NOW)).toBe('Kelas pertama mulai 8 jam lagi');
  });

  it('memakai satuan terbesar yang utuh', () => {
    expect(lamaMenunggu(0)).toBe('kurang dari 1 jam');
    expect(lamaMenunggu(3)).toBe('3 jam');
    expect(lamaMenunggu(30)).toBe('1 hari');
    expect(lamaMenunggu(100)).toBe('4 hari');
  });
});
