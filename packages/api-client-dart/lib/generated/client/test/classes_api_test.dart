import 'package:test/test.dart';
import 'package:openapi/openapi.dart';


/// tests for ClassesApi
void main() {
  final instance = Openapi().getClassesApi();

  group(ClassesApi, () {
    //Future<ClassSlot> assignClassSlotInstructor(String id, String idempotencyKey, AssignInstructorCommand assignInstructorCommand) async
    test('test assignClassSlotInstructor', () async {
      // TODO
    });

    //Future<ClassSlot> cancelClassSlot(String id, String idempotencyKey, DeactivateUserRequest deactivateUserRequest) async
    test('test cancelClassSlot', () async {
      // TODO
    });

    //Future<Availability> createAvailability(String idempotencyKey, TimeRangeCommand timeRangeCommand) async
    test('test createAvailability', () async {
      // TODO
    });

    //Future<ClassSlot> createClassSlot(String idempotencyKey, ClassSlotCommand classSlotCommand) async
    test('test createClassSlot', () async {
      // TODO
    });

    //Future<AvailabilityPage> listAvailabilities({ String branchId, String cursor }) async
    test('test listAvailabilities', () async {
      // TODO
    });

    //Future<ClassSlotPage> listClassSlots({ String branchId, String cursor }) async
    test('test listClassSlots', () async {
      // TODO
    });

    //Future<ClassSlot> publishClassSlot(String id, String idempotencyKey, DeactivateUserRequest deactivateUserRequest) async
    test('test publishClassSlot', () async {
      // TODO
    });

    // Compatibility-only draft; use explicit assign-instructor, publish, cancel, or complete operations.
    //
    //Future<ClassSlot> transitionClassSlot(String id, String action, String idempotencyKey, ActionCommand actionCommand) async
    test('test transitionClassSlot', () async {
      // TODO
    });

  });
}
