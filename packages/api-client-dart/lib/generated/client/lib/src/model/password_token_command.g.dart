// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'password_token_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PasswordTokenCommand extends PasswordTokenCommand {
  @override
  final String token;
  @override
  final String password;

  factory _$PasswordTokenCommand([
    void Function(PasswordTokenCommandBuilder)? updates,
  ]) => (PasswordTokenCommandBuilder()..update(updates))._build();

  _$PasswordTokenCommand._({required this.token, required this.password})
    : super._();
  @override
  PasswordTokenCommand rebuild(
    void Function(PasswordTokenCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  PasswordTokenCommandBuilder toBuilder() =>
      PasswordTokenCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PasswordTokenCommand &&
        token == other.token &&
        password == other.password;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, token.hashCode);
    _$hash = $jc(_$hash, password.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PasswordTokenCommand')
          ..add('token', token)
          ..add('password', password))
        .toString();
  }
}

class PasswordTokenCommandBuilder
    implements Builder<PasswordTokenCommand, PasswordTokenCommandBuilder> {
  _$PasswordTokenCommand? _$v;

  String? _token;
  String? get token => _$this._token;
  set token(String? token) => _$this._token = token;

  String? _password;
  String? get password => _$this._password;
  set password(String? password) => _$this._password = password;

  PasswordTokenCommandBuilder() {
    PasswordTokenCommand._defaults(this);
  }

  PasswordTokenCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _token = $v.token;
      _password = $v.password;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PasswordTokenCommand other) {
    _$v = other as _$PasswordTokenCommand;
  }

  @override
  void update(void Function(PasswordTokenCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PasswordTokenCommand build() => _build();

  _$PasswordTokenCommand _build() {
    final _$result =
        _$v ??
        _$PasswordTokenCommand._(
          token: BuiltValueNullFieldError.checkNotNull(
            token,
            r'PasswordTokenCommand',
            'token',
          ),
          password: BuiltValueNullFieldError.checkNotNull(
            password,
            r'PasswordTokenCommand',
            'password',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
