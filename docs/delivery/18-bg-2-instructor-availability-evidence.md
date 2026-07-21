# BG-2 Synthetic US-CLS-01 Evidence

Tanggal eksekusi: 2026-07-22. Status: **PASS FOR SYNTHETIC NON-PRODUCTION**.

Source commits: `77cab22` plus concurrency acceptance `e72c809`. Evidence commit: `5577637`; hosted `typescript`, `flutter`, dan `secrets` PASS berdasarkan konfirmasi pengguna. Run ID/URL tidak tersedia dan tidak difabrikasi.

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
| API | Jest/typecheck + hosted `typescript` | PASS — PostgreSQL availability integration/concurrency dan API pipeline hijau |
| Flutter | analyze/widget + hosted `flutter` | PASS — list/create, empty, invalid, overlap, assignment, offline dan Dart consumer hijau |
| Clients | generator `7.15.0` + Dart `build_runner` | PASS — hosted Docker byte-for-byte drift hijau |
| Database | migration `20260722000400_instructor_availability` | PASS — empty migration dan double seed melalui hosted `typescript` |
| Secrets | hosted full-history Gitleaks | PASS — `secrets` hijau (user-confirmed) |

## Review disposition

- **AI QA:** PASS — range, pagination, replay, adjacent/overlap, PostgreSQL concurrency dan Flutter evidence hijau.
- **AI Security:** PASS FOR SYNTHETIC NON-PRODUCTION — self-only capability, assignment/branch hiding, masked audit, no outbox/PII dan Gitleaks hijau.
- **AI Peer Reviewer:** PASS FOR SYNTHETIC NON-PRODUCTION — availability terisolasi dari class-slot/booking policy; no production defaults.

`US-CLS-01 = PASS FOR SYNTHETIC NON-PRODUCTION`. `US-CLS-02 = NEXT`; `US-BKG-01` menunggu published class slot; `BG-3 = PENDING`, `PG-1 = BLOCKED`.
