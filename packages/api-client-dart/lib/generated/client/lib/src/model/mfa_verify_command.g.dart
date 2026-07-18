// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'mfa_verify_command.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$MfaVerifyCommand extends MfaVerifyCommand {
  @override
  final String challengeId;
  @override
  final String proof;

  factory _$MfaVerifyCommand([
    void Function(MfaVerifyCommandBuilder)? updates,
  ]) => (MfaVerifyCommandBuilder()..update(updates))._build();

  _$MfaVerifyCommand._({required this.challengeId, required this.proof})
    : super._();
  @override
  MfaVerifyCommand rebuild(void Function(MfaVerifyCommandBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  MfaVerifyCommandBuilder toBuilder() =>
      MfaVerifyCommandBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is MfaVerifyCommand &&
        challengeId == other.challengeId &&
        proof == other.proof;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, challengeId.hashCode);
    _$hash = $jc(_$hash, proof.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'MfaVerifyCommand')
          ..add('challengeId', challengeId)
          ..add('proof', proof))
        .toString();
  }
}

class MfaVerifyCommandBuilder
    implements Builder<MfaVerifyCommand, MfaVerifyCommandBuilder> {
  _$MfaVerifyCommand? _$v;

  String? _challengeId;
  String? get challengeId => _$this._challengeId;
  set challengeId(String? challengeId) => _$this._challengeId = challengeId;

  String? _proof;
  String? get proof => _$this._proof;
  set proof(String? proof) => _$this._proof = proof;

  MfaVerifyCommandBuilder() {
    MfaVerifyCommand._defaults(this);
  }

  MfaVerifyCommandBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _challengeId = $v.challengeId;
      _proof = $v.proof;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(MfaVerifyCommand other) {
    _$v = other as _$MfaVerifyCommand;
  }

  @override
  void update(void Function(MfaVerifyCommandBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  MfaVerifyCommand build() => _build();

  _$MfaVerifyCommand _build() {
    final _$result =
        _$v ??
        _$MfaVerifyCommand._(
          challengeId: BuiltValueNullFieldError.checkNotNull(
            challengeId,
            r'MfaVerifyCommand',
            'challengeId',
          ),
          proof: BuiltValueNullFieldError.checkNotNull(
            proof,
            r'MfaVerifyCommand',
            'proof',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
