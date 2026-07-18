// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'challenge_accepted.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ChallengeAccepted extends ChallengeAccepted {
  @override
  final String requestId;
  @override
  final DateTime expiresAt;

  factory _$ChallengeAccepted([
    void Function(ChallengeAcceptedBuilder)? updates,
  ]) => (ChallengeAcceptedBuilder()..update(updates))._build();

  _$ChallengeAccepted._({required this.requestId, required this.expiresAt})
    : super._();
  @override
  ChallengeAccepted rebuild(void Function(ChallengeAcceptedBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  ChallengeAcceptedBuilder toBuilder() =>
      ChallengeAcceptedBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ChallengeAccepted &&
        requestId == other.requestId &&
        expiresAt == other.expiresAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, requestId.hashCode);
    _$hash = $jc(_$hash, expiresAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ChallengeAccepted')
          ..add('requestId', requestId)
          ..add('expiresAt', expiresAt))
        .toString();
  }
}

class ChallengeAcceptedBuilder
    implements Builder<ChallengeAccepted, ChallengeAcceptedBuilder> {
  _$ChallengeAccepted? _$v;

  String? _requestId;
  String? get requestId => _$this._requestId;
  set requestId(String? requestId) => _$this._requestId = requestId;

  DateTime? _expiresAt;
  DateTime? get expiresAt => _$this._expiresAt;
  set expiresAt(DateTime? expiresAt) => _$this._expiresAt = expiresAt;

  ChallengeAcceptedBuilder() {
    ChallengeAccepted._defaults(this);
  }

  ChallengeAcceptedBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _requestId = $v.requestId;
      _expiresAt = $v.expiresAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ChallengeAccepted other) {
    _$v = other as _$ChallengeAccepted;
  }

  @override
  void update(void Function(ChallengeAcceptedBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ChallengeAccepted build() => _build();

  _$ChallengeAccepted _build() {
    final _$result =
        _$v ??
        _$ChallengeAccepted._(
          requestId: BuiltValueNullFieldError.checkNotNull(
            requestId,
            r'ChallengeAccepted',
            'requestId',
          ),
          expiresAt: BuiltValueNullFieldError.checkNotNull(
            expiresAt,
            r'ChallengeAccepted',
            'expiresAt',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
