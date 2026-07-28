import 'package:test/test.dart';
import 'package:openapi/openapi.dart';


/// tests for LedgerApi
void main() {
  final instance = Openapi().getLedgerApi();

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

    // Customer-own or branch-scoped balances from an authoritative ledger/reservation snapshot. Internal callers may search active customer packages without entering technical IDs.
    //
    //Future<CustomerPackageBalancePage> listCustomerPackages({ String branchId, String cursor, String search, String status, String customerUserId }) async
    test('test listCustomerPackages', () async {
      // TODO
    });

    // Branch-scoped adjustment queue ordered by createdAt and id descending.
    //
    //Future<SessionAdjustmentPage> listSessionAdjustments({ String branchId, String status, String cursor }) async
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
