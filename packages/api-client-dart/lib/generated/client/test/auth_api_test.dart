import 'package:test/test.dart';
import 'package:openapi/openapi.dart';


/// tests for AuthApi
void main() {
  final instance = Openapi().getAuthApi();

  group(AuthApi, () {
    //Future<Session> authenticateGoogle(GoogleAuthRequest googleAuthRequest) async
    test('test authenticateGoogle', () async {
      // TODO
    });

    //Future<MfaChallenge> createMfaChallenge(MfaChallengeCommand mfaChallengeCommand) async
    test('test createMfaChallenge', () async {
      // TODO
    });

    //Future<Resource> linkVerifiedIdentity(String idempotencyKey, AccountLinkCommand accountLinkCommand) async
    test('test linkVerifiedIdentity', () async {
      // TODO
    });

    //Future logout() async
    test('test logout', () async {
      // TODO
    });

    //Future<Session> refreshSession() async
    test('test refreshSession', () async {
      // TODO
    });

    //Future requestAccountRecovery(RecoveryRequestCommand recoveryRequestCommand) async
    test('test requestAccountRecovery', () async {
      // TODO
    });

    //Future requestOtp(OtpRequest otpRequest) async
    test('test requestOtp', () async {
      // TODO
    });

    //Future revokeAllSessions(RevokeSessionsCommand revokeSessionsCommand) async
    test('test revokeAllSessions', () async {
      // TODO
    });

    //Future<Session> verifyAccountRecovery(String id, String idempotencyKey, RecoveryVerifyCommand recoveryVerifyCommand) async
    test('test verifyAccountRecovery', () async {
      // TODO
    });

    //Future<Session> verifyMfaChallenge(MfaVerifyCommand mfaVerifyCommand) async
    test('test verifyMfaChallenge', () async {
      // TODO
    });

    //Future<Session> verifyOtp(OtpVerifyRequest otpVerifyRequest) async
    test('test verifyOtp', () async {
      // TODO
    });

  });
}
