// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'finance_reconciliation_overview.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$FinanceReconciliationOverview extends FinanceReconciliationOverview {
  @override
  final DateTime generatedAt;
  @override
  final FinanceReconciliationOverviewPeriod period;
  @override
  final FinanceReconciliationMetric metrics;
  @override
  final BuiltList<FinanceBranchReconciliation> branches;

  factory _$FinanceReconciliationOverview([
    void Function(FinanceReconciliationOverviewBuilder)? updates,
  ]) => (FinanceReconciliationOverviewBuilder()..update(updates))._build();

  _$FinanceReconciliationOverview._({
    required this.generatedAt,
    required this.period,
    required this.metrics,
    required this.branches,
  }) : super._();
  @override
  FinanceReconciliationOverview rebuild(
    void Function(FinanceReconciliationOverviewBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  FinanceReconciliationOverviewBuilder toBuilder() =>
      FinanceReconciliationOverviewBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is FinanceReconciliationOverview &&
        generatedAt == other.generatedAt &&
        period == other.period &&
        metrics == other.metrics &&
        branches == other.branches;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, generatedAt.hashCode);
    _$hash = $jc(_$hash, period.hashCode);
    _$hash = $jc(_$hash, metrics.hashCode);
    _$hash = $jc(_$hash, branches.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'FinanceReconciliationOverview')
          ..add('generatedAt', generatedAt)
          ..add('period', period)
          ..add('metrics', metrics)
          ..add('branches', branches))
        .toString();
  }
}

class FinanceReconciliationOverviewBuilder
    implements
        Builder<
          FinanceReconciliationOverview,
          FinanceReconciliationOverviewBuilder
        > {
  _$FinanceReconciliationOverview? _$v;

  DateTime? _generatedAt;
  DateTime? get generatedAt => _$this._generatedAt;
  set generatedAt(DateTime? generatedAt) => _$this._generatedAt = generatedAt;

  FinanceReconciliationOverviewPeriodBuilder? _period;
  FinanceReconciliationOverviewPeriodBuilder get period =>
      _$this._period ??= FinanceReconciliationOverviewPeriodBuilder();
  set period(FinanceReconciliationOverviewPeriodBuilder? period) =>
      _$this._period = period;

  FinanceReconciliationMetricBuilder? _metrics;
  FinanceReconciliationMetricBuilder get metrics =>
      _$this._metrics ??= FinanceReconciliationMetricBuilder();
  set metrics(FinanceReconciliationMetricBuilder? metrics) =>
      _$this._metrics = metrics;

  ListBuilder<FinanceBranchReconciliation>? _branches;
  ListBuilder<FinanceBranchReconciliation> get branches =>
      _$this._branches ??= ListBuilder<FinanceBranchReconciliation>();
  set branches(ListBuilder<FinanceBranchReconciliation>? branches) =>
      _$this._branches = branches;

  FinanceReconciliationOverviewBuilder() {
    FinanceReconciliationOverview._defaults(this);
  }

  FinanceReconciliationOverviewBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _generatedAt = $v.generatedAt;
      _period = $v.period.toBuilder();
      _metrics = $v.metrics.toBuilder();
      _branches = $v.branches.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(FinanceReconciliationOverview other) {
    _$v = other as _$FinanceReconciliationOverview;
  }

  @override
  void update(void Function(FinanceReconciliationOverviewBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  FinanceReconciliationOverview build() => _build();

  _$FinanceReconciliationOverview _build() {
    _$FinanceReconciliationOverview _$result;
    try {
      _$result =
          _$v ??
          _$FinanceReconciliationOverview._(
            generatedAt: BuiltValueNullFieldError.checkNotNull(
              generatedAt,
              r'FinanceReconciliationOverview',
              'generatedAt',
            ),
            period: period.build(),
            metrics: metrics.build(),
            branches: branches.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'period';
        period.build();
        _$failedField = 'metrics';
        metrics.build();
        _$failedField = 'branches';
        branches.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'FinanceReconciliationOverview',
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
