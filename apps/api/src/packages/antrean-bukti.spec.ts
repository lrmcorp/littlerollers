import {
  antreanBukti,
  BATAS_PERIKSA_HARI,
  ringkasAntrean,
  urutTertinggalDulu,
} from './antrean-bukti';

const UNGGAH = new Date('2026-10-26T09:00:00.000Z');
const jamSetelah = (j: number) => new Date(UNGGAH.getTime() + j * 3_600_000);

describe('antreanBukti', () => {
  it('masih menunggu ketika belum melewati dua hari', () => {
    const hasil = antreanBukti({ uploadedAt: UNGGAH, now: jamSetelah(40) });

    expect(hasil.status).toBe('MENUNGGU');
    expect(hasil.umurJam).toBe(40);
    expect(hasil.telatJam).toBe(0);
  });

  it('tepat pada batas dua hari belum dihitung telat', () => {
    const hasil = antreanBukti({ uploadedAt: UNGGAH, now: jamSetelah(BATAS_PERIKSA_HARI * 24) });

    expect(hasil.status).toBe('MENUNGGU');
    expect(hasil.telatJam).toBe(0);
  });

  it('telat satu jam setelah batas lewat', () => {
    const hasil = antreanBukti({
      uploadedAt: UNGGAH,
      now: jamSetelah(BATAS_PERIKSA_HARI * 24 + 1),
    });

    expect(hasil.status).toBe('TELAT');
    expect(hasil.telatJam).toBe(1);
  });

  it('memakai jam sejak unggah, bukan hari kalender', () => {
    // Diunggah Senin 23.00; Rabu 01.00 baru 26 jam, belum telat walau sudah ganti dua tanggal.
    const seninMalam = new Date('2026-10-26T16:00:00.000Z');
    const rabuDini = new Date('2026-10-27T18:00:00.000Z');

    const hasil = antreanBukti({ uploadedAt: seninMalam, now: rabuDini });

    expect(hasil.status).toBe('MENUNGGU');
    expect(hasil.umurJam).toBe(26);
  });

  it('keluar dari antrean begitu diperiksa, walau pemeriksaannya sendiri terlambat', () => {
    const hasil = antreanBukti({
      uploadedAt: UNGGAH,
      verifiedAt: jamSetelah(100),
      now: jamSetelah(200),
    });

    expect(hasil.status).toBe('SUDAH_DIPERIKSA');
    expect(hasil.telatJam).toBe(0);
    // Umurnya dihitung sampai saat diperiksa, bukan sampai sekarang.
    expect(hasil.umurJam).toBe(100);
  });

  it('memberi tenggat yang bisa ditampilkan ke staf', () => {
    const hasil = antreanBukti({ uploadedAt: UNGGAH, now: jamSetelah(1) });

    expect(hasil.batasPeriksa.toISOString()).toBe('2026-10-28T09:00:00.000Z');
  });

  it('menghormati batas yang berbeda bila studio mengubah kebijakannya', () => {
    const hasil = antreanBukti({ uploadedAt: UNGGAH, now: jamSetelah(30), batasHari: 1 });

    expect(hasil.status).toBe('TELAT');
  });

  it('tidak pernah melaporkan umur negatif bila jam server bergeser mundur', () => {
    const hasil = antreanBukti({ uploadedAt: UNGGAH, now: jamSetelah(-5) });

    expect(hasil.umurJam).toBe(0);
    expect(hasil.telatJam).toBe(0);
  });
});

describe('urutTertinggalDulu', () => {
  it('menempatkan yang paling lama menunggu di atas', () => {
    const now = jamSetelah(100);
    const baris = [
      { id: 'baru', uploadedAt: jamSetelah(90) },
      { id: 'lama', uploadedAt: UNGGAH },
      { id: 'sedang', uploadedAt: jamSetelah(50) },
    ];

    const urut = urutTertinggalDulu(baris, (b) => antreanBukti({ uploadedAt: b.uploadedAt, now }));

    expect(urut.map((b) => b.id)).toEqual(['lama', 'sedang', 'baru']);
  });

  it('tidak mengubah larik aslinya', () => {
    const now = jamSetelah(100);
    const baris = [{ uploadedAt: jamSetelah(90) }, { uploadedAt: UNGGAH }];
    const salinan = [...baris];

    urutTertinggalDulu(baris, (b) => antreanBukti({ uploadedAt: b.uploadedAt, now }));

    expect(baris).toEqual(salinan);
  });
});

describe('ringkasAntrean', () => {
  it('menghitung yang menunggu dan yang telat secara terpisah', () => {
    const now = jamSetelah(60);
    const semua = [
      antreanBukti({ uploadedAt: UNGGAH, now }), // 60 jam, telat
      antreanBukti({ uploadedAt: jamSetelah(40), now }), // 20 jam, menunggu
      antreanBukti({ uploadedAt: jamSetelah(10), verifiedAt: jamSetelah(20), now }), // selesai
    ];

    const ringkas = ringkasAntrean(semua);

    expect(ringkas.menunggu).toBe(2);
    expect(ringkas.telat).toBe(1);
    expect(ringkas.tertuaJam).toBe(60);
  });

  it('melaporkan nol pada antrean yang bersih', () => {
    const now = jamSetelah(60);
    const ringkas = ringkasAntrean([
      antreanBukti({ uploadedAt: UNGGAH, verifiedAt: jamSetelah(5), now }),
    ]);

    expect(ringkas).toEqual({ menunggu: 0, telat: 0, tertuaJam: 0 });
  });
});
