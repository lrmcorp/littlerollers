// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'deactivate_user_request.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$DeactivateUserRequest extends DeactivateUserRequest {
  @override
  final String reason;

  factory _$DeactivateUserRequest([
    void Function(DeactivateUserRequestBuilder)? updates,
  ]) => (DeactivateUserRequestBuilder()..update(updates))._build();

  _$DeactivateUserRequest._({required this.reason}) : super._();
  @override
  DeactivateUserRequest rebuild(
    void Function(DeactivateUserRequestBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  DeactivateUserRequestBuilder toBuilder() =>
      DeactivateUserRequestBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is DeactivateUserRequest && reason == other.reason;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(
      r'DeactivateUserRequest',
    )..add('reason', reason)).toString();
  }
}

class DeactivateUserRequestBuilder
    implements Builder<DeactivateUserRequest, DeactivateUserRequestBuilder> {
  _$DeactivateUserRequest? _$v;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(String? reason) => _$this._reason = reason;

  DeactivateUserRequestBuilder() {
    DeactivateUserRequest._defaults(this);
  }

  DeactivateUserRequestBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _reason = $v.reason;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(DeactivateUserRequest other) {
    _$v = other as _$DeactivateUserRequest;
  }

  @override
  void update(void Function(DeactivateUserRequestBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  DeactivateUserRequest build() => _build();

  _$DeactivateUserRequest _build() {
    final _$result =
        _$v ??
        _$DeactivateUserRequest._(
          reason: BuiltValueNullFieldError.checkNotNull(
            reason,
            r'DeactivateUserRequest',
            'reason',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
