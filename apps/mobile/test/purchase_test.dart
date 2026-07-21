import 'package:dailydose_mobile/src/purchase_repository.dart';
import 'package:dailydose_mobile/src/purchase_view.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

class FakePurchaseRepository implements PurchaseRepository {
  FakePurchaseRepository({this.state = ProofState.clean, this.fail = false});
  final ProofState state;
  final bool fail;
  @override
  Future<List<PackageChoice>> listPackages(String branchId) async {
    if (fail) throw Exception('offline');
    return const [
      PackageChoice(id: 'package-1', name: 'Ten Sessions', priceRp: 2000000),
    ];
  }

  @override
  Future<String> issueProof({
    required String branchId,
    required String packageId,
    required String fileName,
    required String mimeType,
    required int sizeBytes,
    required String sha256,
  }) async => 'proof-1';
  @override
  Future<ProofState> finalizeProof(
    String id,
    String sha256,
    int sizeBytes,
  ) async => state;
  @override
  Future<void> submit(
    String packageId,
    String proofId,
    String idempotencyKey,
  ) async {}
}

void main() {
  testWidgets('shows loading package, clean scan and pending purchase', (
    tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        home: CustomerPurchaseView(repository: FakePurchaseRepository()),
      ),
    );
    await tester.enterText(
      find.byKey(const Key('purchase-branch')),
      'branch-1',
    );
    await tester.tap(find.text('Muat paket'));
    await tester.pump();
    await tester.tap(find.byKey(const Key('package-choice')));
    await tester.pumpAndSettle();
    await tester.tap(find.textContaining('Ten Sessions').last);
    await tester.pump();
    await tester.tap(find.text('Upload dan scan'));
    await tester.pump();
    expect(find.text('scan_clean'), findsOneWidget);
    await tester.tap(find.text('Kirim purchase'));
    await tester.pump();
    expect(find.text('purchase_pending'), findsOneWidget);
  });
  testWidgets('shows unsafe and offline without raw provider payload', (
    tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        home: CustomerPurchaseView(
          repository: FakePurchaseRepository(fail: true),
        ),
      ),
    );
    await tester.enterText(
      find.byKey(const Key('purchase-branch')),
      'branch-1',
    );
    await tester.tap(find.text('Muat paket'));
    await tester.pump();
    expect(find.text('offline_or_configuration_required'), findsOneWidget);
  });
}
