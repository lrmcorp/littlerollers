import 'package:dailydose_mobile/src/app.dart';
import 'package:dailydose_mobile/src/auth_repository.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

class FakeAuthRepository implements AuthRepository {
  FakeAuthRepository({this.failure});
  final AuthFailure? failure;
  Never _failed() => throw AuthException(failure!);
  @override
  Future<void> signInGoogle() async {
    if (failure != null) _failed();
  }

  @override
  Future<String> requestOtp(String phone) async {
    if (failure != null) _failed();
    return 'request-1';
  }

  @override
  Future<void> verifyOtp(String requestId, String code) async {
    if (failure != null) _failed();
  }

  @override
  Future<String> requestRecovery(String identifier) async {
    if (failure != null) _failed();
    return 'recovery-1';
  }
}

Widget app(AuthRepository repository) =>
    MaterialApp(home: CustomerSignIn(repository: repository));

void main() {
  testWidgets('supports Google success and configuration-safe state', (
    tester,
  ) async {
    await tester.pumpWidget(app(FakeAuthRepository()));
    await tester.tap(find.text('Lanjutkan dengan Google'));
    await tester.pump();
    expect(find.text('Berhasil.'), findsOneWidget);
    await tester.pumpWidget(
      app(FakeAuthRepository(failure: AuthFailure.configuration)),
    );
    await tester.tap(find.text('Lanjutkan dengan Google'));
    await tester.pump();
    expect(find.text('configuration'), findsOneWidget);
  });

  testWidgets('supports OTP request, verification and locked/expired errors', (
    tester,
  ) async {
    await tester.pumpWidget(app(FakeAuthRepository()));
    await tester.tap(find.text('Gunakan OTP WhatsApp'));
    await tester.pump();
    await tester.enterText(
      find.byKey(const Key('phone-input')),
      '+62800000000',
    );
    await tester.tap(find.text('Kirim kode'));
    await tester.pump();
    expect(find.byKey(const Key('otp-code')), findsOneWidget);
    await tester.enterText(find.byKey(const Key('otp-code')), '123456');
    await tester.tap(find.text('Verifikasi OTP'));
    await tester.pump();
    expect(find.text('Berhasil.'), findsOneWidget);
    for (final failure in [AuthFailure.locked, AuthFailure.expired]) {
      await tester.pumpWidget(app(FakeAuthRepository(failure: failure)));
      await tester.tap(find.text('Gunakan OTP WhatsApp'));
      await tester.pump();
      await tester.tap(find.text('Kirim kode'));
      await tester.pump();
      expect(find.text(failure.name), findsOneWidget);
    }
  });

  testWidgets(
    'supports recovery plus offline, retry and session-expired states',
    (tester) async {
      for (final failure in [
        AuthFailure.offline,
        AuthFailure.sessionExpired,
        AuthFailure.rateLimited,
      ]) {
        await tester.pumpWidget(app(FakeAuthRepository(failure: failure)));
        await tester.tap(find.text('Pulihkan akun'));
        await tester.pump();
        await tester.enterText(
          find.byKey(const Key('recovery-identifier')),
          'masked@example.test',
        );
        await tester.tap(find.text('Minta verifikasi synthetic'));
        await tester.pump();
        expect(find.text(failure.name), findsOneWidget);
      }
      await tester.pumpWidget(app(FakeAuthRepository()));
      await tester.tap(find.text('Pulihkan akun'));
      await tester.pump();
      await tester.tap(find.text('Minta verifikasi synthetic'));
      await tester.pump();
      expect(find.text('Berhasil.'), findsOneWidget);
    },
  );
}
