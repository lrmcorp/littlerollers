import 'package:test/test.dart';
import 'package:openapi/openapi.dart';


/// tests for OperationsApi
void main() {
  final instance = Openapi(basePathOverride: 'http://localhost/api/v1').getOperationsApi();

  group(OperationsApi, () {
    //Future<OperationalJobResult> deadLetterOperationalJob(String id, String idempotencyKey, ReasonCommand reasonCommand) async
    test('test deadLetterOperationalJob', () async {
      // TODO
    });

    // Capability- and branch-scoped aggregate overview for authenticated internal workspaces.
    //
    //Future<DashboardOverview> getDashboardOverview({ String branchId, Date from, Date until }) async
    test('test getDashboardOverview', () async {
      // TODO
    });

    // Authenticated global operations readiness. Requires operations:read and never returns connection details or credentials.
    //
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

    //Future<NotificationRetryResult> retryEmailDelivery(String id, ReasonCommand reasonCommand) async
    test('test retryEmailDelivery', () async {
      // TODO
    });

    //Future<OperationalJobResult> retryOperationalJob(String id, String idempotencyKey, ReasonCommand reasonCommand) async
    test('test retryOperationalJob', () async {
      // TODO
    });

    //Future<QuotaEvaluationResult> runQuotaEvaluation(String id, String idempotencyKey, QuotaEvaluationCommand quotaEvaluationCommand) async
    test('test runQuotaEvaluation', () async {
      // TODO
    });

  });
}
