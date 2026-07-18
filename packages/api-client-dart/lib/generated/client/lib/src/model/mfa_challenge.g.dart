// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'mfa_challenge.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$MfaChallenge extends MfaChallenge {
  @override
  final String id;
  @override
  final String purpose;
  @override
  final String? methodHint;
  @override
  final DateTime expiresAt;

  factory _$MfaChallenge([void Function(MfaChallengeBuilder)? updates]) =>
      (MfaChallengeBuilder()..update(updates))._build();

  _$MfaChallenge._({
    required this.id,
    required this.purpose,
    this.methodHint,
    required this.expiresAt,
  }) : super._();
  @override
  MfaChallenge rebuild(void Function(MfaChallengeBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  MfaChallengeBuilder toBuilder() => MfaChallengeBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is MfaChallenge &&
        id == other.id &&
        purpose == other.purpose &&
        methodHint == other.methodHint &&
        expiresAt == other.expiresAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, purpose.hashCode);
    _$hash = $jc(_$hash, methodHint.hashCode);
    _$hash = $jc(_$hash, expiresAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'MfaChallenge')
          ..add('id', id)
          ..add('purpose', purpose)
          ..add('methodHint', methodHint)
          ..add('expiresAt', expiresAt))
        .toString();
  }
}

class MfaChallengeBuilder
    implements Builder<MfaChallenge, MfaChallengeBuilder> {
  _$MfaChallenge? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _purpose;
  String? get purpose => _$this._purpose;
  set purpose(String? purpose) => _$this._purpose = purpose;

  String? _methodHint;
  String? get methodHint => _$this._methodHint;
  set methodHint(String? methodHint) => _$this._methodHint = methodHint;

  DateTime? _expiresAt;
  DateTime? get expiresAt => _$this._expiresAt;
  set expiresAt(DateTime? expiresAt) => _$this._expiresAt = expiresAt;

  MfaChallengeBuilder() {
    MfaChallenge._defaults(this);
  }

  MfaChallengeBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _purpose = $v.purpose;
      _methodHint = $v.methodHint;
      _expiresAt = $v.expiresAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(MfaChallenge other) {
    _$v = other as _$MfaChallenge;
  }

  @override
  void update(void Function(MfaChallengeBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  MfaChallenge build() => _build();

  _$MfaChallenge _build() {
    final _$result =
        _$v ??
        _$MfaChallenge._(
          id: BuiltValueNullFieldError.checkNotNull(id, r'MfaChallenge', 'id'),
          purpose: BuiltValueNullFieldError.checkNotNull(
            purpose,
            r'MfaChallenge',
            'purpose',
          ),
          methodHint: methodHint,
          expiresAt: BuiltValueNullFieldError.checkNotNull(
            expiresAt,
            r'MfaChallenge',
            'expiresAt',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
