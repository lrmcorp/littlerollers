// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'otp_verify_request.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$OtpVerifyRequest extends OtpVerifyRequest {
  @override
  final String requestId;
  @override
  final String code;

  factory _$OtpVerifyRequest([
    void Function(OtpVerifyRequestBuilder)? updates,
  ]) => (OtpVerifyRequestBuilder()..update(updates))._build();

  _$OtpVerifyRequest._({required this.requestId, required this.code})
    : super._();
  @override
  OtpVerifyRequest rebuild(void Function(OtpVerifyRequestBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  OtpVerifyRequestBuilder toBuilder() =>
      OtpVerifyRequestBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is OtpVerifyRequest &&
        requestId == other.requestId &&
        code == other.code;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, requestId.hashCode);
    _$hash = $jc(_$hash, code.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'OtpVerifyRequest')
          ..add('requestId', requestId)
          ..add('code', code))
        .toString();
  }
}

class OtpVerifyRequestBuilder
    implements Builder<OtpVerifyRequest, OtpVerifyRequestBuilder> {
  _$OtpVerifyRequest? _$v;

  String? _requestId;
  String? get requestId => _$this._requestId;
  set requestId(String? requestId) => _$this._requestId = requestId;

  String? _code;
  String? get code => _$this._code;
  set code(String? code) => _$this._code = code;

  OtpVerifyRequestBuilder() {
    OtpVerifyRequest._defaults(this);
  }

  OtpVerifyRequestBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _requestId = $v.requestId;
      _code = $v.code;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(OtpVerifyRequest other) {
    _$v = other as _$OtpVerifyRequest;
  }

  @override
  void update(void Function(OtpVerifyRequestBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  OtpVerifyRequest build() => _build();

  _$OtpVerifyRequest _build() {
    final _$result =
        _$v ??
        _$OtpVerifyRequest._(
          requestId: BuiltValueNullFieldError.checkNotNull(
            requestId,
            r'OtpVerifyRequest',
            'requestId',
          ),
          code: BuiltValueNullFieldError.checkNotNull(
            code,
            r'OtpVerifyRequest',
            'code',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
