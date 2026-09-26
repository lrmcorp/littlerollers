import { SetMetadata } from '@nestjs/common';

/**
 * Deklarasi akses rute. Semua rute API **wajib login** (AccessGuard global) kecuali ditandai
 * `@Public()`. Otorisasi selanjutnya (kapabilitas + cakupan cabang) tetap dilakukan di service;
 * `route-access.spec.ts` memastikan setiap handler punya salah satu bukti berikut:
 *
 *  - `@Public()`       : boleh diakses tanpa login (katalog publik, login/OTP, absensi via token, health).
 *  - `@SelfService()`  : cukup login; service WAJIB membatasi data ke `principal.userId`
 *                        (profil sendiri, pesanan sendiri, notifikasi sendiri, ...).
 *  - `@Roles(...)`     : dicek oleh RolesGuard.
 *  - selain itu        : service memanggil `policy.requireCapability/hasCapability/capabilityBranchScope`.
 *
 * Rute baru tanpa salah satunya membuat `route-access.spec.ts` gagal.
 */
export const PUBLIC_ROUTE_KEY = 'route-access:public';
export const SELF_SERVICE_ROUTE_KEY = 'route-access:self-service';

export const Public = () => SetMetadata(PUBLIC_ROUTE_KEY, true);
export const SelfService = () => SetMetadata(SELF_SERVICE_ROUTE_KEY, true);
