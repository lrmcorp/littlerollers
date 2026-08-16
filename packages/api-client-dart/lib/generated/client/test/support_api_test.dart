import 'package:test/test.dart';
import 'package:openapi/openapi.dart';


/// tests for SupportApi
void main() {
  final instance = Openapi(basePathOverride: 'http://localhost/api/v1').getSupportApi();

  group(SupportApi, () {
    //Future<Resource> addSupportCaseInternalNote(String id, AddSupportCaseInternalNoteRequest addSupportCaseInternalNoteRequest) async
    test('test addSupportCaseInternalNote', () async {
      // TODO
    });

    //Future<Resource> createSupportCase(JsonObject body) async
    test('test createSupportCase', () async {
      // TODO
    });

    //Future<JsonObject> getSupportCase(String id) async
    test('test getSupportCase', () async {
      // TODO
    });

    //Future<JsonObject> listSupportCases({ String branchId, String status, String priority, String q, String cursor }) async
    test('test listSupportCases', () async {
      // TODO
    });

    //Future<Resource> updateSupportCase(String id, JsonObject body) async
    test('test updateSupportCase', () async {
      // TODO
    });

  });
}
