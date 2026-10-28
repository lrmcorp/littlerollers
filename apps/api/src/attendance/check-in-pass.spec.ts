import {
  buildPass,
  derivePassBody,
  parsePass,
  passBelongsTo,
  scanWindowFor,
  SCAN_OPENS_MINUTES_BEFORE,
} from './check-in-pass';

const userA = '00000000-0000-4000-8000-000000000001';
const userB = '00000000-0000-4000-8000-000000000002';

describe('pass check-in tetap', () => {
  it('menghasilkan nilai yang sama setiap kali, supaya member cukup menyimpan QR sekali', () => {
    expect(derivePassBody(userA)).toBe(derivePassBody(userA));
    expect(buildPass(userA)).toBe(buildPass(userA));
  });

  it('memberi nilai berbeda untuk orang yang berbeda', () => {
    expect(derivePassBody(userA)).not.toBe(derivePassBody(userB));
  });

  it('tidak memuat userId sehingga pass orang lain tidak bisa ditebak dari id berurutan', () => {
    const pass = buildPass(userA);
    expect(pass).not.toContain(userA);
    expect(pass).not.toContain('0000-4000');
  });

  it('memakai awalan dan panjang yang tetap', () => {
    expect(buildPass(userA)).toMatch(/^dd-pass:v1:[A-Za-z0-9_-]{43}$/u);
  });

  it('berubah bila rahasia server berganti, jadi pass lama tidak berlaku setelah rotasi', () => {
    const asli = process.env.CHECK_IN_PASS_SECRET;
    process.env.CHECK_IN_PASS_SECRET = 'rahasia-satu';
    const satu = derivePassBody(userA);
    process.env.CHECK_IN_PASS_SECRET = 'rahasia-dua';
    const dua = derivePassBody(userA);
    if (asli === undefined) delete process.env.CHECK_IN_PASS_SECRET;
    else process.env.CHECK_IN_PASS_SECRET = asli;

    expect(satu).not.toBe(dua);
  });
});

describe('membaca hasil pindai', () => {
  it('menerima bentuk lengkap', () => {
    expect(parsePass(buildPass(userA))).toBe(derivePassBody(userA));
  });

  it('menerima badannya saja, karena sebagian pemindai memotong awalan', () => {
    expect(parsePass(derivePassBody(userA))).toBe(derivePassBody(userA));
  });

  it('mengabaikan spasi di awal dan akhir', () => {
    expect(parsePass(`  ${buildPass(userA)}  `)).toBe(derivePassBody(userA));
  });

  it('menolak QR yang bukan pass Daily Dose', () => {
    expect(parsePass('https://contoh.id/apa-saja')).toBeNull();
    expect(parsePass('dd-checkin:v1:abc')).toBeNull();
    expect(parsePass('')).toBeNull();
    expect(parsePass('dd-pass:v1:terlalu-pendek')).toBeNull();
  });
});

describe('mencocokkan pass dengan pemiliknya', () => {
  it('mengenali pass milik orang itu sendiri', () => {
    expect(passBelongsTo(userA, derivePassBody(userA))).toBe(true);
  });

  it('menolak pass milik orang lain', () => {
    expect(passBelongsTo(userA, derivePassBody(userB))).toBe(false);
  });

  it('menolak nilai dengan panjang berbeda tanpa melempar galat', () => {
    expect(passBelongsTo(userA, 'pendek')).toBe(false);
    expect(passBelongsTo(userA, '')).toBe(false);
  });
});

describe('jendela pemindaian', () => {
  const mulai = new Date('2026-10-28T09:00:00.000Z');
  const selesai = new Date('2026-10-28T09:55:00.000Z');

  it('belum terbuka jauh sebelum kelas mulai', () => {
    const now = new Date(mulai.getTime() - (SCAN_OPENS_MINUTES_BEFORE + 1) * 60_000);
    expect(scanWindowFor(mulai, selesai, now)).toBe('TOO_EARLY');
  });

  it('terbuka tepat pada batas 45 menit sebelum kelas', () => {
    const now = new Date(mulai.getTime() - SCAN_OPENS_MINUTES_BEFORE * 60_000);
    expect(scanWindowFor(mulai, selesai, now)).toBe('OPEN');
  });

  it('terbuka selama kelas berlangsung', () => {
    expect(scanWindowFor(mulai, selesai, new Date('2026-10-28T09:30:00.000Z'))).toBe('OPEN');
  });

  it('masih terbuka tepat saat kelas berakhir', () => {
    expect(scanWindowFor(mulai, selesai, selesai)).toBe('OPEN');
  });

  it('tertutup setelah kelas berakhir', () => {
    expect(scanWindowFor(mulai, selesai, new Date('2026-10-28T09:55:01.000Z'))).toBe('CLOSED');
  });
});
