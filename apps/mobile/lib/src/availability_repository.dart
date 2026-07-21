import 'package:dailydose_api_client/dailydose_api_client.dart';

class InstructorAvailabilityItem {
  const InstructorAvailabilityItem({
    required this.id,
    required this.branchId,
    required this.startAt,
    required this.endAt,
    required this.timezone,
    required this.status,
  });
  final String id;
  final String branchId;
  final DateTime startAt;
  final DateTime endAt;
  final String timezone;
  final String status;
}

abstract interface class AvailabilityRepository {
  Future<List<InstructorAvailabilityItem>> list({
    String? branchId,
    DateTime? from,
    DateTime? until,
  });
  Future<InstructorAvailabilityItem> create({
    required String branchId,
    required DateTime startAt,
    required DateTime endAt,
  });
}

class ConfigurationRequiredAvailabilityRepository
    implements AvailabilityRepository {
  const ConfigurationRequiredAvailabilityRepository();
  Never _fail() => throw StateError('CONFIGURATION_REQUIRED');
  @override
  Future<List<InstructorAvailabilityItem>> list({
    String? branchId,
    DateTime? from,
    DateTime? until,
  }) async => _fail();
  @override
  Future<InstructorAvailabilityItem> create({
    required String branchId,
    required DateTime startAt,
    required DateTime endAt,
  }) async => _fail();
}

class GeneratedAvailabilityRepository implements AvailabilityRepository {
  GeneratedAvailabilityRepository(String baseUrl)
    : _api = Openapi(basePathOverride: '$baseUrl/api/v1').getClassesApi();
  final ClassesApi _api;
  InstructorAvailabilityItem _item(Availability value) =>
      InstructorAvailabilityItem(
        id: value.id,
        branchId: value.branchId,
        startAt: value.startAt,
        endAt: value.endAt,
        timezone: value.timezone,
        status: value.status.name,
      );
  @override
  Future<List<InstructorAvailabilityItem>> list({
    String? branchId,
    DateTime? from,
    DateTime? until,
  }) async => (await _api.listAvailabilities(
    branchId: branchId,
    from: from,
    until: until,
  )).data!.items.map(_item).toList();
  @override
  Future<InstructorAvailabilityItem> create({
    required String branchId,
    required DateTime startAt,
    required DateTime endAt,
  }) async {
    final command = TimeRangeCommand(
      (b) => b
        ..branchId = branchId
        ..startAt = startAt
        ..endAt = endAt,
    );
    final result = await _api.createAvailability(
      idempotencyKey: 'mobile-${DateTime.now().microsecondsSinceEpoch}',
      timeRangeCommand: command,
    );
    return _item(result.data!);
  }
}
