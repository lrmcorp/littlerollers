// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'correction_decision_result.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CorrectionDecisionResult extends CorrectionDecisionResult {
  @override
  final Correction correction;
  @override
  final String? journalReferenceId;
  @override
  final String auditLogId;
  @override
  final bool idempotentReplay;

  factory _$CorrectionDecisionResult([
    void Function(CorrectionDecisionResultBuilder)? updates,
  ]) => (CorrectionDecisionResultBuilder()..update(updates))._build();

  _$CorrectionDecisionResult._({
    required this.correction,
    this.journalReferenceId,
    required this.auditLogId,
    required this.idempotentReplay,
  }) : super._();
  @override
  CorrectionDecisionResult rebuild(
    void Function(CorrectionDecisionResultBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  CorrectionDecisionResultBuilder toBuilder() =>
      CorrectionDecisionResultBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CorrectionDecisionResult &&
        correction == other.correction &&
        journalReferenceId == other.journalReferenceId &&
        auditLogId == other.auditLogId &&
        idempotentReplay == other.idempotentReplay;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, correction.hashCode);
    _$hash = $jc(_$hash, journalReferenceId.hashCode);
    _$hash = $jc(_$hash, auditLogId.hashCode);
    _$hash = $jc(_$hash, idempotentReplay.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CorrectionDecisionResult')
          ..add('correction', correction)
          ..add('journalReferenceId', journalReferenceId)
          ..add('auditLogId', auditLogId)
          ..add('idempotentReplay', idempotentReplay))
        .toString();
  }
}

class CorrectionDecisionResultBuilder
    implements
        Builder<CorrectionDecisionResult, CorrectionDecisionResultBuilder> {
  _$CorrectionDecisionResult? _$v;

  CorrectionBuilder? _correction;
  CorrectionBuilder get correction =>
      _$this._correction ??= CorrectionBuilder();
  set correction(CorrectionBuilder? correction) =>
      _$this._correction = correction;

  String? _journalReferenceId;
  String? get journalReferenceId => _$this._journalReferenceId;
  set journalReferenceId(String? journalReferenceId) =>
      _$this._journalReferenceId = journalReferenceId;

  String? _auditLogId;
  String? get auditLogId => _$this._auditLogId;
  set auditLogId(String? auditLogId) => _$this._auditLogId = auditLogId;

  bool? _idempotentReplay;
  bool? get idempotentReplay => _$this._idempotentReplay;
  set idempotentReplay(bool? idempotentReplay) =>
      _$this._idempotentReplay = idempotentReplay;

  CorrectionDecisionResultBuilder() {
    CorrectionDecisionResult._defaults(this);
  }

  CorrectionDecisionResultBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _correction = $v.correction.toBuilder();
      _journalReferenceId = $v.journalReferenceId;
      _auditLogId = $v.auditLogId;
      _idempotentReplay = $v.idempotentReplay;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CorrectionDecisionResult other) {
    _$v = other as _$CorrectionDecisionResult;
  }

  @override
  void update(void Function(CorrectionDecisionResultBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CorrectionDecisionResult build() => _build();

  _$CorrectionDecisionResult _build() {
    _$CorrectionDecisionResult _$result;
    try {
      _$result =
          _$v ??
          _$CorrectionDecisionResult._(
            correction: correction.build(),
            journalReferenceId: journalReferenceId,
            auditLogId: BuiltValueNullFieldError.checkNotNull(
              auditLogId,
              r'CorrectionDecisionResult',
              'auditLogId',
            ),
            idempotentReplay: BuiltValueNullFieldError.checkNotNull(
              idempotentReplay,
              r'CorrectionDecisionResult',
              'idempotentReplay',
            ),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'correction';
        correction.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'CorrectionDecisionResult',
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
