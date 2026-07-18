// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'token_check_in_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$TokenCheckInCommand extends TokenCheckInCommand {
  @override
  final String token;

  factory _$TokenCheckInCommand([
    void Function(TokenCheckInCommandBuilder)? updates,
  ]) => (TokenCheckInCommandBuilder()..update(updates))._build();

  _$TokenCheckInCommand._({required this.token}) : super._();
  @override
  TokenCheckInCommand rebuild(
    void Function(TokenCheckInCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  TokenCheckInCommandBuilder toBuilder() =>
      TokenCheckInCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is TokenCheckInCommand && token == other.token;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, token.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(
      r'TokenCheckInCommand',
    )..add('token', token)).toString();
  }
}

class TokenCheckInCommandBuilder
    implements Builder<TokenCheckInCommand, TokenCheckInCommandBuilder> {
  _$TokenCheckInCommand? _$v;

  String? _token;
  String? get token => _$this._token;
  set token(String? token) => _$this._token = token;

  TokenCheckInCommandBuilder() {
    TokenCheckInCommand._defaults(this);
  }

  TokenCheckInCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _token = $v.token;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(TokenCheckInCommand other) {
    _$v = other as _$TokenCheckInCommand;
  }

  @override
  void update(void Function(TokenCheckInCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  TokenCheckInCommand build() => _build();

  _$TokenCheckInCommand _build() {
    final _$result =
        _$v ??
        _$TokenCheckInCommand._(
          token: BuiltValueNullFieldError.checkNotNull(
            token,
            r'TokenCheckInCommand',
            'token',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
