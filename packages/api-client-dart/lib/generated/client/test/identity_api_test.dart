import 'package:test/test.dart';
import 'package:openapi/openapi.dart';


/// tests for IdentityApi
void main() {
  final instance = Openapi().getIdentityApi();

  group(IdentityApi, () {
    // Creates an OWNER or INSTRUCTOR interval and linked role projection atomically. Requires assignment:manage and MFA.
    //
    //Future<Resource> createAssignment(AssignmentCommand assignmentCommand) async
    test('test createAssignment', () async {
      // TODO
    });

    //Future<Resource> deactivateUser(String id, DeactivateUserRequest deactivateUserRequest) async
    test('test deactivateUser', () async {
      // TODO
    });

    // Ends the half-open assignment at the start of the branch-local calendar date containing effectiveAt. Requires MFA and expectedVersion.
    //
    //Future<Resource> endAssignment(String id, String idempotencyKey, EndAssignmentCommand endAssignmentCommand) async
    test('test endAssignment', () async {
      // TODO
    });

    //Future<Me> getMe() async
    test('test getMe', () async {
      // TODO
    });

    //Future<Resource> inviteUser(InviteUserRequest inviteUserRequest) async
    test('test inviteUser', () async {
      // TODO
    });

    // Returns assignment intervals visible to the authenticated actor. Foreign branch scope is hidden as RESOURCE_NOT_FOUND.
    //
    //Future<AssignmentPage> listAssignments({ String branchId, String cursor }) async
    test('test listAssignments', () async {
      // TODO
    });

    //Future<Page> listUsers({ String cursor, String branchId }) async
    test('test listUsers', () async {
      // TODO
    });

  });
}
