# Runbook Dynamic RBAC dan Access Recovery

**Status:** DRAFT untuk UAT  
**Pemilik:** Operations / Technical Lead  
**Akses:** Super Owner

## Pemeriksaan sebelum perubahan

1. Pastikan actor bukan user target.
2. Pastikan target dan cabang benar.
3. Review effective grants, denials, lifecycle role, dan custom role pada halaman
   `/users/roles-permissions`.
4. Pilih controlled reason dan tulis note tanpa password, token, email mentah, atau data sensitif.
5. Review diff capability dan jumlah user yang session-nya akan dicabut.

## Recovery akses user

1. Cari user pada panel `Assignment & override`.
2. Periksa override `DENY` terlebih dahulu karena precedence-nya paling tinggi.
3. Cabut override yang keliru atau koreksi direct role.
4. Konfirmasi audit event tepat satu dan session user berstatus revoked.
5. Minta user login ulang dan verifikasi endpoint/cabang yang semestinya.

Jangan mengubah `CUSTOMER`, `OWNER`, atau `INSTRUCTOR` melalui direct role. Perbaiki lifecycle
customer atau Assignment sumbernya.

## Recovery role

- Jika capability role keliru, muat versi terbaru, review diff, lalu simpan dengan reason
  `ACCESS_CORRECTION`.
- Jika muncul `STALE_VERSION`, jangan retry memakai payload lama; refresh dan review ulang.
- Jika muncul `ROLE_IN_USE`, pindahkan seluruh assignment aktif sebelum menonaktifkan custom role.
- Jika muncul `PROTECTED_ROLE_CHANGE`, jangan bypass database constraint atau mengedit tabel manual.
- Jika muncul `LAST_SUPER_OWNER`, buat/aktifkan Super Owner kedua yang sah sebelum pergantian.

## Break-glass tanpa self-change

Self-change selalu ditolak. Recovery Super Owner dilakukan oleh Super Owner aktif lain. Bila tidak ada
session Super Owner yang dapat digunakan:

1. matikan `RBAC_MANAGEMENT_ENABLED`;
2. pertahankan database dan audit apa adanya;
3. Technical Lead menjalankan prosedur data recovery terkontrol dengan backup, peer review, dan
   correlation reference;
4. pulihkan satu assignment `SUPER_OWNER` pada user aktif yang telah diverifikasi;
5. cabut semua session target, validasi login ulang, lalu aktifkan management setelah review.

Tidak boleh menonaktifkan foreign key, menghapus audit, atau memberi
`role-permission:manage` melalui override.

## Rollback policy

1. Set `RBAC_MANAGEMENT_ENABLED=false` untuk menghentikan mutation.
2. Bila kegagalan adalah policy runtime, ubah `RBAC_POLICY_SOURCE=shadow` agar static policy kembali
   authoritative sambil mismatch dicatat.
3. Restart API secara terkontrol.
4. Verifikasi `/me`, denial rate, shadow mismatch, session revocation, dan audit.
5. Jangan menghapus `RoleDefinition`, assignment, override, atau audit selama rollback.

## Evidence UAT

Catat actor, target user, role/capability, branch, reason code, correlation ID, audit ID, revoked
session count, hasil login ulang, serta bukti tidak ada cross-branch leakage.
