// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'identity_document_self_view_authorization.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$IdentityDocumentSelfViewAuthorization
    extends IdentityDocumentSelfViewAuthorization {
  @override
  final String url;
  @override
  final DateTime expiresAt;

  factory _$IdentityDocumentSelfViewAuthorization([
    void Function(IdentityDocumentSelfViewAuthorizationBuilder)? updates,
  ]) => (IdentityDocumentSelfViewAuthorizationBuilder()..update(updates))
      ._build();

  _$IdentityDocumentSelfViewAuthorization._({
    required this.url,
    required this.expiresAt,
  }) : super._();
  @override
  IdentityDocumentSelfViewAuthorization rebuild(
    void Function(IdentityDocumentSelfViewAuthorizationBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  IdentityDocumentSelfViewAuthorizationBuilder toBuilder() =>
      IdentityDocumentSelfViewAuthorizationBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is IdentityDocumentSelfViewAuthorization &&
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
            r'IdentityDocumentSelfViewAuthorization',
          )
          ..add('url', url)
          ..add('expiresAt', expiresAt))
        .toString();
  }
}

class IdentityDocumentSelfViewAuthorizationBuilder
    implements
        Builder<
          IdentityDocumentSelfViewAuthorization,
          IdentityDocumentSelfViewAuthorizationBuilder
        > {
  _$IdentityDocumentSelfViewAuthorization? _$v;

  String? _url;
  String? get url => _$this._url;
  set url(String? url) => _$this._url = url;

  DateTime? _expiresAt;
  DateTime? get expiresAt => _$this._expiresAt;
  set expiresAt(DateTime? expiresAt) => _$this._expiresAt = expiresAt;

  IdentityDocumentSelfViewAuthorizationBuilder() {
    IdentityDocumentSelfViewAuthorization._defaults(this);
  }

  IdentityDocumentSelfViewAuthorizationBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _url = $v.url;
      _expiresAt = $v.expiresAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(IdentityDocumentSelfViewAuthorization other) {
    _$v = other as _$IdentityDocumentSelfViewAuthorization;
  }

  @override
  void update(
    void Function(IdentityDocumentSelfViewAuthorizationBuilder)? updates,
  ) {
    if (updates != null) updates(this);
  }

  @override
  IdentityDocumentSelfViewAuthorization build() => _build();

  _$IdentityDocumentSelfViewAuthorization _build() {
    final _$result =
        _$v ??
        _$IdentityDocumentSelfViewAuthorization._(
          url: BuiltValueNullFieldError.checkNotNull(
            url,
            r'IdentityDocumentSelfViewAuthorization',
            'url',
          ),
          expiresAt: BuiltValueNullFieldError.checkNotNull(
            expiresAt,
            r'IdentityDocumentSelfViewAuthorization',
            'expiresAt',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
