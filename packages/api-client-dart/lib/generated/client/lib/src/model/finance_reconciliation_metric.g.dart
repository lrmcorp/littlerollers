// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'finance_reconciliation_metric.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$FinanceReconciliationMetric extends FinanceReconciliationMetric {
  @override
  final int expectedRp;
  @override
  final int receivedRp;
  @override
  final int approvedRp;
  @override
  final int pendingRp;
  @override
  final int rejectedRp;
  @override
  final int identificationAmountRp;
  @override
  final int ledgerDeltaRp;
  @override
  final int unreconciledCount;

  factory _$FinanceReconciliationMetric([
    void Function(FinanceReconciliationMetricBuilder)? updates,
  ]) => (FinanceReconciliationMetricBuilder()..update(updates))._build();

  _$FinanceReconciliationMetric._({
    required this.expectedRp,
    required this.receivedRp,
    required this.approvedRp,
    required this.pendingRp,
    required this.rejectedRp,
    required this.identificationAmountRp,
    required this.ledgerDeltaRp,
    required this.unreconciledCount,
  }) : super._();
  @override
  FinanceReconciliationMetric rebuild(
    void Function(FinanceReconciliationMetricBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  FinanceReconciliationMetricBuilder toBuilder() =>
      FinanceReconciliationMetricBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is FinanceReconciliationMetric &&
        expectedRp == other.expectedRp &&
        receivedRp == other.receivedRp &&
        approvedRp == other.approvedRp &&
        pendingRp == other.pendingRp &&
        rejectedRp == other.rejectedRp &&
        identificationAmountRp == other.identificationAmountRp &&
        ledgerDeltaRp == other.ledgerDeltaRp &&
        unreconciledCount == other.unreconciledCount;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, expectedRp.hashCode);
    _$hash = $jc(_$hash, receivedRp.hashCode);
    _$hash = $jc(_$hash, approvedRp.hashCode);
    _$hash = $jc(_$hash, pendingRp.hashCode);
    _$hash = $jc(_$hash, rejectedRp.hashCode);
    _$hash = $jc(_$hash, identificationAmountRp.hashCode);
    _$hash = $jc(_$hash, ledgerDeltaRp.hashCode);
    _$hash = $jc(_$hash, unreconciledCount.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'FinanceReconciliationMetric')
          ..add('expectedRp', expectedRp)
          ..add('receivedRp', receivedRp)
          ..add('approvedRp', approvedRp)
          ..add('pendingRp', pendingRp)
          ..add('rejectedRp', rejectedRp)
          ..add('identificationAmountRp', identificationAmountRp)
          ..add('ledgerDeltaRp', ledgerDeltaRp)
          ..add('unreconciledCount', unreconciledCount))
        .toString();
  }
}

class FinanceReconciliationMetricBuilder
    implements
        Builder<
          FinanceReconciliationMetric,
          FinanceReconciliationMetricBuilder
        > {
  _$FinanceReconciliationMetric? _$v;

  int? _expectedRp;
  int? get expectedRp => _$this._expectedRp;
  set expectedRp(int? expectedRp) => _$this._expectedRp = expectedRp;

  int? _receivedRp;
  int? get receivedRp => _$this._receivedRp;
  set receivedRp(int? receivedRp) => _$this._receivedRp = receivedRp;

  int? _approvedRp;
  int? get approvedRp => _$this._approvedRp;
  set approvedRp(int? approvedRp) => _$this._approvedRp = approvedRp;

  int? _pendingRp;
  int? get pendingRp => _$this._pendingRp;
  set pendingRp(int? pendingRp) => _$this._pendingRp = pendingRp;

  int? _rejectedRp;
  int? get rejectedRp => _$this._rejectedRp;
  set rejectedRp(int? rejectedRp) => _$this._rejectedRp = rejectedRp;

  int? _identificationAmountRp;
  int? get identificationAmountRp => _$this._identificationAmountRp;
  set identificationAmountRp(int? identificationAmountRp) =>
      _$this._identificationAmountRp = identificationAmountRp;

  int? _ledgerDeltaRp;
  int? get ledgerDeltaRp => _$this._ledgerDeltaRp;
  set ledgerDeltaRp(int? ledgerDeltaRp) =>
      _$this._ledgerDeltaRp = ledgerDeltaRp;

  int? _unreconciledCount;
  int? get unreconciledCount => _$this._unreconciledCount;
  set unreconciledCount(int? unreconciledCount) =>
      _$this._unreconciledCount = unreconciledCount;

  FinanceReconciliationMetricBuilder() {
    FinanceReconciliationMetric._defaults(this);
  }

  FinanceReconciliationMetricBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _expectedRp = $v.expectedRp;
      _receivedRp = $v.receivedRp;
      _approvedRp = $v.approvedRp;
      _pendingRp = $v.pendingRp;
      _rejectedRp = $v.rejectedRp;
      _identificationAmountRp = $v.identificationAmountRp;
      _ledgerDeltaRp = $v.ledgerDeltaRp;
      _unreconciledCount = $v.unreconciledCount;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(FinanceReconciliationMetric other) {
    _$v = other as _$FinanceReconciliationMetric;
  }

  @override
  void update(void Function(FinanceReconciliationMetricBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  FinanceReconciliationMetric build() => _build();

  _$FinanceReconciliationMetric _build() {
    final _$result =
        _$v ??
        _$FinanceReconciliationMetric._(
          expectedRp: BuiltValueNullFieldError.checkNotNull(
            expectedRp,
            r'FinanceReconciliationMetric',
            'expectedRp',
          ),
          receivedRp: BuiltValueNullFieldError.checkNotNull(
            receivedRp,
            r'FinanceReconciliationMetric',
            'receivedRp',
          ),
          approvedRp: BuiltValueNullFieldError.checkNotNull(
            approvedRp,
            r'FinanceReconciliationMetric',
            'approvedRp',
          ),
          pendingRp: BuiltValueNullFieldError.checkNotNull(
            pendingRp,
            r'FinanceReconciliationMetric',
            'pendingRp',
          ),
          rejectedRp: BuiltValueNullFieldError.checkNotNull(
            rejectedRp,
            r'FinanceReconciliationMetric',
            'rejectedRp',
          ),
          identificationAmountRp: BuiltValueNullFieldError.checkNotNull(
            identificationAmountRp,
            r'FinanceReconciliationMetric',
            'identificationAmountRp',
          ),
          ledgerDeltaRp: BuiltValueNullFieldError.checkNotNull(
            ledgerDeltaRp,
            r'FinanceReconciliationMetric',
            'ledgerDeltaRp',
          ),
          unreconciledCount: BuiltValueNullFieldError.checkNotNull(
            unreconciledCount,
            r'FinanceReconciliationMetric',
            'unreconciledCount',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
