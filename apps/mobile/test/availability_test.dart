import 'package:dailydose_mobile/src/availability_repository.dart';
import 'package:dailydose_mobile/src/availability_view.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

class FakeAvailabilityRepository implements AvailabilityRepository {
  FakeAvailabilityRepository({this.failure});
  final String? failure;
  final items = <InstructorAvailabilityItem>[];
  @override
  Future<InstructorAvailabilityItem> create({
    required String branchId,
    required DateTime startAt,
    required DateTime endAt,
  }) async {
    if (failure != null) throw StateError(failure!);
    final item = InstructorAvailabilityItem(
      id: 'availability-1',
      branchId: branchId,
      startAt: startAt,
      endAt: endAt,
      timezone: 'Asia/Jakarta',
      status: 'ACTIVE',
    );
    items.add(item);
    return item;
  }

  @override
  Future<List<InstructorAvailabilityItem>> list({
    String? branchId,
    DateTime? from,
    DateTime? until,
  }) async {
    if (failure != null) throw StateError(failure!);
    return items;
  }
}

Widget app(AvailabilityRepository repository) =>
    MaterialApp(home: InstructorAvailabilityView(repository: repository));

void main() {
  testWidgets('loads empty and creates timezone-aware availability', (
    tester,
  ) async {
    final repository = FakeAvailabilityRepository();
    await tester.pumpWidget(app(repository));
    await tester.enterText(
      find.byKey(const Key('availability-branch')),
      'branch-1',
    );
    await tester.tap(find.text('Muat availability'));
    await tester.pump();
    expect(find.text('Belum ada availability.'), findsOneWidget);
    await tester.enterText(
      find.byKey(const Key('availability-start')),
      '2026-08-01T09:00:00+07:00',
    );
    await tester.enterText(
      find.byKey(const Key('availability-end')),
      '2026-08-01T11:00:00+07:00',
    );
    await tester.tap(find.text('Tambah availability'));
    await tester.pump();
    expect(find.text('Availability berhasil dibuat.'), findsOneWidget);
    expect(find.text('ACTIVE · Asia/Jakarta'), findsOneWidget);
  });

  testWidgets('shows validation, overlap, assignment and offline states', (
    tester,
  ) async {
    await tester.pumpWidget(app(FakeAvailabilityRepository()));
    await tester.tap(find.text('Tambah availability'));
    await tester.pump();
    expect(find.text('Rentang waktu tidak valid.'), findsOneWidget);
    for (final entry in {
      'EFFECTIVE_PERIOD_OVERLAP': 'Jadwal bentrok.',
      'RESOURCE_NOT_FOUND': 'Assignment tidak tersedia.',
      'OFFLINE': 'Offline atau konfigurasi belum tersedia.',
    }.entries) {
      await tester.pumpWidget(
        app(FakeAvailabilityRepository(failure: entry.key)),
      );
      await tester.tap(find.text('Muat availability'));
      await tester.pump();
      expect(find.text(entry.value), findsOneWidget);
    }
  });
}
