// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'close_result.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CloseResult extends CloseResult {
  @override
  final BranchPeriod period;
  @override
  final BuiltList<String> snapshotIds;
  @override
  final String auditLogId;
  @override
  final DateTime closedAt;
  @override
  final bool idempotentReplay;

  factory _$CloseResult([void Function(CloseResultBuilder)? updates]) =>
      (CloseResultBuilder()..update(updates))._build();

  _$CloseResult._({
    required this.period,
    required this.snapshotIds,
    required this.auditLogId,
    required this.closedAt,
    required this.idempotentReplay,
  }) : super._();
  @override
  CloseResult rebuild(void Function(CloseResultBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  CloseResultBuilder toBuilder() => CloseResultBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CloseResult &&
        period == other.period &&
        snapshotIds == other.snapshotIds &&
        auditLogId == other.auditLogId &&
        closedAt == other.closedAt &&
        idempotentReplay == other.idempotentReplay;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, period.hashCode);
    _$hash = $jc(_$hash, snapshotIds.hashCode);
    _$hash = $jc(_$hash, auditLogId.hashCode);
    _$hash = $jc(_$hash, closedAt.hashCode);
    _$hash = $jc(_$hash, idempotentReplay.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CloseResult')
          ..add('period', period)
          ..add('snapshotIds', snapshotIds)
          ..add('auditLogId', auditLogId)
          ..add('closedAt', closedAt)
          ..add('idempotentReplay', idempotentReplay))
        .toString();
  }
}

class CloseResultBuilder implements Builder<CloseResult, CloseResultBuilder> {
  _$CloseResult? _$v;

  BranchPeriodBuilder? _period;
  BranchPeriodBuilder get period => _$this._period ??= BranchPeriodBuilder();
  set period(BranchPeriodBuilder? period) => _$this._period = period;

  ListBuilder<String>? _snapshotIds;
  ListBuilder<String> get snapshotIds =>
      _$this._snapshotIds ??= ListBuilder<String>();
  set snapshotIds(ListBuilder<String>? snapshotIds) =>
      _$this._snapshotIds = snapshotIds;

  String? _auditLogId;
  String? get auditLogId => _$this._auditLogId;
  set auditLogId(String? auditLogId) => _$this._auditLogId = auditLogId;

  DateTime? _closedAt;
  DateTime? get closedAt => _$this._closedAt;
  set closedAt(DateTime? closedAt) => _$this._closedAt = closedAt;

  bool? _idempotentReplay;
  bool? get idempotentReplay => _$this._idempotentReplay;
  set idempotentReplay(bool? idempotentReplay) =>
      _$this._idempotentReplay = idempotentReplay;

  CloseResultBuilder() {
    CloseResult._defaults(this);
  }

  CloseResultBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _period = $v.period.toBuilder();
      _snapshotIds = $v.snapshotIds.toBuilder();
      _auditLogId = $v.auditLogId;
      _closedAt = $v.closedAt;
      _idempotentReplay = $v.idempotentReplay;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CloseResult other) {
    _$v = other as _$CloseResult;
  }

  @override
  void update(void Function(CloseResultBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CloseResult build() => _build();

  _$CloseResult _build() {
    _$CloseResult _$result;
    try {
      _$result =
          _$v ??
          _$CloseResult._(
            period: period.build(),
            snapshotIds: snapshotIds.build(),
            auditLogId: BuiltValueNullFieldError.checkNotNull(
              auditLogId,
              r'CloseResult',
              'auditLogId',
            ),
            closedAt: BuiltValueNullFieldError.checkNotNull(
              closedAt,
              r'CloseResult',
              'closedAt',
            ),
            idempotentReplay: BuiltValueNullFieldError.checkNotNull(
              idempotentReplay,
              r'CloseResult',
              'idempotentReplay',
            ),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'period';
        period.build();
        _$failedField = 'snapshotIds';
        snapshotIds.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'CloseResult',
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
