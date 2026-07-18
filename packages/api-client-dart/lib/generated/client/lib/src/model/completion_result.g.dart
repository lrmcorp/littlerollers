// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'completion_result.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CompletionResult extends CompletionResult {
  @override
  final String classSlotId;
  @override
  final JsonObject? status;
  @override
  final int attendanceCount;
  @override
  final int? noShowCount;
  @override
  final BuiltList<String>? releasedReservationIds;
  @override
  final BuiltList<String> ledgerEntryIds;
  @override
  final BuiltList<String> hourLogIds;
  @override
  final String? auditLogId;
  @override
  final BuiltList<String> outboxEventIds;
  @override
  final DateTime completedAt;
  @override
  final bool idempotentReplay;

  factory _$CompletionResult([
    void Function(CompletionResultBuilder)? updates,
  ]) => (CompletionResultBuilder()..update(updates))._build();

  _$CompletionResult._({
    required this.classSlotId,
    this.status,
    required this.attendanceCount,
    this.noShowCount,
    this.releasedReservationIds,
    required this.ledgerEntryIds,
    required this.hourLogIds,
    this.auditLogId,
    required this.outboxEventIds,
    required this.completedAt,
    required this.idempotentReplay,
  }) : super._();
  @override
  CompletionResult rebuild(void Function(CompletionResultBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  CompletionResultBuilder toBuilder() =>
      CompletionResultBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CompletionResult &&
        classSlotId == other.classSlotId &&
        status == other.status &&
        attendanceCount == other.attendanceCount &&
        noShowCount == other.noShowCount &&
        releasedReservationIds == other.releasedReservationIds &&
        ledgerEntryIds == other.ledgerEntryIds &&
        hourLogIds == other.hourLogIds &&
        auditLogId == other.auditLogId &&
        outboxEventIds == other.outboxEventIds &&
        completedAt == other.completedAt &&
        idempotentReplay == other.idempotentReplay;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, classSlotId.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, attendanceCount.hashCode);
    _$hash = $jc(_$hash, noShowCount.hashCode);
    _$hash = $jc(_$hash, releasedReservationIds.hashCode);
    _$hash = $jc(_$hash, ledgerEntryIds.hashCode);
    _$hash = $jc(_$hash, hourLogIds.hashCode);
    _$hash = $jc(_$hash, auditLogId.hashCode);
    _$hash = $jc(_$hash, outboxEventIds.hashCode);
    _$hash = $jc(_$hash, completedAt.hashCode);
    _$hash = $jc(_$hash, idempotentReplay.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CompletionResult')
          ..add('classSlotId', classSlotId)
          ..add('status', status)
          ..add('attendanceCount', attendanceCount)
          ..add('noShowCount', noShowCount)
          ..add('releasedReservationIds', releasedReservationIds)
          ..add('ledgerEntryIds', ledgerEntryIds)
          ..add('hourLogIds', hourLogIds)
          ..add('auditLogId', auditLogId)
          ..add('outboxEventIds', outboxEventIds)
          ..add('completedAt', completedAt)
          ..add('idempotentReplay', idempotentReplay))
        .toString();
  }
}

class CompletionResultBuilder
    implements Builder<CompletionResult, CompletionResultBuilder> {
  _$CompletionResult? _$v;

  String? _classSlotId;
  String? get classSlotId => _$this._classSlotId;
  set classSlotId(String? classSlotId) => _$this._classSlotId = classSlotId;

  JsonObject? _status;
  JsonObject? get status => _$this._status;
  set status(JsonObject? status) => _$this._status = status;

  int? _attendanceCount;
  int? get attendanceCount => _$this._attendanceCount;
  set attendanceCount(int? attendanceCount) =>
      _$this._attendanceCount = attendanceCount;

  int? _noShowCount;
  int? get noShowCount => _$this._noShowCount;
  set noShowCount(int? noShowCount) => _$this._noShowCount = noShowCount;

  ListBuilder<String>? _releasedReservationIds;
  ListBuilder<String> get releasedReservationIds =>
      _$this._releasedReservationIds ??= ListBuilder<String>();
  set releasedReservationIds(ListBuilder<String>? releasedReservationIds) =>
      _$this._releasedReservationIds = releasedReservationIds;

  ListBuilder<String>? _ledgerEntryIds;
  ListBuilder<String> get ledgerEntryIds =>
      _$this._ledgerEntryIds ??= ListBuilder<String>();
  set ledgerEntryIds(ListBuilder<String>? ledgerEntryIds) =>
      _$this._ledgerEntryIds = ledgerEntryIds;

  ListBuilder<String>? _hourLogIds;
  ListBuilder<String> get hourLogIds =>
      _$this._hourLogIds ??= ListBuilder<String>();
  set hourLogIds(ListBuilder<String>? hourLogIds) =>
      _$this._hourLogIds = hourLogIds;

  String? _auditLogId;
  String? get auditLogId => _$this._auditLogId;
  set auditLogId(String? auditLogId) => _$this._auditLogId = auditLogId;

  ListBuilder<String>? _outboxEventIds;
  ListBuilder<String> get outboxEventIds =>
      _$this._outboxEventIds ??= ListBuilder<String>();
  set outboxEventIds(ListBuilder<String>? outboxEventIds) =>
      _$this._outboxEventIds = outboxEventIds;

  DateTime? _completedAt;
  DateTime? get completedAt => _$this._completedAt;
  set completedAt(DateTime? completedAt) => _$this._completedAt = completedAt;

  bool? _idempotentReplay;
  bool? get idempotentReplay => _$this._idempotentReplay;
  set idempotentReplay(bool? idempotentReplay) =>
      _$this._idempotentReplay = idempotentReplay;

  CompletionResultBuilder() {
    CompletionResult._defaults(this);
  }

  CompletionResultBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _classSlotId = $v.classSlotId;
      _status = $v.status;
      _attendanceCount = $v.attendanceCount;
      _noShowCount = $v.noShowCount;
      _releasedReservationIds = $v.releasedReservationIds?.toBuilder();
      _ledgerEntryIds = $v.ledgerEntryIds.toBuilder();
      _hourLogIds = $v.hourLogIds.toBuilder();
      _auditLogId = $v.auditLogId;
      _outboxEventIds = $v.outboxEventIds.toBuilder();
      _completedAt = $v.completedAt;
      _idempotentReplay = $v.idempotentReplay;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CompletionResult other) {
    _$v = other as _$CompletionResult;
  }

  @override
  void update(void Function(CompletionResultBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CompletionResult build() => _build();

  _$CompletionResult _build() {
    _$CompletionResult _$result;
    try {
      _$result =
          _$v ??
          _$CompletionResult._(
            classSlotId: BuiltValueNullFieldError.checkNotNull(
              classSlotId,
              r'CompletionResult',
              'classSlotId',
            ),
            status: status,
            attendanceCount: BuiltValueNullFieldError.checkNotNull(
              attendanceCount,
              r'CompletionResult',
              'attendanceCount',
            ),
            noShowCount: noShowCount,
            releasedReservationIds: _releasedReservationIds?.build(),
            ledgerEntryIds: ledgerEntryIds.build(),
            hourLogIds: hourLogIds.build(),
            auditLogId: auditLogId,
            outboxEventIds: outboxEventIds.build(),
            completedAt: BuiltValueNullFieldError.checkNotNull(
              completedAt,
              r'CompletionResult',
              'completedAt',
            ),
            idempotentReplay: BuiltValueNullFieldError.checkNotNull(
              idempotentReplay,
              r'CompletionResult',
              'idempotentReplay',
            ),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'releasedReservationIds';
        _releasedReservationIds?.build();
        _$failedField = 'ledgerEntryIds';
        ledgerEntryIds.build();
        _$failedField = 'hourLogIds';
        hourLogIds.build();

        _$failedField = 'outboxEventIds';
        outboxEventIds.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'CompletionResult',
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
