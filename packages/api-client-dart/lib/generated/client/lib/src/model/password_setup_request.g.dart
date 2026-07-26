// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'password_setup_request.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PasswordSetupRequest extends PasswordSetupRequest {
  @override
  final String email;
  @override
  final String reason;

  factory _$PasswordSetupRequest([
    void Function(PasswordSetupRequestBuilder)? updates,
  ]) => (PasswordSetupRequestBuilder()..update(updates))._build();

  _$PasswordSetupRequest._({required this.email, required this.reason})
    : super._();
  @override
  PasswordSetupRequest rebuild(
    void Function(PasswordSetupRequestBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  PasswordSetupRequestBuilder toBuilder() =>
      PasswordSetupRequestBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PasswordSetupRequest &&
        email == other.email &&
        reason == other.reason;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, email.hashCode);
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PasswordSetupRequest')
          ..add('email', email)
          ..add('reason', reason))
        .toString();
  }
}

class PasswordSetupRequestBuilder
    implements Builder<PasswordSetupRequest, PasswordSetupRequestBuilder> {
  _$PasswordSetupRequest? _$v;

  String? _email;
  String? get email => _$this._email;
  set email(String? email) => _$this._email = email;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(String? reason) => _$this._reason = reason;

  PasswordSetupRequestBuilder() {
    PasswordSetupRequest._defaults(this);
  }

  PasswordSetupRequestBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _email = $v.email;
      _reason = $v.reason;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PasswordSetupRequest other) {
    _$v = other as _$PasswordSetupRequest;
  }

  @override
  void update(void Function(PasswordSetupRequestBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PasswordSetupRequest build() => _build();

  _$PasswordSetupRequest _build() {
    final _$result =
        _$v ??
        _$PasswordSetupRequest._(
          email: BuiltValueNullFieldError.checkNotNull(
            email,
            r'PasswordSetupRequest',
            'email',
          ),
          reason: BuiltValueNullFieldError.checkNotNull(
            reason,
            r'PasswordSetupRequest',
            'reason',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
