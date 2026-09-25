/**
 * Ukuran halaman baku daftar panel staf. API memakai 20 data per halaman (`PAGE_SIZE` di service),
 * jadi nomor baris dan jumlah halaman dihitung dari konstanta ini, bukan angka 20 yang tersebar.
 */
export const ADMIN_PAGE_SIZE = 20;

/** Nomor baris awal (offset) untuk halaman ke-n pada penelusuran berbasis cursor. */
export const pageOffset = (previousPages: number) => previousPages * ADMIN_PAGE_SIZE;
