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

    // Permission-gated cancellation from DRAFT/PUBLISHED. Atomically releases ACTIVE reservations; production remains blocked by DEC-008.
    //
    //Future<ClassSlot> cancelClassSlot(String id, String idempotencyKey, ClassSlotCancellationCommand classSlotCancellationCommand) async
    test('test cancelClassSlot', () async {
      // TODO
    });

    // Creates one UTC-normalized [startAt,endAt) interval under an effective INSTRUCTOR assignment. Adjacent intervals are allowed; overlap for the same instructor across branches is rejected.
    //
    //Future<Availability> createAvailability(String idempotencyKey, TimeRangeCommand timeRangeCommand) async
    test('test createAvailability', () async {
      // TODO
    });

    // Creates a DRAFT [startAt,endAt) slot and snapshots effective synthetic quota/capacity. No production defaults.
    //
    //Future<ClassSlot> createClassSlot(String idempotencyKey, ClassSlotCommand classSlotCommand) async
    test('test createClassSlot', () async {
      // TODO
    });

    //Future<PublicClassDetail> getPublicClassDetail(String slug) async
    test('test getPublicClassDetail', () async {
      // TODO
    });

    //Future<PublicScheduleDetail> getPublicScheduleDetail(String id) async
    test('test getPublicScheduleDetail', () async {
      // TODO
    });

    // Instructor-own half-open intervals ordered by startAt and id descending. Optional from/until selects intervals that overlap the requested UTC window.
    //
    //Future<AvailabilityPage> listAvailabilities({ String branchId, DateTime from, DateTime until, String cursor }) async
    test('test listAvailabilities', () async {
      // TODO
    });

    // Scoped class slots ordered by startAt and id descending. Customer sees PUBLISHED only; Instructor sees assigned slots; internal roles see branch-scoped lifecycle.
    //
    //Future<ClassSlotPage> listClassSlots({ String branchId, String status, DateTime from, DateTime until, String cursor }) async
    test('test listClassSlots', () async {
      // TODO
    });

    //Future<PublicClassCatalog> listPublicClassSchedule({ String branchId, DateTime from, DateTime until }) async
    test('test listPublicClassSchedule', () async {
      // TODO
    });

    // Permission-gated DRAFT to PUBLISHED transition after assignment and availability revalidation.
    //
    //Future<ClassSlot> publishClassSlot(String id, String idempotencyKey, ClassSlotVersionCommand classSlotVersionCommand) async
    test('test publishClassSlot', () async {
      // TODO
    });

    // Compatibility-only draft; use explicit assign-instructor, publish, cancel, or complete operations.
    //
    //Future<ClassSlot> transitionClassSlot(String id, String action, String idempotencyKey, ActionCommand actionCommand) async
    test('test transitionClassSlot', () async {
      // TODO
    });

    // Updates a DRAFT slot and re-snapshots effective capacity. Published or confirmed slots must be cancelled and recreated.
    //
    //Future<ClassSlot> updateDraftClassSlot(String id, String idempotencyKey, ClassSlotUpdateCommand classSlotUpdateCommand) async
    test('test updateDraftClassSlot', () async {
      // TODO
    });

  });
}
