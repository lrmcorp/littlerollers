import 'package:test/test.dart';
import 'package:openapi/openapi.dart';


/// tests for AuditApi
void main() {
  final instance = Openapi().getAuditApi();

  group(AuditApi, () {
    //Future<DownloadAuthorization> authorizeAuditExportDownload(String id) async
    test('test authorizeAuditExportDownload', () async {
      // TODO
    });

    //Future<AuditExport> createAuditExport(String idempotencyKey, AuditExportCommand auditExportCommand) async
    test('test createAuditExport', () async {
      // TODO
    });

    //Future<AuditExport> getAuditExportStatus(String id) async
    test('test getAuditExportStatus', () async {
      // TODO
    });

    //Future<AuditLogPage> listAuditLogs({ String branchId, String cursor, String objectType, String actorId }) async
    test('test listAuditLogs', () async {
      // TODO
    });

  });
}
