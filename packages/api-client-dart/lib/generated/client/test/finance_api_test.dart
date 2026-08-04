import 'package:test/test.dart';
import 'package:openapi/openapi.dart';


/// tests for FinanceApi
void main() {
  final instance = Openapi(basePathOverride: 'http://localhost/api/v1').getFinanceApi();

  group(FinanceApi, () {
    //Future<CloseResult> closeMonth(String idempotencyKey, CloseMonthRequest closeMonthRequest) async
    test('test closeMonth', () async {
      // TODO
    });

    //Future<OtherCost> createOtherCost(String idempotencyKey, OtherCostCommand otherCostCommand) async
    test('test createOtherCost', () async {
      // TODO
    });

    //Future<CorrectionDecisionResult> decideCorrection(String id, String decision, String idempotencyKey, DecideCorrectionRequest decideCorrectionRequest) async
    test('test decideCorrection', () async {
      // TODO
    });

    // Actionable reconciliation anomalies without private proof contents.
    //
    //Future<GetFinanceReconciliationAnomalies200Response> getFinanceReconciliationAnomalies({ String branchId, Date from, Date until, String cursor, int limit }) async
    test('test getFinanceReconciliationAnomalies', () async {
      // TODO
    });

    // Global Finance or Super Owner reconciliation aggregates from authoritative purchase and ledger records.
    //
    //Future<FinanceReconciliationOverview> getFinanceReconciliationOverview({ String branchId, Date from, Date until }) async
    test('test getFinanceReconciliationOverview', () async {
      // TODO
    });

    //Future<FinancialReportPage> getFinancialReport(String reportType, String period, { String branchId, String cursor }) async
    test('test getFinancialReport', () async {
      // TODO
    });

    // Historical single-entry v1 cashflow, explicitly separated from new v2 double-entry journals.
    //
    //Future<LegacyFinancialEntryPage> listLegacyFinancialEntries({ String branchId, Date from, Date until, String cursor, int limit }) async
    test('test listLegacyFinancialEntries', () async {
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
