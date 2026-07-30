import 'package:test/test.dart';
import 'package:openapi/openapi.dart';


/// tests for AttendanceApi
void main() {
  final instance = Openapi(basePathOverride: 'http://localhost/api/v1').getAttendanceApi();

  group(AttendanceApi, () {
    //Future<CheckInResult> backfillCustomerCheckIn(String idempotencyKey, BackfillCustomerCheckInRequest backfillCustomerCheckInRequest) async
    test('test backfillCustomerCheckIn', () async {
      // TODO
    });

    //Future<CompletionResult> completeClassSlot(String id, String idempotencyKey, CompleteClassCommand completeClassCommand) async
    test('test completeClassSlot', () async {
      // TODO
    });

    // The owning Customer or authorized branch staff consumes a booking-bound QR token atomically. The valid interval is inclusive at H-30 and exclusive at class end.
    //
    //Future<CheckInResult> customerCheckIn(String idempotencyKey, TokenCheckInCommand tokenCheckInCommand) async
    test('test customerCheckIn', () async {
      // TODO
    });

    //Future<CustomerCheckInTokenStatus> getCheckInTokenStatus(String id) async
    test('test getCheckInTokenStatus', () async {
      // TODO
    });

    //Future<CheckInResult> instructorCheckIn(String idempotencyKey, TokenCheckInCommand tokenCheckInCommand) async
    test('test instructorCheckIn', () async {
      // TODO
    });

    // Issues a one-time booking pass. The raw token is returned only on first issuance and is never persisted.
    //
    //Future<CustomerCheckInIssue> issueCustomerCheckInLink(String id, String idempotencyKey, IssueCustomerCheckInLinkCommand issueCustomerCheckInLinkCommand) async
    test('test issueCustomerCheckInLink', () async {
      // TODO
    });

    // Issues passes independently for active bookings in one confirmed class; one failure does not roll back other results.
    //
    //Future<BulkCustomerCheckInLinkResult> issueCustomerCheckInLinksBulk(String id, String idempotencyKey, BulkCustomerCheckInLinkCommand bulkCustomerCheckInLinkCommand) async
    test('test issueCustomerCheckInLinksBulk', () async {
      // TODO
    });

    //Future<CheckInToken> issueInstructorCheckInToken(String id, String idempotencyKey) async
    test('test issueInstructorCheckInToken', () async {
      // TODO
    });

    //Future<CustomerCheckInTokenStatus> revokeCheckInToken(String id, RevokeCustomerCheckInTokenCommand revokeCustomerCheckInTokenCommand) async
    test('test revokeCheckInToken', () async {
      // TODO
    });

  });
}
