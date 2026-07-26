// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'challenge_expiry.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ChallengeExpiry extends ChallengeExpiry {
  @override
  final DateTime expiresAt;

  factory _$ChallengeExpiry([void Function(ChallengeExpiryBuilder)? updates]) =>
      (ChallengeExpiryBuilder()..update(updates))._build();

  _$ChallengeExpiry._({required this.expiresAt}) : super._();
  @override
  ChallengeExpiry rebuild(void Function(ChallengeExpiryBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  ChallengeExpiryBuilder toBuilder() => ChallengeExpiryBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ChallengeExpiry && expiresAt == other.expiresAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, expiresAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(
      r'ChallengeExpiry',
    )..add('expiresAt', expiresAt)).toString();
  }
}

class ChallengeExpiryBuilder
    implements Builder<ChallengeExpiry, ChallengeExpiryBuilder> {
  _$ChallengeExpiry? _$v;

  DateTime? _expiresAt;
  DateTime? get expiresAt => _$this._expiresAt;
  set expiresAt(DateTime? expiresAt) => _$this._expiresAt = expiresAt;

  ChallengeExpiryBuilder() {
    ChallengeExpiry._defaults(this);
  }

  ChallengeExpiryBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _expiresAt = $v.expiresAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ChallengeExpiry other) {
    _$v = other as _$ChallengeExpiry;
  }

  @override
  void update(void Function(ChallengeExpiryBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ChallengeExpiry build() => _build();

  _$ChallengeExpiry _build() {
    final _$result =
        _$v ??
        _$ChallengeExpiry._(
          expiresAt: BuiltValueNullFieldError.checkNotNull(
            expiresAt,
            r'ChallengeExpiry',
            'expiresAt',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
