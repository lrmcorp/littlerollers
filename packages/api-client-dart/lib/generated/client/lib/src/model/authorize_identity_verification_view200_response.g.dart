// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'authorize_identity_verification_view200_response.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AuthorizeIdentityVerificationView200Response
    extends AuthorizeIdentityVerificationView200Response {
  @override
  final String url;
  @override
  final DateTime expiresAt;

  factory _$AuthorizeIdentityVerificationView200Response([
    void Function(AuthorizeIdentityVerificationView200ResponseBuilder)? updates,
  ]) => (AuthorizeIdentityVerificationView200ResponseBuilder()..update(updates))
      ._build();

  _$AuthorizeIdentityVerificationView200Response._({
    required this.url,
    required this.expiresAt,
  }) : super._();
  @override
  AuthorizeIdentityVerificationView200Response rebuild(
    void Function(AuthorizeIdentityVerificationView200ResponseBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  AuthorizeIdentityVerificationView200ResponseBuilder toBuilder() =>
      AuthorizeIdentityVerificationView200ResponseBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AuthorizeIdentityVerificationView200Response &&
        url == other.url &&
        expiresAt == other.expiresAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, url.hashCode);
    _$hash = $jc(_$hash, expiresAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(
            r'AuthorizeIdentityVerificationView200Response',
          )
          ..add('url', url)
          ..add('expiresAt', expiresAt))
        .toString();
  }
}

class AuthorizeIdentityVerificationView200ResponseBuilder
    implements
        Builder<
          AuthorizeIdentityVerificationView200Response,
          AuthorizeIdentityVerificationView200ResponseBuilder
        > {
  _$AuthorizeIdentityVerificationView200Response? _$v;

  String? _url;
  String? get url => _$this._url;
  set url(String? url) => _$this._url = url;

  DateTime? _expiresAt;
  DateTime? get expiresAt => _$this._expiresAt;
  set expiresAt(DateTime? expiresAt) => _$this._expiresAt = expiresAt;

  AuthorizeIdentityVerificationView200ResponseBuilder() {
    AuthorizeIdentityVerificationView200Response._defaults(this);
  }

  AuthorizeIdentityVerificationView200ResponseBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _url = $v.url;
      _expiresAt = $v.expiresAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AuthorizeIdentityVerificationView200Response other) {
    _$v = other as _$AuthorizeIdentityVerificationView200Response;
  }

  @override
  void update(
    void Function(AuthorizeIdentityVerificationView200ResponseBuilder)? updates,
  ) {
    if (updates != null) updates(this);
  }

  @override
  AuthorizeIdentityVerificationView200Response build() => _build();

  _$AuthorizeIdentityVerificationView200Response _build() {
    final _$result =
        _$v ??
        _$AuthorizeIdentityVerificationView200Response._(
          url: BuiltValueNullFieldError.checkNotNull(
            url,
            r'AuthorizeIdentityVerificationView200Response',
            'url',
          ),
          expiresAt: BuiltValueNullFieldError.checkNotNull(
            expiresAt,
            r'AuthorizeIdentityVerificationView200Response',
            'expiresAt',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
