import 'package:test/test.dart';
import 'package:openapi/openapi.dart';


/// tests for FinanceApi
void main() {
  final instance = Openapi().getFinanceApi();

  group(FinanceApi, () {
    //Future<CloseResult> closeMonth(String idempotencyKey, CloseMonthRequest closeMonthRequest) async
    test('test closeMonth', () async {
      // TODO
    });

    //Future<OtherCost> createOtherCost(String idempotencyKey, OtherCostCommand otherCostCommand) async
    test('test createOtherCost', () async {
      // TODO
    });

    //Future<CorrectionDecisionResult> decideCorrection(String id, String decision, String idempotencyKey, DeactivateUserRequest deactivateUserRequest) async
    test('test decideCorrection', () async {
      // TODO
    });

    //Future<FinancialReportPage> getFinancialReport(String reportType, String period, { String branchId, String cursor }) async
    test('test getFinancialReport', () async {
      // TODO
    });

    //Future<OtherCostPage> listOtherCosts(String period, { String branchId, String cursor }) async
    test('test listOtherCosts', () async {
      // TODO
    });

    //Future<BranchPeriodPage> listPeriods({ String branchId, String cursor }) async
    test('test listPeriods', () async {
      // TODO
    });

    //Future<Correction> requestCorrection(String idempotencyKey, CorrectionCommand correctionCommand) async
    test('test requestCorrection', () async {
      // TODO
    });

  });
}
