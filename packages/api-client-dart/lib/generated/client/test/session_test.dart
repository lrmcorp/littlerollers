import 'package:test/test.dart';
import 'package:openapi/openapi.dart';

// tests for Session
void main() {
  final instance = SessionBuilder();
  // TODO add properties to the builder and call build()

  group(Session, () {
    // Mobile only; web uses secure HttpOnly cookie
    // String accessToken
    test('to test the property `accessToken`', () async {
      // TODO
    });

    // Mobile only and returned only at issuance/rotation
    // String refreshToken
    test('to test the property `refreshToken`', () async {
      // TODO
    });

    // Me user
    test('to test the property `user`', () async {
      // TODO
    });

    // String assurance
    test('to test the property `assurance`', () async {
      // TODO
    });

    // String channel
    test('to test the property `channel`', () async {
      // TODO
    });

    // DateTime expiresAt
    test('to test the property `expiresAt`', () async {
      // TODO
    });

    // DateTime refreshExpiresAt
    test('to test the property `refreshExpiresAt`', () async {
      // TODO
    });

  });
}
