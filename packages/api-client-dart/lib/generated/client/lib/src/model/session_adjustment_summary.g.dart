// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'session_adjustment_summary.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$SessionAdjustmentSummary extends SessionAdjustmentSummary {
  @override
  final int total;
  @override
  final int pending;
  @override
  final int posted;
  @override
  final int rejected;

  factory _$SessionAdjustmentSummary([
    void Function(SessionAdjustmentSummaryBuilder)? updates,
  ]) => (SessionAdjustmentSummaryBuilder()..update(updates))._build();

  _$SessionAdjustmentSummary._({
    required this.total,
    required this.pending,
    required this.posted,
    required this.rejected,
  }) : super._();
  @override
  SessionAdjustmentSummary rebuild(
    void Function(SessionAdjustmentSummaryBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  SessionAdjustmentSummaryBuilder toBuilder() =>
      SessionAdjustmentSummaryBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is SessionAdjustmentSummary &&
        total == other.total &&
        pending == other.pending &&
        posted == other.posted &&
        rejected == other.rejected;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, total.hashCode);
    _$hash = $jc(_$hash, pending.hashCode);
    _$hash = $jc(_$hash, posted.hashCode);
    _$hash = $jc(_$hash, rejected.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'SessionAdjustmentSummary')
          ..add('total', total)
          ..add('pending', pending)
          ..add('posted', posted)
          ..add('rejected', rejected))
        .toString();
  }
}

class SessionAdjustmentSummaryBuilder
    implements
        Builder<SessionAdjustmentSummary, SessionAdjustmentSummaryBuilder> {
  _$SessionAdjustmentSummary? _$v;

  int? _total;
  int? get total => _$this._total;
  set total(int? total) => _$this._total = total;

  int? _pending;
  int? get pending => _$this._pending;
  set pending(int? pending) => _$this._pending = pending;

  int? _posted;
  int? get posted => _$this._posted;
  set posted(int? posted) => _$this._posted = posted;

  int? _rejected;
  int? get rejected => _$this._rejected;
  set rejected(int? rejected) => _$this._rejected = rejected;

  SessionAdjustmentSummaryBuilder() {
    SessionAdjustmentSummary._defaults(this);
  }

  SessionAdjustmentSummaryBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _total = $v.total;
      _pending = $v.pending;
      _posted = $v.posted;
      _rejected = $v.rejected;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(SessionAdjustmentSummary other) {
    _$v = other as _$SessionAdjustmentSummary;
  }

  @override
  void update(void Function(SessionAdjustmentSummaryBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  SessionAdjustmentSummary build() => _build();

  _$SessionAdjustmentSummary _build() {
    final _$result =
        _$v ??
        _$SessionAdjustmentSummary._(
          total: BuiltValueNullFieldError.checkNotNull(
            total,
            r'SessionAdjustmentSummary',
            'total',
          ),
          pending: BuiltValueNullFieldError.checkNotNull(
            pending,
            r'SessionAdjustmentSummary',
            'pending',
          ),
          posted: BuiltValueNullFieldError.checkNotNull(
            posted,
            r'SessionAdjustmentSummary',
            'posted',
          ),
          rejected: BuiltValueNullFieldError.checkNotNull(
            rejected,
            r'SessionAdjustmentSummary',
            'rejected',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
