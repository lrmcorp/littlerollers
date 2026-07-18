import 'package:dailydose_api_client/dailydose_api_client.dart';

enum AuthFailure {
  configuration,
  rateLimited,
  expired,
  locked,
  offline,
  sessionExpired,
}

class AuthException implements Exception {
  const AuthException(this.failure);
  final AuthFailure failure;
}

abstract interface class TokenStorage {
  Future<void> writeRefreshToken(String value);
  Future<void> clear();
}

abstract interface class AuthRepository {
  Future<void> signInGoogle();
  Future<String> requestOtp(String phone);
  Future<void> verifyOtp(String requestId, String code);
  Future<String> requestRecovery(String identifier);
}

class GeneratedAuthRepository implements AuthRepository {
  GeneratedAuthRepository({required String baseUrl, required this.storage})
    : _api = Openapi(basePathOverride: '$baseUrl/api/v1').getAuthApi();

  final AuthApi _api;
  final TokenStorage storage;

  @override
  Future<void> signInGoogle() async {
    await _api.authenticateGoogle(
      googleAuthRequest: GoogleAuthRequest(
        (b) => b
          ..idToken = 'configured-provider-token'
          ..nonce = DateTime.now().microsecondsSinceEpoch.toString()
          ..channel = GoogleAuthRequestChannelEnum.MOBILE,
      ),
    );
  }

  @override
  Future<String> requestOtp(String phone) async {
    final response = await _api.requestOtp(
      otpRequest: OtpRequest((b) => b..phoneE164 = phone),
    );
    return response.data!.requestId;
  }

  @override
  Future<void> verifyOtp(String requestId, String code) async {
    final response = await _api.verifyOtp(
      otpVerifyRequest: OtpVerifyRequest(
        (b) => b
          ..requestId = requestId
          ..code = code,
      ),
    );
    final refresh = response.data?.refreshToken;
    if (refresh != null) await storage.writeRefreshToken(refresh);
  }

  @override
  Future<String> requestRecovery(String identifier) async {
    final response = await _api.requestAccountRecovery(
      recoveryRequestCommand: RecoveryRequestCommand(
        (b) => b
          ..identifier = identifier
          ..requestedChannel =
              RecoveryRequestCommandRequestedChannelEnum.WHATSAPP,
      ),
    );
    return response.data!.requestId;
  }
}
