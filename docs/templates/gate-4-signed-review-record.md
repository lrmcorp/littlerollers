# Gate 4 Signed Review Record

**Record ID:** G4-REV-001  
**Status:** DRAFT / IN_REVIEW / APPROVED / REJECTED  
**Final approver:** Technical Lead (PO separately approves commercial/provider commitments)

## Baseline Identification

| Item | Exact version/checksum/evidence |
|---|---|
| Repository commit | TBD-BLOCKING |
| ADR baseline | TBD-BLOCKING |
| ERD/data dictionary | TBD-BLOCKING |
| OpenAPI version/checksum | `0.5.0-draft` / `d7127a9f61dad718b147dfa6e1a846f0395817f6ae32e06788b0415acb20381b` |
| Event/error/security contract | TBD-BLOCKING |
| Contract manifest/review workbook | TBD-BLOCKING |

## Ordered Review

| ID | Reviewer | Check | Evidence/comment | Result |
|---|---|---|---|---|
| G4-TL-01 | TL | Architecture, transaction boundaries, schema and invariants are coherent | TBD | OPEN |
| G4-WEB-01 | Web | TypeScript client, cookie/session, errors and pagination are usable | TBD | OPEN |
| G4-FLT-01 | Flutter | Dart client, mobile token/session and offline/retry contract are usable | TBD | OPEN |
| G4-QA-01 | QA | Operation/schema/error/event contracts are testable and mapped | TBD | OPEN |
| G4-FIN-01 | Finance | Money, snapshots, effective settings, ledger and SoD are correct | TBD | OPEN |
| G4-PEER-01 | Peer reviewer | Security, recovery, upload, concurrency and operability risks challenged | TBD | OPEN |
| G4-TL-02 | TL | Comments resolved and final exact baseline approved | TBD | OPEN |

Unresolved security, ledger invariant, authorization, concurrency, recovery, provider boundary, compatibility, or critical schema issue must be `BLOCKING`.

## Comments and Exit

| Comment ID | CTG/operation/schema | Priority | Comment | Owner | Due | Disposition/evidence | Status |
|---|---|---:|---|---|---|---|---|
| G4-CMT-001 | TBD | TBD | TBD | TBD | TBD | TBD | OPEN |

| Exit condition | Evidence | Result |
|---|---|---|
| CTG-001–012 reviewed and blockers resolved | Workbook/comment links | TBD-BLOCKING |
| DEC-011/012/014 and relevant configuration decisions resolved | Signed DEC evidence | TBD-BLOCKING |
| Web, Flutter, QA, Finance and peer results recorded | Signed identity evidence | TBD-BLOCKING |
| OpenAPI parses, refs/operation IDs/checksum verified | Validation evidence | TBD-BLOCKING |
| Generated-client compatibility reviewed or explicitly blocks approval | TS/Dart evidence | TBD-BLOCKING |
| TL final approval | Signature/evidence | TBD-BLOCKING |

```text
Web result/signature/date: TBD-BLOCKING
Flutter result/signature/date: TBD-BLOCKING
QA result/signature/date: TBD-BLOCKING
Finance result/signature/date: TBD-BLOCKING
Independent peer result/signature/date: TBD-BLOCKING
Technical Lead decision/signature/date: TBD-BLOCKING
```

Any TBD or blocking result keeps Gate 4 `BLOCKED` and APR-004 `OPEN`.
