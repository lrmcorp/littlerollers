// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'otp_request.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$OtpRequest extends OtpRequest {
  @override
  final String phoneE164;

  factory _$OtpRequest([void Function(OtpRequestBuilder)? updates]) =>
      (OtpRequestBuilder()..update(updates))._build();

  _$OtpRequest._({required this.phoneE164}) : super._();
  @override
  OtpRequest rebuild(void Function(OtpRequestBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  OtpRequestBuilder toBuilder() => OtpRequestBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is OtpRequest && phoneE164 == other.phoneE164;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, phoneE164.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(
      r'OtpRequest',
    )..add('phoneE164', phoneE164)).toString();
  }
}

class OtpRequestBuilder implements Builder<OtpRequest, OtpRequestBuilder> {
  _$OtpRequest? _$v;

  String? _phoneE164;
  String? get phoneE164 => _$this._phoneE164;
  set phoneE164(String? phoneE164) => _$this._phoneE164 = phoneE164;

  OtpRequestBuilder() {
    OtpRequest._defaults(this);
  }

  OtpRequestBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _phoneE164 = $v.phoneE164;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(OtpRequest other) {
    _$v = other as _$OtpRequest;
  }

  @override
  void update(void Function(OtpRequestBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  OtpRequest build() => _build();

  _$OtpRequest _build() {
    final _$result =
        _$v ??
        _$OtpRequest._(
          phoneE164: BuiltValueNullFieldError.checkNotNull(
            phoneE164,
            r'OtpRequest',
            'phoneE164',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
