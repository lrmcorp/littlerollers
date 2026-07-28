import 'package:test/test.dart';
import 'package:openapi/openapi.dart';


/// tests for OperationsApi
void main() {
  final instance = Openapi().getOperationsApi();

  group(OperationsApi, () {
    //Future<OperationalJobResult> deadLetterOperationalJob(String id, String idempotencyKey, DecideCorrectionRequest decideCorrectionRequest) async
    test('test deadLetterOperationalJob', () async {
      // TODO
    });

    // Capability- and branch-scoped aggregate overview for authenticated internal workspaces.
    //
    //Future<DashboardOverview> getDashboardOverview({ String branchId, Date from, Date until }) async
    test('test getDashboardOverview', () async {
      // TODO
    });

    //Future<HealthResult> getHealth() async
    test('test getHealth', () async {
      // TODO
    });

    //Future<NotificationOccurrencePage> listEmailDeliveries({ String cursor, String status }) async
    test('test listEmailDeliveries', () async {
      // TODO
    });

    //Future<OperationalJobPage> listJobs({ String cursor, String status }) async
    test('test listJobs', () async {
      // TODO
    });

    //Future<NotificationRetryResult> retryEmailDelivery(String id, DecideCorrectionRequest decideCorrectionRequest) async
    test('test retryEmailDelivery', () async {
      // TODO
    });

    //Future<OperationalJobResult> retryOperationalJob(String id, String idempotencyKey, DecideCorrectionRequest decideCorrectionRequest) async
    test('test retryOperationalJob', () async {
      // TODO
    });

    //Future<QuotaEvaluationResult> runQuotaEvaluation(String id, String idempotencyKey, QuotaEvaluationCommand quotaEvaluationCommand) async
    test('test runQuotaEvaluation', () async {
      // TODO
    });

  });
}
