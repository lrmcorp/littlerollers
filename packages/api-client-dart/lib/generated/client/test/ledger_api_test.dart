import 'package:test/test.dart';
import 'package:openapi/openapi.dart';


/// tests for LedgerApi
void main() {
  final instance = Openapi().getLedgerApi();

  group(LedgerApi, () {
    //Future<AdjustmentDecisionResult> decideSessionAdjustment(String id, String decision, String idempotencyKey, DeactivateUserRequest deactivateUserRequest) async
    test('test decideSessionAdjustment', () async {
      // TODO
    });

    //Future<PackageLedgerResult> getPackageLedger(String id, { String cursor }) async
    test('test getPackageLedger', () async {
      // TODO
    });

    //Future<CustomerPackageBalancePage> listCustomerPackages({ String branchId, String cursor }) async
    test('test listCustomerPackages', () async {
      // TODO
    });

    //Future<Page> listSessionAdjustments({ String branchId, String status }) async
    test('test listSessionAdjustments', () async {
      // TODO
    });

    //Future<SessionAdjustment> requestSessionAdjustment(String idempotencyKey, AdjustmentCommand adjustmentCommand) async
    test('test requestSessionAdjustment', () async {
      // TODO
    });

  });
}
