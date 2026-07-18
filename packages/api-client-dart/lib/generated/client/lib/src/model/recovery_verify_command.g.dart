// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'recovery_verify_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$RecoveryVerifyCommand extends RecoveryVerifyCommand {
  @override
  final String verificationReference;
  @override
  final String proof;
  @override
  final RecoveryVerifyCommandNewVerifiedIdentity? newVerifiedIdentity;

  factory _$RecoveryVerifyCommand([
    void Function(RecoveryVerifyCommandBuilder)? updates,
  ]) => (RecoveryVerifyCommandBuilder()..update(updates))._build();

  _$RecoveryVerifyCommand._({
    required this.verificationReference,
    required this.proof,
    this.newVerifiedIdentity,
  }) : super._();
  @override
  RecoveryVerifyCommand rebuild(
    void Function(RecoveryVerifyCommandBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  RecoveryVerifyCommandBuilder toBuilder() =>
      RecoveryVerifyCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is RecoveryVerifyCommand &&
        verificationReference == other.verificationReference &&
        proof == other.proof &&
        newVerifiedIdentity == other.newVerifiedIdentity;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, verificationReference.hashCode);
    _$hash = $jc(_$hash, proof.hashCode);
    _$hash = $jc(_$hash, newVerifiedIdentity.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'RecoveryVerifyCommand')
          ..add('verificationReference', verificationReference)
          ..add('proof', proof)
          ..add('newVerifiedIdentity', newVerifiedIdentity))
        .toString();
  }
}

class RecoveryVerifyCommandBuilder
    implements Builder<RecoveryVerifyCommand, RecoveryVerifyCommandBuilder> {
  _$RecoveryVerifyCommand? _$v;

  String? _verificationReference;
  String? get verificationReference => _$this._verificationReference;
  set verificationReference(String? verificationReference) =>
      _$this._verificationReference = verificationReference;

  String? _proof;
  String? get proof => _$this._proof;
  set proof(String? proof) => _$this._proof = proof;

  RecoveryVerifyCommandNewVerifiedIdentityBuilder? _newVerifiedIdentity;
  RecoveryVerifyCommandNewVerifiedIdentityBuilder get newVerifiedIdentity =>
      _$this._newVerifiedIdentity ??=
          RecoveryVerifyCommandNewVerifiedIdentityBuilder();
  set newVerifiedIdentity(
    RecoveryVerifyCommandNewVerifiedIdentityBuilder? newVerifiedIdentity,
  ) => _$this._newVerifiedIdentity = newVerifiedIdentity;

  RecoveryVerifyCommandBuilder() {
    RecoveryVerifyCommand._defaults(this);
  }

  RecoveryVerifyCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _verificationReference = $v.verificationReference;
      _proof = $v.proof;
      _newVerifiedIdentity = $v.newVerifiedIdentity?.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(RecoveryVerifyCommand other) {
    _$v = other as _$RecoveryVerifyCommand;
  }

  @override
  void update(void Function(RecoveryVerifyCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  RecoveryVerifyCommand build() => _build();

  _$RecoveryVerifyCommand _build() {
    _$RecoveryVerifyCommand _$result;
    try {
      _$result =
          _$v ??
          _$RecoveryVerifyCommand._(
            verificationReference: BuiltValueNullFieldError.checkNotNull(
              verificationReference,
              r'RecoveryVerifyCommand',
              'verificationReference',
            ),
            proof: BuiltValueNullFieldError.checkNotNull(
              proof,
              r'RecoveryVerifyCommand',
              'proof',
            ),
            newVerifiedIdentity: _newVerifiedIdentity?.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'newVerifiedIdentity';
        _newVerifiedIdentity?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'RecoveryVerifyCommand',
          _$failedField,
          e.toString(),
        );
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
