import 'package:test/test.dart';
import 'package:openapi/openapi.dart';


/// tests for AuditApi
void main() {
  final instance = Openapi(basePathOverride: 'http://localhost/api/v1').getAuditApi();

  group(AuditApi, () {
    //Future<DownloadAuthorization> authorizeAuditExportDownload(String id) async
    test('test authorizeAuditExportDownload', () async {
      // TODO
    });

    //Future<AuditExport> createAuditExport(String idempotencyKey, AuditExportCommand auditExportCommand) async
    test('test createAuditExport', () async {
      // TODO
    });

    // Consumes a single-use, short-lived opaque download token.
    //
    //Future<String> downloadAuditExport(String id, String token) async
    test('test downloadAuditExport', () async {
      // TODO
    });

    //Future<AuditExport> getAuditExportStatus(String id) async
    test('test getAuditExportStatus', () async {
      // TODO
    });

    //Future<AuditLogPage> listAuditLogs({ String branchId, String cursor, String actorId, String targetUserId, String action, String correlationId, DateTime from, DateTime until }) async
    test('test listAuditLogs', () async {
      // TODO
    });

  });
}
