import 'package:test/test.dart';
import 'package:openapi/openapi.dart';


/// tests for ContentManagementApi
void main() {
  final instance = Openapi(basePathOverride: 'http://localhost/api/v1').getContentManagementApi();

  group(ContentManagementApi, () {
    //Future<Resource> createManagedPublicContent(JsonObject body) async
    test('test createManagedPublicContent', () async {
      // TODO
    });

    //Future<BuiltList<JsonObject>> listManagedPublicContent({ String branchId, String kind, String status }) async
    test('test listManagedPublicContent', () async {
      // TODO
    });

    //Future<Resource> transitionManagedPublicContent(String id, String status) async
    test('test transitionManagedPublicContent', () async {
      // TODO
    });

  });
}
