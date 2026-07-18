import 'package:test/test.dart';
import 'package:openapi/openapi.dart';


/// tests for OperationsApi
void main() {
  final instance = Openapi().getOperationsApi();

  group(OperationsApi, () {
    //Future<OperationalJobResult> deadLetterOperationalJob(String id, String idempotencyKey, DeactivateUserRequest deactivateUserRequest) async
    test('test deadLetterOperationalJob', () async {
      // TODO
    });

    //Future<HealthResult> getHealth() async
    test('test getHealth', () async {
      // TODO
    });

    //Future<OperationalJobPage> listJobs({ String cursor, String status }) async
    test('test listJobs', () async {
      // TODO
    });

    //Future<OperationalJobResult> retryOperationalJob(String id, String idempotencyKey, DeactivateUserRequest deactivateUserRequest) async
    test('test retryOperationalJob', () async {
      // TODO
    });

    //Future<QuotaEvaluationResult> runQuotaEvaluation(String id, String idempotencyKey, QuotaEvaluationCommand quotaEvaluationCommand) async
    test('test runQuotaEvaluation', () async {
      // TODO
    });

  });
}
