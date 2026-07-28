# Dynamic RBAC — Implementation and UAT Evidence

## Scope

This increment replaces the fixed authorization catalog with database-managed roles, role capabilities, direct role assignments, and persistent user `GRANT`/`DENY` overrides. Management is restricted to `SUPER_OWNER` through the protected `role-permission:manage` capability. No MFA is used.

## Implemented controls

- Database catalogs: `CapabilityDefinition`, `RoleDefinition`, `RoleCapability`, `AccessRoleAssignment`, and `UserCapabilityOverride`.
- Eight system roles and the implementation-supported capability catalog are migrated without changing legacy `UserRole` or Assignment ownership.
- Capability evaluation preserves the capability and branch as one grant. Precedence is matching deny, global deny, matching/global grant, role grant, then default deny.
- `role-permission:manage` is system-only. The four protected Super Owner capabilities cannot be removed or overridden.
- Self access changes, the last active Super Owner removal/deactivation, duplicate active assignments, duplicate overrides, and deactivation of roles in use are rejected.
- Every mutation requires an idempotency key, controlled reason, optimistic version where applicable, a single security audit, and revocation of affected sessions.
- Role and override history is ended or revoked; no hard-delete endpoint exists.
- Production management stays fail-closed through `RBAC_MANAGEMENT_ENABLED=false`.

## API and UI evidence

- The OpenAPI contract exposes `/access/capabilities`, `/access/roles`, role metadata/capability mutations, `/users/{id}/access`, role assignment by `roleId`, and override create/revoke.
- `/users/role-catalog` remains database-backed for transition compatibility.
- `/users/roles-permissions` provides capability search/category filters, role selection, custom role create/clone, capability diff confirmation, affected-user count, user access inspection, scoped assignment, `GRANT`/`DENY`, override revoke, and audit navigation.
- Management controls are capability-gated in the UI and independently enforced by the API.

## Automated evidence

| Check | Expected |
|---|---|
| MySQL migration and Prisma client generation | Clean migration; schema constraints present |
| Policy unit tests | Scoped grant binding and deny precedence pass |
| Access management MySQL integration | Idempotency, scoped custom role, override/revoke, session revocation, self/protected controls pass |
| API/Web/TS client type checks | No TypeScript errors |
| Web component tests | Dynamic management workspace and access-client flows pass |
| OpenAPI validation and client drift | Contract valid; generated TS/Dart sources match |
| Dart generated-client analysis | No analyzer errors |

Exact command output and manual browser result must be attached to the release run. A local pass does not constitute production approval.

## Local execution — 2026-07-28

- MySQL schema status: 18 migrations found; database schema up to date.
- API regression: all 34 suites and 144 tests passed against MySQL; the focused policy, dynamic access management, booking, reschedule, and ledger subset passed 5 suites and 22 tests.
- Web regression: 28 files and 109 tests passed, including axe checks.
- Worker regression: 7 suites and 15 tests passed, including notification projection behavior.
- OpenAPI validation: version `1.13.0-draft`, 164 operations and 1,470 references; TS/Dart generated drift is byte-for-byte clean.
- Generated Dart RBAC and `/me` models: 40 targeted tests passed; analyzer has no errors (generator-only unused-import warnings remain).
- Manual browser flow passed: Super Owner login, capability search, custom branch role create, explicit DD-JKT assignment, scoped `DENY`, effective permission display, override revoke, role unassignment, role deactivation, self-change denial, and Admin route denial.
- Browser QA found and fixed an unsafe initial branch default. Branch roles now use explicit multi-branch checkboxes and never silently select the first branch.
- Browser QA role `QA_RBAC_BROWSER_20260728` remains inactive for audit evidence. Its active assignment and override were revoked; no hard delete was performed.

## UAT matrix

| ID | Actor and action | Expected result |
|---|---|---|
| UAT-RBAC-01 | Super Owner searches capability, creates a branch custom role, confirms diff | One active role and one audit; code/scope remain immutable |
| UAT-RBAC-02 | Super Owner assigns the custom role to a user for branch A | Session is revoked; access applies only to branch A after login |
| UAT-RBAC-03 | Same user accesses equivalent branch-B resource | Hidden/forbidden; no cross-branch grant leakage |
| UAT-RBAC-04 | Super Owner adds global grant and branch-A deny | Branch-A deny wins; grant remains effective outside branch A |
| UAT-RBAC-05 | Super Owner revokes override | Override remains in history with revocation actor/time; access recalculates after login |
| UAT-RBAC-06 | Super Owner replays the same request/key then changes payload with that key | First replay is stable; changed payload returns `IDEMPOTENCY_KEY_REUSED` |
| UAT-RBAC-07 | Two browsers edit one role using the same version | One succeeds and one returns `STALE_VERSION` |
| UAT-RBAC-08 | Actor attempts self-change or removal/deactivation of last Super Owner | Rejected without business mutation; protected access remains available |
| UAT-RBAC-09 | Unauthorized user opens UI/calls API | Management is hidden and API returns forbidden |
| UAT-RBAC-10 | Super Owner deactivates an unassigned custom role | Role becomes inactive, remains auditable, and cannot be newly assigned |

## Rollout and rollback

1. Deploy migration with `RBAC_POLICY_SOURCE=shadow` and `RBAC_MANAGEMENT_ENABLED=false`.
2. Compare database and static policy decisions and resolve every mismatch.
3. Complete UAT-RBAC-01 through UAT-RBAC-10 and obtain PO/TL/QA/Ops sign-off.
4. Change policy source to `database`, observe authorization/session metrics, then enable management.
5. Roll back mutations by setting `RBAC_MANAGEMENT_ENABLED=false`; retain role, override, assignment, and audit records.
