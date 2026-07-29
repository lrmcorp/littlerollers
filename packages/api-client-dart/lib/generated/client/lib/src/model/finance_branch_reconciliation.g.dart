// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'finance_branch_reconciliation.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$FinanceBranchReconciliation extends FinanceBranchReconciliation {
  @override
  final String id;
  @override
  final String code;
  @override
  final String name;
  @override
  final int expectedRp;
  @override
  final int receivedRp;
  @override
  final int approvedRp;
  @override
  final int identificationAmountRp;
  @override
  final int grossSalesRp;
  @override
  final int packagePromotionDiscountRp;
  @override
  final int voucherDiscountRp;
  @override
  final int netSalesRp;
  @override
  final int voucherRedemptionCount;
  @override
  final int pendingCount;
  @override
  final int anomalyCount;

  factory _$FinanceBranchReconciliation([
    void Function(FinanceBranchReconciliationBuilder)? updates,
  ]) => (FinanceBranchReconciliationBuilder()..update(updates))._build();

  _$FinanceBranchReconciliation._({
    required this.id,
    required this.code,
    required this.name,
    required this.expectedRp,
    required this.receivedRp,
    required this.approvedRp,
    required this.identificationAmountRp,
    required this.grossSalesRp,
    required this.packagePromotionDiscountRp,
    required this.voucherDiscountRp,
    required this.netSalesRp,
    required this.voucherRedemptionCount,
    required this.pendingCount,
    required this.anomalyCount,
  }) : super._();
  @override
  FinanceBranchReconciliation rebuild(
    void Function(FinanceBranchReconciliationBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  FinanceBranchReconciliationBuilder toBuilder() =>
      FinanceBranchReconciliationBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is FinanceBranchReconciliation &&
        id == other.id &&
        code == other.code &&
        name == other.name &&
        expectedRp == other.expectedRp &&
        receivedRp == other.receivedRp &&
        approvedRp == other.approvedRp &&
        identificationAmountRp == other.identificationAmountRp &&
        grossSalesRp == other.grossSalesRp &&
        packagePromotionDiscountRp == other.packagePromotionDiscountRp &&
        voucherDiscountRp == other.voucherDiscountRp &&
        netSalesRp == other.netSalesRp &&
        voucherRedemptionCount == other.voucherRedemptionCount &&
        pendingCount == other.pendingCount &&
        anomalyCount == other.anomalyCount;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, code.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, expectedRp.hashCode);
    _$hash = $jc(_$hash, receivedRp.hashCode);
    _$hash = $jc(_$hash, approvedRp.hashCode);
    _$hash = $jc(_$hash, identificationAmountRp.hashCode);
    _$hash = $jc(_$hash, grossSalesRp.hashCode);
    _$hash = $jc(_$hash, packagePromotionDiscountRp.hashCode);
    _$hash = $jc(_$hash, voucherDiscountRp.hashCode);
    _$hash = $jc(_$hash, netSalesRp.hashCode);
    _$hash = $jc(_$hash, voucherRedemptionCount.hashCode);
    _$hash = $jc(_$hash, pendingCount.hashCode);
    _$hash = $jc(_$hash, anomalyCount.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'FinanceBranchReconciliation')
          ..add('id', id)
          ..add('code', code)
          ..add('name', name)
          ..add('expectedRp', expectedRp)
          ..add('receivedRp', receivedRp)
          ..add('approvedRp', approvedRp)
          ..add('identificationAmountRp', identificationAmountRp)
          ..add('grossSalesRp', grossSalesRp)
          ..add('packagePromotionDiscountRp', packagePromotionDiscountRp)
          ..add('voucherDiscountRp', voucherDiscountRp)
          ..add('netSalesRp', netSalesRp)
          ..add('voucherRedemptionCount', voucherRedemptionCount)
          ..add('pendingCount', pendingCount)
          ..add('anomalyCount', anomalyCount))
        .toString();
  }
}

class FinanceBranchReconciliationBuilder
    implements
        Builder<
          FinanceBranchReconciliation,
          FinanceBranchReconciliationBuilder
        > {
  _$FinanceBranchReconciliation? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _code;
  String? get code => _$this._code;
  set code(String? code) => _$this._code = code;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  int? _expectedRp;
  int? get expectedRp => _$this._expectedRp;
  set expectedRp(int? expectedRp) => _$this._expectedRp = expectedRp;

  int? _receivedRp;
  int? get receivedRp => _$this._receivedRp;
  set receivedRp(int? receivedRp) => _$this._receivedRp = receivedRp;

  int? _approvedRp;
  int? get approvedRp => _$this._approvedRp;
  set approvedRp(int? approvedRp) => _$this._approvedRp = approvedRp;

  int? _identificationAmountRp;
  int? get identificationAmountRp => _$this._identificationAmountRp;
  set identificationAmountRp(int? identificationAmountRp) =>
      _$this._identificationAmountRp = identificationAmountRp;

  int? _grossSalesRp;
  int? get grossSalesRp => _$this._grossSalesRp;
  set grossSalesRp(int? grossSalesRp) => _$this._grossSalesRp = grossSalesRp;

  int? _packagePromotionDiscountRp;
  int? get packagePromotionDiscountRp => _$this._packagePromotionDiscountRp;
  set packagePromotionDiscountRp(int? packagePromotionDiscountRp) =>
      _$this._packagePromotionDiscountRp = packagePromotionDiscountRp;

  int? _voucherDiscountRp;
  int? get voucherDiscountRp => _$this._voucherDiscountRp;
  set voucherDiscountRp(int? voucherDiscountRp) =>
      _$this._voucherDiscountRp = voucherDiscountRp;

  int? _netSalesRp;
  int? get netSalesRp => _$this._netSalesRp;
  set netSalesRp(int? netSalesRp) => _$this._netSalesRp = netSalesRp;

  int? _voucherRedemptionCount;
  int? get voucherRedemptionCount => _$this._voucherRedemptionCount;
  set voucherRedemptionCount(int? voucherRedemptionCount) =>
      _$this._voucherRedemptionCount = voucherRedemptionCount;

  int? _pendingCount;
  int? get pendingCount => _$this._pendingCount;
  set pendingCount(int? pendingCount) => _$this._pendingCount = pendingCount;

  int? _anomalyCount;
  int? get anomalyCount => _$this._anomalyCount;
  set anomalyCount(int? anomalyCount) => _$this._anomalyCount = anomalyCount;

  FinanceBranchReconciliationBuilder() {
    FinanceBranchReconciliation._defaults(this);
  }

  FinanceBranchReconciliationBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _code = $v.code;
      _name = $v.name;
      _expectedRp = $v.expectedRp;
      _receivedRp = $v.receivedRp;
      _approvedRp = $v.approvedRp;
      _identificationAmountRp = $v.identificationAmountRp;
      _grossSalesRp = $v.grossSalesRp;
      _packagePromotionDiscountRp = $v.packagePromotionDiscountRp;
      _voucherDiscountRp = $v.voucherDiscountRp;
      _netSalesRp = $v.netSalesRp;
      _voucherRedemptionCount = $v.voucherRedemptionCount;
      _pendingCount = $v.pendingCount;
      _anomalyCount = $v.anomalyCount;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(FinanceBranchReconciliation other) {
    _$v = other as _$FinanceBranchReconciliation;
  }

  @override
  void update(void Function(FinanceBranchReconciliationBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  FinanceBranchReconciliation build() => _build();

  _$FinanceBranchReconciliation _build() {
    final _$result =
        _$v ??
        _$FinanceBranchReconciliation._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'FinanceBranchReconciliation',
            'id',
          ),
          code: BuiltValueNullFieldError.checkNotNull(
            code,
            r'FinanceBranchReconciliation',
            'code',
          ),
          name: BuiltValueNullFieldError.checkNotNull(
            name,
            r'FinanceBranchReconciliation',
            'name',
          ),
          expectedRp: BuiltValueNullFieldError.checkNotNull(
            expectedRp,
            r'FinanceBranchReconciliation',
            'expectedRp',
          ),
          receivedRp: BuiltValueNullFieldError.checkNotNull(
            receivedRp,
            r'FinanceBranchReconciliation',
            'receivedRp',
          ),
          approvedRp: BuiltValueNullFieldError.checkNotNull(
            approvedRp,
            r'FinanceBranchReconciliation',
            'approvedRp',
          ),
          identificationAmountRp: BuiltValueNullFieldError.checkNotNull(
            identificationAmountRp,
            r'FinanceBranchReconciliation',
            'identificationAmountRp',
          ),
          grossSalesRp: BuiltValueNullFieldError.checkNotNull(
            grossSalesRp,
            r'FinanceBranchReconciliation',
            'grossSalesRp',
          ),
          packagePromotionDiscountRp: BuiltValueNullFieldError.checkNotNull(
            packagePromotionDiscountRp,
            r'FinanceBranchReconciliation',
            'packagePromotionDiscountRp',
          ),
          voucherDiscountRp: BuiltValueNullFieldError.checkNotNull(
            voucherDiscountRp,
            r'FinanceBranchReconciliation',
            'voucherDiscountRp',
          ),
          netSalesRp: BuiltValueNullFieldError.checkNotNull(
            netSalesRp,
            r'FinanceBranchReconciliation',
            'netSalesRp',
          ),
          voucherRedemptionCount: BuiltValueNullFieldError.checkNotNull(
            voucherRedemptionCount,
            r'FinanceBranchReconciliation',
            'voucherRedemptionCount',
          ),
          pendingCount: BuiltValueNullFieldError.checkNotNull(
            pendingCount,
            r'FinanceBranchReconciliation',
            'pendingCount',
          ),
          anomalyCount: BuiltValueNullFieldError.checkNotNull(
            anomalyCount,
            r'FinanceBranchReconciliation',
            'anomalyCount',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
