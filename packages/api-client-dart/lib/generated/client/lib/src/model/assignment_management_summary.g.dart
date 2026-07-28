// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'assignment_management_summary.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AssignmentManagementSummary extends AssignmentManagementSummary {
  @override
  final int total;
  @override
  final int active;
  @override
  final int ended;

  factory _$AssignmentManagementSummary([
    void Function(AssignmentManagementSummaryBuilder)? updates,
  ]) => (AssignmentManagementSummaryBuilder()..update(updates))._build();

  _$AssignmentManagementSummary._({
    required this.total,
    required this.active,
    required this.ended,
  }) : super._();
  @override
  AssignmentManagementSummary rebuild(
    void Function(AssignmentManagementSummaryBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  AssignmentManagementSummaryBuilder toBuilder() =>
      AssignmentManagementSummaryBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AssignmentManagementSummary &&
        total == other.total &&
        active == other.active &&
        ended == other.ended;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, total.hashCode);
    _$hash = $jc(_$hash, active.hashCode);
    _$hash = $jc(_$hash, ended.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AssignmentManagementSummary')
          ..add('total', total)
          ..add('active', active)
          ..add('ended', ended))
        .toString();
  }
}

class AssignmentManagementSummaryBuilder
    implements
        Builder<
          AssignmentManagementSummary,
          AssignmentManagementSummaryBuilder
        > {
  _$AssignmentManagementSummary? _$v;

  int? _total;
  int? get total => _$this._total;
  set total(int? total) => _$this._total = total;

  int? _active;
  int? get active => _$this._active;
  set active(int? active) => _$this._active = active;

  int? _ended;
  int? get ended => _$this._ended;
  set ended(int? ended) => _$this._ended = ended;

  AssignmentManagementSummaryBuilder() {
    AssignmentManagementSummary._defaults(this);
  }

  AssignmentManagementSummaryBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _total = $v.total;
      _active = $v.active;
      _ended = $v.ended;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AssignmentManagementSummary other) {
    _$v = other as _$AssignmentManagementSummary;
  }

  @override
  void update(void Function(AssignmentManagementSummaryBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AssignmentManagementSummary build() => _build();

  _$AssignmentManagementSummary _build() {
    final _$result =
        _$v ??
        _$AssignmentManagementSummary._(
          total: BuiltValueNullFieldError.checkNotNull(
            total,
            r'AssignmentManagementSummary',
            'total',
          ),
          active: BuiltValueNullFieldError.checkNotNull(
            active,
            r'AssignmentManagementSummary',
            'active',
          ),
          ended: BuiltValueNullFieldError.checkNotNull(
            ended,
            r'AssignmentManagementSummary',
            'ended',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
