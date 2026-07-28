# Referensi Dynamic Role dan Permission

**Status:** executable reference  
**Otorisasi pengelolaan:** capability `role-permission:manage` pada `SUPER_OWNER`  
**Sumber runtime:** tabel RBAC database melalui `PolicyService`

Daily Dose menggunakan database-managed RBAC. Delapan system role dan capability implementasi
dibuat oleh migration, sedangkan Super Owner dapat mengubah mapping capability system role,
membuat custom role, mengganti direct role user, dan membuat override `GRANT`/`DENY` dari
`/users/roles-permissions`.

Capability tidak dapat dibuat dari UI. Katalog tetap dibatasi oleh capability yang telah didukung
backend. Penambahan capability pada release baru harus memakai data migration eksplisit serta
authorization test; seeder reguler hanya memperbarui metadata dan tidak mengembalikan mapping yang
telah dicabut Super Owner.

## Model dan precedence

- `CapabilityDefinition`: key, label, deskripsi, kategori, sensitivity, active, `systemOnly`, dan
  `globalOnly`.
- `RoleDefinition`: system/custom role, code immutable, scope immutable, status, dan optimistic
  `version`.
- `RoleCapability`: mapping role ke capability.
- `AccessRoleAssignment`: direct assignment untuk custom role.
- `UserCapabilityOverride`: persistent `GRANT` atau `DENY`, global atau per cabang, sampai dicabut.
- `UserRole`: compatibility projection untuk delapan system role dan lifecycle assignment lama.

Keputusan efektif untuk satu capability dan cabang:

1. `DENY` user pada cabang yang cocok;
2. `DENY` user global;
3. `GRANT` user pada cabang yang cocok atau global;
4. grant system/custom role pada cabang yang cocok atau global;
5. default deny.

Backend menggunakan grant berbentuk `capability + branchId`. `capabilities: string[]` pada `/me`
dipertahankan hanya untuk kompatibilitas UI dan bukan boundary authorization.

## Proteksi

- `role-permission:manage` hanya milik system role `SUPER_OWNER`; tidak dapat diberikan ke custom
  role atau user override.
- `SUPER_OWNER` selalu mempertahankan `role-permission:manage`, `user:admin`, `audit:read`, dan
  `branch:all`.
- System role tidak dapat dihapus, dinonaktifkan, diubah code, atau diubah scope.
- Custom role tidak dapat dinonaktifkan selama masih memiliki assignment aktif.
- Super Owner tidak boleh mengubah role/override akunnya sendiri.
- Perubahan yang menghilangkan Super Owner aktif terakhir ditolak dengan `LAST_SUPER_OWNER`.
- Tidak tersedia hard delete untuk role, capability, assignment, atau override.
- Tidak ada MFA dan tidak ada ketergantungan approval pada MFA.
- Capability `globalOnly` tidak dapat ditempelkan ke role `BRANCH` atau override per cabang.
  Enforcement dilakukan saat konfigurasi disimpan dan saat grant efektif dihitung.

### Capability verifikasi identitas

| Capability | Scope | Fungsi |
|---|---|---|
| `identity-verification:read` | `GLOBAL_ONLY` | Antrean, metadata aman, penerbitan preview, dan file read privat |
| `identity-verification:decide` | `GLOBAL_ONLY` | Approve/reject dokumen |
| `identity-verification:delete` | `GLOBAL_ONLY` | Workflow penghapusan dokumen |

Ketiganya diberikan kepada `SUPER_OWNER`. Role reviewer custom wajib berscope `GLOBAL`.
`ADMIN` tidak memperoleh akses verifikasi identitas. Capability lama
`identity-verification:review` tidak aktif dan tidak lagi memberi akses, termasuk bila mapping atau
override historis masih tersimpan.

Setiap mutation membutuhkan `Idempotency-Key`, `expectedVersion` bila mengubah record yang sudah
ada, controlled reason, confirmation UI, dan audit before/after yang telah disanitasi. Session user
terdampak dicabut agar perubahan aktif pada login berikutnya.

## Pengelolaan role

- `CUSTOMER` berasal dari lifecycle customer.
- `OWNER` dan `INSTRUCTOR` berasal dari Assignment.
- `ADMIN`, `MANAGER`, `FINANCE`, `OPS`, `SUPER_OWNER`, dan custom role memakai direct assignment.
- Role scope `BRANCH` wajib memiliki cabang; role scope `GLOBAL` tidak boleh memiliki cabang.
- Code custom role memakai uppercase dan underscore, unik, serta immutable.

Halaman management menyediakan:

- pencarian/filter capability;
- edit matrix system/custom role;
- create dan clone custom role;
- preview diff dan jumlah user terdampak;
- searchable user selector;
- direct role replacement;
- persistent user `GRANT`/`DENY` global atau per cabang;
- revoke override;
- tautan audit history.

## Konfigurasi rollout

| Variabel | Nilai | Arti |
|---|---|---|
| `RBAC_POLICY_SOURCE` | `static` | Policy legacy menjadi authoritative. |
| `RBAC_POLICY_SOURCE` | `shadow` | Policy legacy authoritative; hasil database dibandingkan dan mismatch dicatat. |
| `RBAC_POLICY_SOURCE` | `database` | Database menjadi authoritative. |
| `RBAC_MANAGEMENT_ENABLED` | `false` | Read catalog tetap tersedia, mutation management ditolak. |
| `RBAC_MANAGEMENT_ENABLED` | `true` | Mutation UI/API aktif; hanya valid bersama source `database`. |

Urutan production: migrate/backfill → `shadow` → selesaikan mismatch dan UAT → `database` dengan
management masih mati → observation window → aktifkan management. Rollback mutation cukup
mematikan `RBAC_MANAGEMENT_ENABLED`; konfigurasi dan audit database tidak dihapus.

## Seeder dan migration

- Migration bootstrap:
  `apps/api/prisma/migrations/20260729200000_dynamic_rbac/migration.sql`.
- Migration hardening identitas:
  `apps/api/prisma/migrations/20260730090000_identity_review_global_access/migration.sql`.
- Seeder metadata idempotent: `apps/api/prisma/seed/access-control.ts`.
- Matrix bootstrap kompatibilitas: `ROLE_CAPABILITIES` di
  `apps/api/src/identity/policy.service.ts`.

`ROLE_CAPABILITIES` hanya dipakai untuk static/shadow compatibility dan bootstrap migration. Setelah
cutover database, perubahan operasional mapping dilakukan melalui UI/API; capability baru tetap
memerlukan implementasi kode dan data migration.

## Error contract

Mutation memakai stable code:

- `ROLE_CODE_CONFLICT`
- `ROLE_IN_USE`
- `PROTECTED_ROLE_CHANGE`
- `PROTECTED_CAPABILITY`
- `LAST_SUPER_OWNER`
- `SELF_ACCESS_CHANGE_FORBIDDEN`
- `PERMISSION_OVERRIDE_EXISTS`
- `STALE_VERSION`
- `IDEMPOTENCY_KEY_REUSED`

Tidak ada perubahan akses yang mengirim email pada versi pertama. Audit adalah kanal operasional,
dan user terdampak diminta login ulang.
