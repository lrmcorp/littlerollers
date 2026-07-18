import 'package:dailydose_mobile/src/app.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('shows customer and instructor role entry', (tester) async {
    await tester.pumpWidget(const DailyDoseApp());
    expect(find.text('Customer'), findsOneWidget);
    expect(find.text('Instructor'), findsOneWidget);
  });
}
