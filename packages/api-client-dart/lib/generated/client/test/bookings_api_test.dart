import 'package:test/test.dart';
import 'package:openapi/openapi.dart';


/// tests for BookingsApi
void main() {
  final instance = Openapi().getBookingsApi();

  group(BookingsApi, () {
    //Future<Booking> createBooking(String idempotencyKey, BookingCommand bookingCommand) async
    test('test createBooking', () async {
      // TODO
    });

    //Future<RescheduleDecisionResult> decideReschedule(String id, String decision, String idempotencyKey, DeactivateUserRequest deactivateUserRequest) async
    test('test decideReschedule', () async {
      // TODO
    });

    //Future<BookingPage> listBookings({ String branchId, String cursor, String status }) async
    test('test listBookings', () async {
      // TODO
    });

    //Future<Reschedule> requestReschedule(String idempotencyKey, RescheduleCommand rescheduleCommand) async
    test('test requestReschedule', () async {
      // TODO
    });

  });
}
