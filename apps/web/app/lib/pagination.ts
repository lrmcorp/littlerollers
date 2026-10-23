/**
 * Ukuran halaman baku daftar panel staf (10 data per halaman secara konsisten).
 */
export const ADMIN_PAGE_SIZE = 10;

/** Nomor baris awal (offset) untuk halaman ke-n pada penelusuran berbasis cursor. */
export const pageOffset = (previousPages: number, pageSize: number = ADMIN_PAGE_SIZE) =>
  previousPages * pageSize;
