# BG-2 Synthetic US-CLS-01 Evidence

Tanggal eksekusi: 2026-07-22. Status: **LOCAL PASS / HOSTED PENDING**.

## Scope dan boundary

- Availability adalah interval eksplisit half-open `[startAt,endAt)`, bukan recurrence.
- Instants dinormalisasi UTC; timezone IANA cabang disimpan sebagai snapshot tampilan.
- Assignment `INSTRUCTOR` harus efektif sepanjang interval berdasarkan tanggal lokal cabang.
- Exclusion constraint menolak overlap instructor yang sama lintas cabang; interval adjacent diperbolehkan.
- Tidak ada class slot, booking, notification, atau production policy dalam increment ini.

## Evidence executable

| Area | Evidence | Hasil |
|---|---|---|
| Contract | OpenAPI validation | PASS — `1.2.0-draft`, checksum `13ae9f84cef473ac60285cf538e404dd8a14177827d1f1f476889a7ae20a4e98f`, 97 operations |
| API | Jest/typecheck | PASS lokal; PostgreSQL availability integration/concurrency suite tersedia saat `DATABASE_URL` tersedia |
| Flutter | analyze/widget | PASS lokal — list/create, empty, invalid, overlap, assignment dan offline states |
| Clients | generator `7.15.0` + Dart `build_runner` | PASS generation; hosted Docker drift pending |
| Database | migration `20260722000400_instructor_availability` | Prisma schema valid; empty migration/double seed hosted pending |

## Review disposition

- **AI QA:** LOCAL PASS — range, pagination, replay, adjacent/overlap dan Flutter states tersedia; hosted PostgreSQL pending.
- **AI Security:** LOCAL PASS — self-only capability, assignment/branch hiding, masked audit dan no outbox/PII; Gitleaks pending.
- **AI Peer Reviewer:** LOCAL PASS — availability terisolasi dari class-slot/booking policy; no production defaults.

`US-CLS-01` belum dipromosikan sebelum source/evidence commit terakhir hosted-green. Setelah closure, `US-CLS-02 = NEXT`; `US-BKG-01` menunggu published class slot; `BG-3 = PENDING`, `PG-1 = BLOCKED`.
