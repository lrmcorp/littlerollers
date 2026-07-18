import 'package:test/test.dart';
import 'package:openapi/openapi.dart';


/// tests for AttendanceApi
void main() {
  final instance = Openapi().getAttendanceApi();

  group(AttendanceApi, () {
    //Future<CheckInResult> backfillCustomerCheckIn(String idempotencyKey, BackfillCustomerCheckInRequest backfillCustomerCheckInRequest) async
    test('test backfillCustomerCheckIn', () async {
      // TODO
    });

    //Future<CompletionResult> completeClassSlot(String id, String idempotencyKey, CompleteClassCommand completeClassCommand) async
    test('test completeClassSlot', () async {
      // TODO
    });

    //Future<CheckInResult> customerCheckIn(String idempotencyKey, TokenCheckInCommand tokenCheckInCommand) async
    test('test customerCheckIn', () async {
      // TODO
    });

    //Future<CheckInTokenStatus> getCheckInTokenStatus(String id) async
    test('test getCheckInTokenStatus', () async {
      // TODO
    });

    //Future<CheckInResult> instructorCheckIn(String idempotencyKey, TokenCheckInCommand tokenCheckInCommand) async
    test('test instructorCheckIn', () async {
      // TODO
    });

    //Future<CheckInToken> issueCustomerCheckInLink(String id, String idempotencyKey) async
    test('test issueCustomerCheckInLink', () async {
      // TODO
    });

    //Future<CheckInToken> issueInstructorCheckInToken(String id, String idempotencyKey) async
    test('test issueInstructorCheckInToken', () async {
      // TODO
    });

    //Future<CheckInTokenStatus> revokeCheckInToken(String id, String idempotencyKey, DeactivateUserRequest deactivateUserRequest) async
    test('test revokeCheckInToken', () async {
      // TODO
    });

  });
}
