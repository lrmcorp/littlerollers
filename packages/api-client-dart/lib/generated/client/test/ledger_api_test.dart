import 'package:test/test.dart';
import 'package:openapi/openapi.dart';


/// tests for LedgerApi
void main() {
  final instance = Openapi().getLedgerApi();

  group(LedgerApi, () {
    // Permission-gated decision by a different Manager or Super Owner. Approval atomically posts one ADJUST_MANUAL entry.
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

    // Customer-own or branch-scoped balances from an authoritative ledger/reservation snapshot. Invalid cursor is rejected; invariant mismatch is never silently clamped.
    //
    //Future<CustomerPackageBalancePage> listCustomerPackages({ String branchId, String cursor }) async
    test('test listCustomerPackages', () async {
      // TODO
    });

    // Branch-scoped adjustment queue ordered by createdAt and id descending.
    //
    //Future<SessionAdjustmentPage> listSessionAdjustments({ String branchId, String status, String cursor }) async
    test('test listSessionAdjustments', () async {
      // TODO
    });

    //Future<SessionAdjustment> requestSessionAdjustment(String idempotencyKey, AdjustmentCommand adjustmentCommand) async
    test('test requestSessionAdjustment', () async {
      // TODO
    });

  });
}
