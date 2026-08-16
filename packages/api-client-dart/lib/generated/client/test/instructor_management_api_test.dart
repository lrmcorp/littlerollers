import 'package:test/test.dart';
import 'package:openapi/openapi.dart';


/// tests for InstructorManagementApi
void main() {
  final instance = Openapi(basePathOverride: 'http://localhost/api/v1').getInstructorManagementApi();

  group(InstructorManagementApi, () {
    //Future<JsonObject> getManagedInstructor(String id) async
    test('test getManagedInstructor', () async {
      // TODO
    });

    //Future<JsonObject> listManagedInstructors({ String q, String branchId, String cursor }) async
    test('test listManagedInstructors', () async {
      // TODO
    });

  });
}
