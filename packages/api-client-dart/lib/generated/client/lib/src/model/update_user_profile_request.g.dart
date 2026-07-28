// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'update_user_profile_request.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$UpdateUserProfileRequest extends UpdateUserProfileRequest {
  @override
  final String displayName;
  @override
  final String? phoneE164;
  @override
  final int expectedVersion;
  @override
  final String reason;

  factory _$UpdateUserProfileRequest([
    void Function(UpdateUserProfileRequestBuilder)? updates,
  ]) => (UpdateUserProfileRequestBuilder()..update(updates))._build();

  _$UpdateUserProfileRequest._({
    required this.displayName,
    this.phoneE164,
    required this.expectedVersion,
    required this.reason,
  }) : super._();
  @override
  UpdateUserProfileRequest rebuild(
    void Function(UpdateUserProfileRequestBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  UpdateUserProfileRequestBuilder toBuilder() =>
      UpdateUserProfileRequestBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is UpdateUserProfileRequest &&
        displayName == other.displayName &&
        phoneE164 == other.phoneE164 &&
        expectedVersion == other.expectedVersion &&
        reason == other.reason;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, displayName.hashCode);
    _$hash = $jc(_$hash, phoneE164.hashCode);
    _$hash = $jc(_$hash, expectedVersion.hashCode);
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'UpdateUserProfileRequest')
          ..add('displayName', displayName)
          ..add('phoneE164', phoneE164)
          ..add('expectedVersion', expectedVersion)
          ..add('reason', reason))
        .toString();
  }
}

class UpdateUserProfileRequestBuilder
    implements
        Builder<UpdateUserProfileRequest, UpdateUserProfileRequestBuilder> {
  _$UpdateUserProfileRequest? _$v;

  String? _displayName;
  String? get displayName => _$this._displayName;
  set displayName(String? displayName) => _$this._displayName = displayName;

  String? _phoneE164;
  String? get phoneE164 => _$this._phoneE164;
  set phoneE164(String? phoneE164) => _$this._phoneE164 = phoneE164;

  int? _expectedVersion;
  int? get expectedVersion => _$this._expectedVersion;
  set expectedVersion(int? expectedVersion) =>
      _$this._expectedVersion = expectedVersion;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(String? reason) => _$this._reason = reason;

  UpdateUserProfileRequestBuilder() {
    UpdateUserProfileRequest._defaults(this);
  }

  UpdateUserProfileRequestBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _displayName = $v.displayName;
      _phoneE164 = $v.phoneE164;
      _expectedVersion = $v.expectedVersion;
      _reason = $v.reason;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(UpdateUserProfileRequest other) {
    _$v = other as _$UpdateUserProfileRequest;
  }

  @override
  void update(void Function(UpdateUserProfileRequestBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  UpdateUserProfileRequest build() => _build();

  _$UpdateUserProfileRequest _build() {
    final _$result =
        _$v ??
        _$UpdateUserProfileRequest._(
          displayName: BuiltValueNullFieldError.checkNotNull(
            displayName,
            r'UpdateUserProfileRequest',
            'displayName',
          ),
          phoneE164: phoneE164,
          expectedVersion: BuiltValueNullFieldError.checkNotNull(
            expectedVersion,
            r'UpdateUserProfileRequest',
            'expectedVersion',
          ),
          reason: BuiltValueNullFieldError.checkNotNull(
            reason,
            r'UpdateUserProfileRequest',
            'reason',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
