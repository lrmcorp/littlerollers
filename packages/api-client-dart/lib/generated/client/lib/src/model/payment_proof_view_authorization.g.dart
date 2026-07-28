// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'payment_proof_view_authorization.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PaymentProofViewAuthorization extends PaymentProofViewAuthorization {
  @override
  final String url;
  @override
  final DateTime expiresAt;

  factory _$PaymentProofViewAuthorization([
    void Function(PaymentProofViewAuthorizationBuilder)? updates,
  ]) => (PaymentProofViewAuthorizationBuilder()..update(updates))._build();

  _$PaymentProofViewAuthorization._({
    required this.url,
    required this.expiresAt,
  }) : super._();
  @override
  PaymentProofViewAuthorization rebuild(
    void Function(PaymentProofViewAuthorizationBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  PaymentProofViewAuthorizationBuilder toBuilder() =>
      PaymentProofViewAuthorizationBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PaymentProofViewAuthorization &&
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
    return (newBuiltValueToStringHelper(r'PaymentProofViewAuthorization')
          ..add('url', url)
          ..add('expiresAt', expiresAt))
        .toString();
  }
}

class PaymentProofViewAuthorizationBuilder
    implements
        Builder<
          PaymentProofViewAuthorization,
          PaymentProofViewAuthorizationBuilder
        > {
  _$PaymentProofViewAuthorization? _$v;

  String? _url;
  String? get url => _$this._url;
  set url(String? url) => _$this._url = url;

  DateTime? _expiresAt;
  DateTime? get expiresAt => _$this._expiresAt;
  set expiresAt(DateTime? expiresAt) => _$this._expiresAt = expiresAt;

  PaymentProofViewAuthorizationBuilder() {
    PaymentProofViewAuthorization._defaults(this);
  }

  PaymentProofViewAuthorizationBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _url = $v.url;
      _expiresAt = $v.expiresAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PaymentProofViewAuthorization other) {
    _$v = other as _$PaymentProofViewAuthorization;
  }

  @override
  void update(void Function(PaymentProofViewAuthorizationBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PaymentProofViewAuthorization build() => _build();

  _$PaymentProofViewAuthorization _build() {
    final _$result =
        _$v ??
        _$PaymentProofViewAuthorization._(
          url: BuiltValueNullFieldError.checkNotNull(
            url,
            r'PaymentProofViewAuthorization',
            'url',
          ),
          expiresAt: BuiltValueNullFieldError.checkNotNull(
            expiresAt,
            r'PaymentProofViewAuthorization',
            'expiresAt',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
