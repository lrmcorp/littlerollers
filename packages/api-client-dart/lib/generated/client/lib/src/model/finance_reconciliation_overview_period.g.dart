// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'finance_reconciliation_overview_period.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$FinanceReconciliationOverviewPeriod
    extends FinanceReconciliationOverviewPeriod {
  @override
  final DateTime from;
  @override
  final DateTime until;

  factory _$FinanceReconciliationOverviewPeriod([
    void Function(FinanceReconciliationOverviewPeriodBuilder)? updates,
  ]) =>
      (FinanceReconciliationOverviewPeriodBuilder()..update(updates))._build();

  _$FinanceReconciliationOverviewPeriod._({
    required this.from,
    required this.until,
  }) : super._();
  @override
  FinanceReconciliationOverviewPeriod rebuild(
    void Function(FinanceReconciliationOverviewPeriodBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  FinanceReconciliationOverviewPeriodBuilder toBuilder() =>
      FinanceReconciliationOverviewPeriodBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is FinanceReconciliationOverviewPeriod &&
        from == other.from &&
        until == other.until;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, from.hashCode);
    _$hash = $jc(_$hash, until.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'FinanceReconciliationOverviewPeriod')
          ..add('from', from)
          ..add('until', until))
        .toString();
  }
}

class FinanceReconciliationOverviewPeriodBuilder
    implements
        Builder<
          FinanceReconciliationOverviewPeriod,
          FinanceReconciliationOverviewPeriodBuilder
        > {
  _$FinanceReconciliationOverviewPeriod? _$v;

  DateTime? _from;
  DateTime? get from => _$this._from;
  set from(DateTime? from) => _$this._from = from;

  DateTime? _until;
  DateTime? get until => _$this._until;
  set until(DateTime? until) => _$this._until = until;

  FinanceReconciliationOverviewPeriodBuilder() {
    FinanceReconciliationOverviewPeriod._defaults(this);
  }

  FinanceReconciliationOverviewPeriodBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _from = $v.from;
      _until = $v.until;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(FinanceReconciliationOverviewPeriod other) {
    _$v = other as _$FinanceReconciliationOverviewPeriod;
  }

  @override
  void update(
    void Function(FinanceReconciliationOverviewPeriodBuilder)? updates,
  ) {
    if (updates != null) updates(this);
  }

  @override
  FinanceReconciliationOverviewPeriod build() => _build();

  _$FinanceReconciliationOverviewPeriod _build() {
    final _$result =
        _$v ??
        _$FinanceReconciliationOverviewPeriod._(
          from: BuiltValueNullFieldError.checkNotNull(
            from,
            r'FinanceReconciliationOverviewPeriod',
            'from',
          ),
          until: BuiltValueNullFieldError.checkNotNull(
            until,
            r'FinanceReconciliationOverviewPeriod',
            'until',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
