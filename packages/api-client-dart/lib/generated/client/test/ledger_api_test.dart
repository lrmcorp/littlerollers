import 'package:test/test.dart';
import 'package:openapi/openapi.dart';


/// tests for LedgerApi
void main() {
  final instance = Openapi(basePathOverride: 'http://localhost/api/v1').getLedgerApi();

  group(LedgerApi, () {
    // Session-authenticated, capability and branch-scoped decision by a different Manager or Super Owner. No MFA is used. Approval atomically revalidates and posts one ADJUST_MANUAL entry.
    //
    //Future<AdjustmentDecisionResult> decideSessionAdjustment(String id, String decision, String idempotencyKey, SessionAdjustmentDecisionCommand sessionAdjustmentDecisionCommand) async
    test('test decideSessionAdjustment', () async {
      // TODO
    });

    // Append-only entries ordered by occurredAt and id descending with opaque keyset cursor and active reservation summary.
    //
    //Future<PackageLedgerResult> getPackageLedger(String id, { String cursor }) async
    test('test getPackageLedger', () async {
      // TODO
    });

    // Capability and branch-scoped authoritative adjustment detail with safe customer, package, balance, eligibility, and actor projections.
    //
    //Future<SessionAdjustment> getSessionAdjustment(String id) async
    test('test getSessionAdjustment', () async {
      // TODO
    });

    // Customer-own or branch-scoped balances from an authoritative ledger/reservation snapshot. Internal callers may search active customer packages without entering technical IDs.
    //
    //Future<CustomerPackageBalancePage> listCustomerPackages({ String branchId, String cursor, String search, String status, String customerUserId }) async
    test('test listCustomerPackages', () async {
      // TODO
    });

    // Capability and branch-scoped adjustment queue ordered by createdAt and id descending. HISTORY combines POSTED and REJECTED decisions.
    //
    //Future<SessionAdjustmentPage> listSessionAdjustments({ String branchId, String status, String cursor, String q, String customerUserId, DateTime from, DateTime until, int limit }) async
    test('test listSessionAdjustments', () async {
      // TODO
    });

    // Branch-scoped Admin request. Stores immutable balance/reservation snapshots and does not mutate the ledger.
    //
    //Future<SessionAdjustment> requestSessionAdjustment(String idempotencyKey, AdjustmentCommand adjustmentCommand) async
    test('test requestSessionAdjustment', () async {
      // TODO
    });

  });
}
