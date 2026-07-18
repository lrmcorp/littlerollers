import 'package:flutter_secure_storage/flutter_secure_storage.dart';

abstract interface class SessionStore {
  Future<void> writeRefreshToken(String value);
  Future<String?> readRefreshToken();
  Future<void> clear();
}

class SecureSessionStore implements SessionStore {
  SecureSessionStore([FlutterSecureStorage? storage])
    : _storage = storage ?? const FlutterSecureStorage();
  final FlutterSecureStorage _storage;
  static const _key = 'refresh_token';
  @override
  Future<void> writeRefreshToken(String value) =>
      _storage.write(key: _key, value: value);
  @override
  Future<String?> readRefreshToken() => _storage.read(key: _key);
  @override
  Future<void> clear() => _storage.delete(key: _key);
}
