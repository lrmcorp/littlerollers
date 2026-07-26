// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'auth_security_status.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AuthSecurityStatus extends AuthSecurityStatus {
  @override
  final bool passwordEnabled;
  @override
  final DateTime? passwordChangedAt;

  factory _$AuthSecurityStatus([
    void Function(AuthSecurityStatusBuilder)? updates,
  ]) => (AuthSecurityStatusBuilder()..update(updates))._build();

  _$AuthSecurityStatus._({
    required this.passwordEnabled,
    this.passwordChangedAt,
  }) : super._();
  @override
  AuthSecurityStatus rebuild(
    void Function(AuthSecurityStatusBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  AuthSecurityStatusBuilder toBuilder() =>
      AuthSecurityStatusBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AuthSecurityStatus &&
        passwordEnabled == other.passwordEnabled &&
        passwordChangedAt == other.passwordChangedAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, passwordEnabled.hashCode);
    _$hash = $jc(_$hash, passwordChangedAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AuthSecurityStatus')
          ..add('passwordEnabled', passwordEnabled)
          ..add('passwordChangedAt', passwordChangedAt))
        .toString();
  }
}

class AuthSecurityStatusBuilder
    implements Builder<AuthSecurityStatus, AuthSecurityStatusBuilder> {
  _$AuthSecurityStatus? _$v;

  bool? _passwordEnabled;
  bool? get passwordEnabled => _$this._passwordEnabled;
  set passwordEnabled(bool? passwordEnabled) =>
      _$this._passwordEnabled = passwordEnabled;

  DateTime? _passwordChangedAt;
  DateTime? get passwordChangedAt => _$this._passwordChangedAt;
  set passwordChangedAt(DateTime? passwordChangedAt) =>
      _$this._passwordChangedAt = passwordChangedAt;

  AuthSecurityStatusBuilder() {
    AuthSecurityStatus._defaults(this);
  }

  AuthSecurityStatusBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _passwordEnabled = $v.passwordEnabled;
      _passwordChangedAt = $v.passwordChangedAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AuthSecurityStatus other) {
    _$v = other as _$AuthSecurityStatus;
  }

  @override
  void update(void Function(AuthSecurityStatusBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AuthSecurityStatus build() => _build();

  _$AuthSecurityStatus _build() {
    final _$result =
        _$v ??
        _$AuthSecurityStatus._(
          passwordEnabled: BuiltValueNullFieldError.checkNotNull(
            passwordEnabled,
            r'AuthSecurityStatus',
            'passwordEnabled',
          ),
          passwordChangedAt: passwordChangedAt,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
