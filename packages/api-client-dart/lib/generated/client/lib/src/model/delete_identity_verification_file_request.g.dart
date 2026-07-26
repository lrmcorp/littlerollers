// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'delete_identity_verification_file_request.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$DeleteIdentityVerificationFileRequest
    extends DeleteIdentityVerificationFileRequest {
  @override
  final int expectedVersion;
  @override
  final String reason;

  factory _$DeleteIdentityVerificationFileRequest([
    void Function(DeleteIdentityVerificationFileRequestBuilder)? updates,
  ]) => (DeleteIdentityVerificationFileRequestBuilder()..update(updates))
      ._build();

  _$DeleteIdentityVerificationFileRequest._({
    required this.expectedVersion,
    required this.reason,
  }) : super._();
  @override
  DeleteIdentityVerificationFileRequest rebuild(
    void Function(DeleteIdentityVerificationFileRequestBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  DeleteIdentityVerificationFileRequestBuilder toBuilder() =>
      DeleteIdentityVerificationFileRequestBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is DeleteIdentityVerificationFileRequest &&
        expectedVersion == other.expectedVersion &&
        reason == other.reason;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, expectedVersion.hashCode);
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(
            r'DeleteIdentityVerificationFileRequest',
          )
          ..add('expectedVersion', expectedVersion)
          ..add('reason', reason))
        .toString();
  }
}

class DeleteIdentityVerificationFileRequestBuilder
    implements
        Builder<
          DeleteIdentityVerificationFileRequest,
          DeleteIdentityVerificationFileRequestBuilder
        > {
  _$DeleteIdentityVerificationFileRequest? _$v;

  int? _expectedVersion;
  int? get expectedVersion => _$this._expectedVersion;
  set expectedVersion(int? expectedVersion) =>
      _$this._expectedVersion = expectedVersion;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(String? reason) => _$this._reason = reason;

  DeleteIdentityVerificationFileRequestBuilder() {
    DeleteIdentityVerificationFileRequest._defaults(this);
  }

  DeleteIdentityVerificationFileRequestBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _expectedVersion = $v.expectedVersion;
      _reason = $v.reason;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(DeleteIdentityVerificationFileRequest other) {
    _$v = other as _$DeleteIdentityVerificationFileRequest;
  }

  @override
  void update(
    void Function(DeleteIdentityVerificationFileRequestBuilder)? updates,
  ) {
    if (updates != null) updates(this);
  }

  @override
  DeleteIdentityVerificationFileRequest build() => _build();

  _$DeleteIdentityVerificationFileRequest _build() {
    final _$result =
        _$v ??
        _$DeleteIdentityVerificationFileRequest._(
          expectedVersion: BuiltValueNullFieldError.checkNotNull(
            expectedVersion,
            r'DeleteIdentityVerificationFileRequest',
            'expectedVersion',
          ),
          reason: BuiltValueNullFieldError.checkNotNull(
            reason,
            r'DeleteIdentityVerificationFileRequest',
            'reason',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
