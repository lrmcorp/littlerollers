import 'package:test/test.dart';
import 'package:openapi/openapi.dart';


/// tests for AuthApi
void main() {
  final instance = Openapi(basePathOverride: 'http://localhost/api/v1').getAuthApi();

  group(AuthApi, () {
    //Future<Session> activatePassword(PasswordTokenCommand passwordTokenCommand) async
    test('test activatePassword', () async {
      // TODO
    });

    //Future<Session> authenticateGoogle(GoogleAuthRequest googleAuthRequest) async
    test('test authenticateGoogle', () async {
      // TODO
    });

    //Future<Session> authenticatePassword(PasswordSessionRequest passwordSessionRequest) async
    test('test authenticatePassword', () async {
      // TODO
    });

    //Future<ChangedStatus> changePassword(PasswordChangeCommand passwordChangeCommand) async
    test('test changePassword', () async {
      // TODO
    });

    //Future<AuthSecurityStatus> getAuthSecurityStatus() async
    test('test getAuthSecurityStatus', () async {
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

    // Mobile sends the rotating refresh token as Bearer credential; web uses its secure HttpOnly session cookie.
    //
    //Future<Session> refreshSession() async
    test('test refreshSession', () async {
      // TODO
    });

    // Creates an active CUSTOMER account with pending private selfie and KTP verification, then issues a web session.
    //
    //Future<Session> registerCustomer(String displayName, String phone, String email, String password, bool consent, MultipartFile selfie, MultipartFile ktp) async
    test('test registerCustomer', () async {
      // TODO
    });

    //Future<ChallengeAccepted> requestAccountRecovery(RecoveryRequestCommand recoveryRequestCommand) async
    test('test requestAccountRecovery', () async {
      // TODO
    });

    //Future<ChallengeAccepted> requestOtp(OtpRequest otpRequest) async
    test('test requestOtp', () async {
      // TODO
    });

    //Future<AcceptedStatus> requestPasswordReset(PasswordResetRequest passwordResetRequest) async
    test('test requestPasswordReset', () async {
      // TODO
    });

    //Future<ChangedStatus> resetPassword(PasswordTokenCommand passwordTokenCommand) async
    test('test resetPassword', () async {
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

    //Future<Session> verifyOtp(OtpVerifyRequest otpVerifyRequest) async
    test('test verifyOtp', () async {
      // TODO
    });

  });
}
