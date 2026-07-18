# UX/UI Delivery Specification

**Status:** DRAFT  
**Source of truth visual:** Figma milik Daily Dose

Screen inventory, universal state matrix, detail `UX-01`–`UX-11`, design-system contract dan handoff register berada pada [Screen, Flow, State & Design-System Contract](02-screen-flow-and-design-system-contract.md).

## 1. Prinsip Desain

- Role-first: setiap role hanya melihat action dan data yang relevan.
- Branch context selalu terlihat pada layar internal; pergantian cabang tidak boleh ambigu.
- Saldo dibedakan jelas menjadi total, reserved, available, dan expiry.
- Action irreversible/financial memakai review/confirmation dan menampilkan akibatnya.
- Status tidak hanya dibedakan dengan warna; gunakan label/icon/text.
- Critical flow tetap dapat dipahami pada mobile screen reader dan keyboard web.
- Semua waktu tampil bersama timezone cabang bila pengguna dapat melihat lebih dari satu timezone.

## 2. Information Architecture

### Flutter — Customer

- Home: upcoming class, package summary, expiry/renew CTA.
- Timetable: branch/class/date filter, availability, booking.
- My Bookings: upcoming, history, reschedule request, check-in link.
- Packages: active/expired, purchase, upload payment proof.
- Notifications.
- Profile/security/contact verification.

### Flutter — Instructor

- Home: next assignments dan check-in readiness.
- Availability.
- Schedule/assignment detail.
- QR check-in.
- Notifications.
- Profile dan assigned branches.

### Web — Internal

- Dashboard sesuai role.
- Branch/timetable/class management.
- Customer/package/purchase/expiry.
- Instructor/availability/assignment.
- Booking/reschedule/check-in/adjustment.
- Reports: revenue, realtime, projection, other cost, profit.
- Monthly close/correction.
- Master/assignment/settings untuk Super Owner.
- Audit/notification/operational health sesuai permission.

## 3. User Flow Wajib di Figma

Gunakan frame ID stabil dan tautkan ke `BR`/`US`.

| Flow ID | Flow | Role | Requirement |
|---|---|---|---|
| UX-01 | Google/OTP login dan recovery | Customer | BR-001 |
| UX-02 | Purchase, proof upload, pending/rejected/approved | Customer/Manager | BR-010–016 |
| UX-03 | Timetable, booking, capacity/session error | Customer | BR-020–025 |
| UX-04 | Reschedule ≥H-24 dan <H-24 | Customer/Admin/Manager | BR-050–054 |
| UX-05 | Customer deep-link check-in | Customer | BR-042 |
| UX-06 | Availability, assignment, QR check-in | Instructor | BR-030–031,040–041 |
| UX-07 | Class create/publish/confirm/cancel/complete | Admin | BR-032–045 |
| UX-08 | Admin H+2 backfill | Admin | BR-043 |
| UX-09 | Session adjustment approval | Admin/Manager | BR-052–054 |
| UX-10 | Reports, close, correction | Owner/Super Owner/Finance | BR-060–067 |
| UX-11 | Branch/owner/instructor/master assignment | Super Owner | BR-004–005 |

Setiap flow menampilkan happy path, empty/loading/error, offline/provider failure, unauthorized, expired link, duplicate/retry result, dan confirmation state yang relevan.

## 4. Responsive Behavior

- Web desktop baseline 1280 px; tablet 768 px; minimum supported viewport 360 px untuk tugas ringan.
- Tabel finansial desktop memakai sticky header, explicit currency alignment, filter, export, dan summary; mobile web dapat memakai card/scroll dengan header context tetap terlihat.
- Timetable menyediakan calendar dan list view; list view menjadi accessible fallback.
- Modal kompleks diganti page/drawer pada viewport kecil.
- Primary action tidak tertutup keyboard/safe area pada Flutter.
- Flutter mendukung dynamic text tanpa memotong angka/status kritis.

## 5. Design System

Figma library minimum berisi:

- Color, typography, spacing, grid, elevation, icon, motion token.
- Button, input, select, date/time, uploader, table, card, dialog, drawer, tabs, filter, pagination.
- Status badge untuk package, booking, class, payment, close, correction, notification.
- Calendar/timetable slot, financial summary, audit timeline, approval card.
- Feedback: inline validation, toast, banner, empty, skeleton, retry, destructive confirmation.
- Semantic colors dengan contrast WCAG 2.2 AA.

Nama token harus dapat dipetakan ke Tailwind/web theme dan Flutter Theme tanpa nilai liar per layar.

## 6. Content dan Format

- Bahasa UI Indonesia; status teknis diterjemahkan ke label bisnis.
- Uang: `Rp` dengan pemisah ribuan, tanpa decimal jika seluruh transaksi rupiah bulat.
- Tanggal/waktu: format lokal Indonesia dan timezone eksplisit untuk akses lintas cabang.
- Error menjelaskan apa yang terjadi dan tindakan berikutnya, tanpa stack trace/internal ID sensitif.
- Confirmation financial menyebut cabang, periode, nominal, dan konsekuensi lock.

## 7. Accessibility Checklist

- Contrast, focus indicator, keyboard order, semantic heading, accessible label.
- Target sentuh minimum dan tidak mengandalkan gesture saja.
- Screen reader mengumumkan label, value, status, error, dan perubahan async penting.
- QR/check-in memiliki instruksi dan error recovery; tidak ada customer QR requirement.
- Chart laporan memiliki table/text alternative.
- Automated accessibility check dan manual keyboard/screen-reader sampling sebelum release.

## 8. Handoff dan Design QA

Sebuah flow siap development jika:

- Figma node final memiliki status, owner, version, requirement/user-story link.
- Semua breakpoint/state/validation/copy/component/token terdokumentasi.
- API/data dependency dan permission per action jelas.
- Designer, PM/BA, developer, dan QA melakukan review.
- Product Owner menyetujui flow bisnis.

Designer melakukan Design QA pada staging sebelum story `DONE`; deviasi dicatat sebagai defect atau design decision.
