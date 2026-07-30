import 'package:test/test.dart';
import 'package:openapi/openapi.dart';


/// tests for AccessApi
void main() {
  final instance = Openapi(basePathOverride: 'http://localhost/api/v1').getAccessApi();

  group(AccessApi, () {
    //Future<AccessRoleDefinition> createAccessRole(String idempotencyKey, CreateAccessRoleCommand createAccessRoleCommand) async
    test('test createAccessRole', () async {
      // TODO
    });

    //Future<Resource> createUserPermissionOverride(String id, String idempotencyKey, CreatePermissionOverrideCommand createPermissionOverrideCommand) async
    test('test createUserPermissionOverride', () async {
      // TODO
    });

    //Future<Resource> deactivateAccessRole(String id, String idempotencyKey, VersionedAccessReason versionedAccessReason) async
    test('test deactivateAccessRole', () async {
      // TODO
    });

    //Future<AccessRoleDefinition> getAccessRole(String id) async
    test('test getAccessRole', () async {
      // TODO
    });

    //Future<UserAccess> getUserAccess(String id) async
    test('test getUserAccess', () async {
      // TODO
    });

    //Future<AccessRolePage> listAccessRoles({ String q, AccessRoleScope scope, bool active }) async
    test('test listAccessRoles', () async {
      // TODO
    });

    //Future<CapabilityDefinitionPage> listCapabilityDefinitions({ String q, String category, bool sensitive, bool active }) async
    test('test listCapabilityDefinitions', () async {
      // TODO
    });

    //Future<AccessRoleDefinition> replaceAccessRoleCapabilities(String id, String idempotencyKey, ReplaceRoleCapabilitiesCommand replaceRoleCapabilitiesCommand) async
    test('test replaceAccessRoleCapabilities', () async {
      // TODO
    });

    //Future<Resource> replaceUserAccessRoles(String id, String idempotencyKey, ReplaceUserAccessRolesCommand replaceUserAccessRolesCommand) async
    test('test replaceUserAccessRoles', () async {
      // TODO
    });

    //Future<Resource> revokeUserPermissionOverride(String id, String overrideId, String idempotencyKey, VersionedAccessReason versionedAccessReason) async
    test('test revokeUserPermissionOverride', () async {
      // TODO
    });

    //Future<AccessRoleDefinition> updateAccessRole(String id, String idempotencyKey, UpdateAccessRoleCommand updateAccessRoleCommand) async
    test('test updateAccessRole', () async {
      // TODO
    });

  });
}
