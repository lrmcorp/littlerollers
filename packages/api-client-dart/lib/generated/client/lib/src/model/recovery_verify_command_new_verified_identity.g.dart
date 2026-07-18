// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'recovery_verify_command_new_verified_identity.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$RecoveryVerifyCommandNewVerifiedIdentity
    extends RecoveryVerifyCommandNewVerifiedIdentity {
  @override
  final String? provider;
  @override
  final String? providerToken;

  factory _$RecoveryVerifyCommandNewVerifiedIdentity([
    void Function(RecoveryVerifyCommandNewVerifiedIdentityBuilder)? updates,
  ]) => (RecoveryVerifyCommandNewVerifiedIdentityBuilder()..update(updates))
      ._build();

  _$RecoveryVerifyCommandNewVerifiedIdentity._({
    this.provider,
    this.providerToken,
  }) : super._();
  @override
  RecoveryVerifyCommandNewVerifiedIdentity rebuild(
    void Function(RecoveryVerifyCommandNewVerifiedIdentityBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  RecoveryVerifyCommandNewVerifiedIdentityBuilder toBuilder() =>
      RecoveryVerifyCommandNewVerifiedIdentityBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is RecoveryVerifyCommandNewVerifiedIdentity &&
        provider == other.provider &&
        providerToken == other.providerToken;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, provider.hashCode);
    _$hash = $jc(_$hash, providerToken.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(
            r'RecoveryVerifyCommandNewVerifiedIdentity',
          )
          ..add('provider', provider)
          ..add('providerToken', providerToken))
        .toString();
  }
}

class RecoveryVerifyCommandNewVerifiedIdentityBuilder
    implements
        Builder<
          RecoveryVerifyCommandNewVerifiedIdentity,
          RecoveryVerifyCommandNewVerifiedIdentityBuilder
        > {
  _$RecoveryVerifyCommandNewVerifiedIdentity? _$v;

  String? _provider;
  String? get provider => _$this._provider;
  set provider(String? provider) => _$this._provider = provider;

  String? _providerToken;
  String? get providerToken => _$this._providerToken;
  set providerToken(String? providerToken) =>
      _$this._providerToken = providerToken;

  RecoveryVerifyCommandNewVerifiedIdentityBuilder() {
    RecoveryVerifyCommandNewVerifiedIdentity._defaults(this);
  }

  RecoveryVerifyCommandNewVerifiedIdentityBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _provider = $v.provider;
      _providerToken = $v.providerToken;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(RecoveryVerifyCommandNewVerifiedIdentity other) {
    _$v = other as _$RecoveryVerifyCommandNewVerifiedIdentity;
  }

  @override
  void update(
    void Function(RecoveryVerifyCommandNewVerifiedIdentityBuilder)? updates,
  ) {
    if (updates != null) updates(this);
  }

  @override
  RecoveryVerifyCommandNewVerifiedIdentity build() => _build();

  _$RecoveryVerifyCommandNewVerifiedIdentity _build() {
    final _$result =
        _$v ??
        _$RecoveryVerifyCommandNewVerifiedIdentity._(
          provider: provider,
          providerToken: providerToken,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
