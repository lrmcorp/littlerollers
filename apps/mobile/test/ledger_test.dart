import 'package:dailydose_mobile/src/ledger_repository.dart';
import 'package:dailydose_mobile/src/ledger_view.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

class FakeLedgerRepository implements LedgerRepository {
  FakeLedgerRepository({this.failure});
  final String? failure;
  @override
  Future<List<CustomerPackageLedger>> list({
    String? branchId,
    String? cursor,
  }) async {
    if (failure != null) throw StateError(failure!);
    return const [
      CustomerPackageLedger(
        id: 'cp-1',
        status: 'ACTIVE',
        total: 10,
        reserved: 2,
        available: 8,
      ),
    ];
  }

  @override
  Future<List<LedgerLine>> history(String id, {String? cursor}) async => const [
    LedgerLine(type: 'PURCHASE', quantity: 10),
  ];
}

void main() {
  testWidgets('shows package balance and append-only history', (tester) async {
    await tester.pumpWidget(
      MaterialApp(home: CustomerLedgerView(repository: FakeLedgerRepository())),
    );
    await tester.tap(find.text('Muat saldo'));
    await tester.pumpAndSettle();
    expect(find.text('ACTIVE · tersedia 8'), findsOneWidget);
    expect(find.text('Total 10 · reserved 2'), findsOneWidget);
    await tester.tap(find.text('ACTIVE · tersedia 8'));
    await tester.pumpAndSettle();
    expect(find.text('PURCHASE 10'), findsOneWidget);
  });
  testWidgets('shows safe invariant failure', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: CustomerLedgerView(
          repository: FakeLedgerRepository(
            failure: 'LEDGER_INVARIANT_VIOLATION',
          ),
        ),
      ),
    );
    await tester.tap(find.text('Muat saldo'));
    await tester.pumpAndSettle();
    expect(find.text('ledger_invariant_violation'), findsOneWidget);
  });
}
