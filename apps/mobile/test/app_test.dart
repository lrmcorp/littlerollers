import 'package:dailydose_mobile/src/app.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('shows customer login and safe configuration state', (tester) async {
    await tester.pumpWidget(const DailyDoseApp());
    expect(find.text('Masuk untuk melanjutkan'), findsOneWidget);
    expect(find.text('Lanjutkan dengan Google'), findsOneWidget);
    await tester.tap(find.text('Gunakan OTP WhatsApp'));
    await tester.pump();
    expect(find.byKey(const Key('phone-input')), findsOneWidget);
    expect(find.byKey(const Key('configuration-message')), findsOneWidget);
  });
}
