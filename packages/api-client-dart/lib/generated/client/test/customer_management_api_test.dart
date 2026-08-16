import 'package:test/test.dart';
import 'package:openapi/openapi.dart';


/// tests for CustomerManagementApi
void main() {
  final instance = Openapi(basePathOverride: 'http://localhost/api/v1').getCustomerManagementApi();

  group(CustomerManagementApi, () {
    //Future<JsonObject> createManagedCustomer(String idempotencyKey, String xCustomerStepUp, CreateManagedCustomerRequest createManagedCustomerRequest) async
    test('test createManagedCustomer', () async {
      // TODO
    });

    //Future<Resource> deactivateManagedCustomer(String id, String idempotencyKey, String xCustomerStepUp, VersionedReasonCommand versionedReasonCommand) async
    test('test deactivateManagedCustomer', () async {
      // TODO
    });

    //Future<JsonObject> getManagedCustomer(String id) async
    test('test getManagedCustomer', () async {
      // TODO
    });

    //Future<JsonObject> getManagedCustomerTimeline(String id, { String cursor }) async
    test('test getManagedCustomerTimeline', () async {
      // TODO
    });

    //Future<JsonObject> listCustomers({ String q, String cursor, String status, String verificationStatus, String preferredBranchId, String packageStatus, String activity }) async
    test('test listCustomers', () async {
      // TODO
    });

    //Future<Resource> reactivateManagedCustomer(String id, String idempotencyKey, String xCustomerStepUp, VersionedReasonCommand versionedReasonCommand) async
    test('test reactivateManagedCustomer', () async {
      // TODO
    });

    //Future<Resource> updateManagedCustomerProfile(String id, String idempotencyKey, String xCustomerStepUp, JsonObject body) async
    test('test updateManagedCustomerProfile', () async {
      // TODO
    });

  });
}
