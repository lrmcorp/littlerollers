// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'branch_management_summary.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$BranchManagementSummary extends BranchManagementSummary {
  @override
  final int total;
  @override
  final int active;
  @override
  final int inactive;

  factory _$BranchManagementSummary([
    void Function(BranchManagementSummaryBuilder)? updates,
  ]) => (BranchManagementSummaryBuilder()..update(updates))._build();

  _$BranchManagementSummary._({
    required this.total,
    required this.active,
    required this.inactive,
  }) : super._();
  @override
  BranchManagementSummary rebuild(
    void Function(BranchManagementSummaryBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  BranchManagementSummaryBuilder toBuilder() =>
      BranchManagementSummaryBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is BranchManagementSummary &&
        total == other.total &&
        active == other.active &&
        inactive == other.inactive;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, total.hashCode);
    _$hash = $jc(_$hash, active.hashCode);
    _$hash = $jc(_$hash, inactive.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'BranchManagementSummary')
          ..add('total', total)
          ..add('active', active)
          ..add('inactive', inactive))
        .toString();
  }
}

class BranchManagementSummaryBuilder
    implements
        Builder<BranchManagementSummary, BranchManagementSummaryBuilder> {
  _$BranchManagementSummary? _$v;

  int? _total;
  int? get total => _$this._total;
  set total(int? total) => _$this._total = total;

  int? _active;
  int? get active => _$this._active;
  set active(int? active) => _$this._active = active;

  int? _inactive;
  int? get inactive => _$this._inactive;
  set inactive(int? inactive) => _$this._inactive = inactive;

  BranchManagementSummaryBuilder() {
    BranchManagementSummary._defaults(this);
  }

  BranchManagementSummaryBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _total = $v.total;
      _active = $v.active;
      _inactive = $v.inactive;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(BranchManagementSummary other) {
    _$v = other as _$BranchManagementSummary;
  }

  @override
  void update(void Function(BranchManagementSummaryBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  BranchManagementSummary build() => _build();

  _$BranchManagementSummary _build() {
    final _$result =
        _$v ??
        _$BranchManagementSummary._(
          total: BuiltValueNullFieldError.checkNotNull(
            total,
            r'BranchManagementSummary',
            'total',
          ),
          active: BuiltValueNullFieldError.checkNotNull(
            active,
            r'BranchManagementSummary',
            'active',
          ),
          inactive: BuiltValueNullFieldError.checkNotNull(
            inactive,
            r'BranchManagementSummary',
            'inactive',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
