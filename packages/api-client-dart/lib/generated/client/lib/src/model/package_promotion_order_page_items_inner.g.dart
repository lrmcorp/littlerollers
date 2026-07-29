// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'package_promotion_order_page_items_inner.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PackagePromotionOrderPageItemsInner
    extends PackagePromotionOrderPageItemsInner {
  @override
  final String id;
  @override
  final String status;
  @override
  final int? packagePromotionDiscountRpSnapshot;
  @override
  final int? promotionalPriceRpSnapshot;
  @override
  final int? voucherDiscountRpSnapshot;
  @override
  final int? priceAfterDiscountRpSnapshot;
  @override
  final DateTime submittedAt;

  factory _$PackagePromotionOrderPageItemsInner([
    void Function(PackagePromotionOrderPageItemsInnerBuilder)? updates,
  ]) =>
      (PackagePromotionOrderPageItemsInnerBuilder()..update(updates))._build();

  _$PackagePromotionOrderPageItemsInner._({
    required this.id,
    required this.status,
    this.packagePromotionDiscountRpSnapshot,
    this.promotionalPriceRpSnapshot,
    this.voucherDiscountRpSnapshot,
    this.priceAfterDiscountRpSnapshot,
    required this.submittedAt,
  }) : super._();
  @override
  PackagePromotionOrderPageItemsInner rebuild(
    void Function(PackagePromotionOrderPageItemsInnerBuilder) updates,
  ) => (toBuilder()..update(updates)).build();

  @override
  PackagePromotionOrderPageItemsInnerBuilder toBuilder() =>
      PackagePromotionOrderPageItemsInnerBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PackagePromotionOrderPageItemsInner &&
        id == other.id &&
        status == other.status &&
        packagePromotionDiscountRpSnapshot ==
            other.packagePromotionDiscountRpSnapshot &&
        promotionalPriceRpSnapshot == other.promotionalPriceRpSnapshot &&
        voucherDiscountRpSnapshot == other.voucherDiscountRpSnapshot &&
        priceAfterDiscountRpSnapshot == other.priceAfterDiscountRpSnapshot &&
        submittedAt == other.submittedAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, packagePromotionDiscountRpSnapshot.hashCode);
    _$hash = $jc(_$hash, promotionalPriceRpSnapshot.hashCode);
    _$hash = $jc(_$hash, voucherDiscountRpSnapshot.hashCode);
    _$hash = $jc(_$hash, priceAfterDiscountRpSnapshot.hashCode);
    _$hash = $jc(_$hash, submittedAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PackagePromotionOrderPageItemsInner')
          ..add('id', id)
          ..add('status', status)
          ..add(
            'packagePromotionDiscountRpSnapshot',
            packagePromotionDiscountRpSnapshot,
          )
          ..add('promotionalPriceRpSnapshot', promotionalPriceRpSnapshot)
          ..add('voucherDiscountRpSnapshot', voucherDiscountRpSnapshot)
          ..add('priceAfterDiscountRpSnapshot', priceAfterDiscountRpSnapshot)
          ..add('submittedAt', submittedAt))
        .toString();
  }
}

class PackagePromotionOrderPageItemsInnerBuilder
    implements
        Builder<
          PackagePromotionOrderPageItemsInner,
          PackagePromotionOrderPageItemsInnerBuilder
        > {
  _$PackagePromotionOrderPageItemsInner? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _status;
  String? get status => _$this._status;
  set status(String? status) => _$this._status = status;

  int? _packagePromotionDiscountRpSnapshot;
  int? get packagePromotionDiscountRpSnapshot =>
      _$this._packagePromotionDiscountRpSnapshot;
  set packagePromotionDiscountRpSnapshot(
    int? packagePromotionDiscountRpSnapshot,
  ) => _$this._packagePromotionDiscountRpSnapshot =
      packagePromotionDiscountRpSnapshot;

  int? _promotionalPriceRpSnapshot;
  int? get promotionalPriceRpSnapshot => _$this._promotionalPriceRpSnapshot;
  set promotionalPriceRpSnapshot(int? promotionalPriceRpSnapshot) =>
      _$this._promotionalPriceRpSnapshot = promotionalPriceRpSnapshot;

  int? _voucherDiscountRpSnapshot;
  int? get voucherDiscountRpSnapshot => _$this._voucherDiscountRpSnapshot;
  set voucherDiscountRpSnapshot(int? voucherDiscountRpSnapshot) =>
      _$this._voucherDiscountRpSnapshot = voucherDiscountRpSnapshot;

  int? _priceAfterDiscountRpSnapshot;
  int? get priceAfterDiscountRpSnapshot => _$this._priceAfterDiscountRpSnapshot;
  set priceAfterDiscountRpSnapshot(int? priceAfterDiscountRpSnapshot) =>
      _$this._priceAfterDiscountRpSnapshot = priceAfterDiscountRpSnapshot;

  DateTime? _submittedAt;
  DateTime? get submittedAt => _$this._submittedAt;
  set submittedAt(DateTime? submittedAt) => _$this._submittedAt = submittedAt;

  PackagePromotionOrderPageItemsInnerBuilder() {
    PackagePromotionOrderPageItemsInner._defaults(this);
  }

  PackagePromotionOrderPageItemsInnerBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _status = $v.status;
      _packagePromotionDiscountRpSnapshot =
          $v.packagePromotionDiscountRpSnapshot;
      _promotionalPriceRpSnapshot = $v.promotionalPriceRpSnapshot;
      _voucherDiscountRpSnapshot = $v.voucherDiscountRpSnapshot;
      _priceAfterDiscountRpSnapshot = $v.priceAfterDiscountRpSnapshot;
      _submittedAt = $v.submittedAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PackagePromotionOrderPageItemsInner other) {
    _$v = other as _$PackagePromotionOrderPageItemsInner;
  }

  @override
  void update(
    void Function(PackagePromotionOrderPageItemsInnerBuilder)? updates,
  ) {
    if (updates != null) updates(this);
  }

  @override
  PackagePromotionOrderPageItemsInner build() => _build();

  _$PackagePromotionOrderPageItemsInner _build() {
    final _$result =
        _$v ??
        _$PackagePromotionOrderPageItemsInner._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'PackagePromotionOrderPageItemsInner',
            'id',
          ),
          status: BuiltValueNullFieldError.checkNotNull(
            status,
            r'PackagePromotionOrderPageItemsInner',
            'status',
          ),
          packagePromotionDiscountRpSnapshot:
              packagePromotionDiscountRpSnapshot,
          promotionalPriceRpSnapshot: promotionalPriceRpSnapshot,
          voucherDiscountRpSnapshot: voucherDiscountRpSnapshot,
          priceAfterDiscountRpSnapshot: priceAfterDiscountRpSnapshot,
          submittedAt: BuiltValueNullFieldError.checkNotNull(
            submittedAt,
            r'PackagePromotionOrderPageItemsInner',
            'submittedAt',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
