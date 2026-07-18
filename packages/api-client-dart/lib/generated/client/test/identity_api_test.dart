import 'package:test/test.dart';
import 'package:openapi/openapi.dart';


/// tests for IdentityApi
void main() {
  final instance = Openapi().getIdentityApi();

  group(IdentityApi, () {
    //Future<Resource> createAssignment(AssignmentCommand assignmentCommand) async
    test('test createAssignment', () async {
      // TODO
    });

    //Future<Resource> deactivateUser(String id, DeactivateUserRequest deactivateUserRequest) async
    test('test deactivateUser', () async {
      // TODO
    });

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

    //Future<Page> listAssignments({ String branchId, String cursor }) async
    test('test listAssignments', () async {
      // TODO
    });

    //Future<Page> listUsers({ String cursor, String branchId }) async
    test('test listUsers', () async {
      // TODO
    });

  });
}
