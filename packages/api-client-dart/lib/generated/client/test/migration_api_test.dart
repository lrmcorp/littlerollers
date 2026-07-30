import 'package:test/test.dart';
import 'package:openapi/openapi.dart';


/// tests for MigrationApi
void main() {
  final instance = Openapi(basePathOverride: 'http://localhost/api/v1').getMigrationApi();

  group(MigrationApi, () {
    //Future<MigrationBatchResult> applyMigrationBatch(String id, String idempotencyKey, MigrationBatchActionCommand migrationBatchActionCommand) async
    test('test applyMigrationBatch', () async {
      // TODO
    });

    //Future<MigrationBatchResult> createMigrationBatch(String idempotencyKey, MigrationBatchCommand migrationBatchCommand) async
    test('test createMigrationBatch', () async {
      // TODO
    });

    //Future<MigrationSourceUpload> createMigrationSourceUpload(String idempotencyKey, MigrationSourceUploadCommand migrationSourceUploadCommand) async
    test('test createMigrationSourceUpload', () async {
      // TODO
    });

    //Future<MigrationSourceUpload> finalizeMigrationSourceUpload(String id, String idempotencyKey, FinalizeUploadCommand finalizeUploadCommand) async
    test('test finalizeMigrationSourceUpload', () async {
      // TODO
    });

    //Future<MigrationBatchResult> getMigrationBatch(String id) async
    test('test getMigrationBatch', () async {
      // TODO
    });

    //Future<MigrationBatchPage> listMigrationBatches({ String cursor, String status }) async
    test('test listMigrationBatches', () async {
      // TODO
    });

    //Future<MigrationBatchResult> reconcileMigrationBatch(String id, String idempotencyKey, MigrationBatchActionCommand migrationBatchActionCommand) async
    test('test reconcileMigrationBatch', () async {
      // TODO
    });

    //Future<MigrationBatchResult> rollbackMigrationBatch(String id, String idempotencyKey, MigrationBatchActionCommand migrationBatchActionCommand) async
    test('test rollbackMigrationBatch', () async {
      // TODO
    });

    // Compatibility-only draft; use explicit lifecycle operations.
    //
    //Future<MigrationBatchResult> transitionMigrationBatch(String id, String action, String idempotencyKey, MigrationBatchActionCommand migrationBatchActionCommand) async
    test('test transitionMigrationBatch', () async {
      // TODO
    });

    //Future<MigrationBatchResult> validateMigrationBatch(String id, String idempotencyKey, MigrationBatchActionCommand migrationBatchActionCommand) async
    test('test validateMigrationBatch', () async {
      // TODO
    });

  });
}
