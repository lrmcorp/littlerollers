// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'voucher_redemption.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$VoucherRedemption extends VoucherRedemption {
  @override
  final String id;
  @override
  final PublicScheduleSummaryInstructor customer;
  @override
  final JsonObject purchase;
  @override
  final int discountRp;
  @override
  final DateTime redeemedAt;
  @override
  final DateTime? releasedAt;

  factory _$VoucherRedemption([
    void Function(VoucherRedemptionBuilder)? updates,
  ]) => (VoucherRedemptionBuilder()..update(updates))._build();

  _$VoucherRedemption._({
    required this.id,
    required this.customer,
    required this.purchase,
    required this.discountRp,
    required this.redeemedAt,
    this.releasedAt,
  }) : super._();
  @override
  VoucherRedemption rebuild(void Function(VoucherRedemptionBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  VoucherRedemptionBuilder toBuilder() =>
      VoucherRedemptionBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is VoucherRedemption &&
        id == other.id &&
        customer == other.customer &&
        purchase == other.purchase &&
        discountRp == other.discountRp &&
        redeemedAt == other.redeemedAt &&
        releasedAt == other.releasedAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, customer.hashCode);
    _$hash = $jc(_$hash, purchase.hashCode);
    _$hash = $jc(_$hash, discountRp.hashCode);
    _$hash = $jc(_$hash, redeemedAt.hashCode);
    _$hash = $jc(_$hash, releasedAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'VoucherRedemption')
          ..add('id', id)
          ..add('customer', customer)
          ..add('purchase', purchase)
          ..add('discountRp', discountRp)
          ..add('redeemedAt', redeemedAt)
          ..add('releasedAt', releasedAt))
        .toString();
  }
}

class VoucherRedemptionBuilder
    implements Builder<VoucherRedemption, VoucherRedemptionBuilder> {
  _$VoucherRedemption? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  PublicScheduleSummaryInstructorBuilder? _customer;
  PublicScheduleSummaryInstructorBuilder get customer =>
      _$this._customer ??= PublicScheduleSummaryInstructorBuilder();
  set customer(PublicScheduleSummaryInstructorBuilder? customer) =>
      _$this._customer = customer;

  JsonObject? _purchase;
  JsonObject? get purchase => _$this._purchase;
  set purchase(JsonObject? purchase) => _$this._purchase = purchase;

  int? _discountRp;
  int? get discountRp => _$this._discountRp;
  set discountRp(int? discountRp) => _$this._discountRp = discountRp;

  DateTime? _redeemedAt;
  DateTime? get redeemedAt => _$this._redeemedAt;
  set redeemedAt(DateTime? redeemedAt) => _$this._redeemedAt = redeemedAt;

  DateTime? _releasedAt;
  DateTime? get releasedAt => _$this._releasedAt;
  set releasedAt(DateTime? releasedAt) => _$this._releasedAt = releasedAt;

  VoucherRedemptionBuilder() {
    VoucherRedemption._defaults(this);
  }

  VoucherRedemptionBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _customer = $v.customer.toBuilder();
      _purchase = $v.purchase;
      _discountRp = $v.discountRp;
      _redeemedAt = $v.redeemedAt;
      _releasedAt = $v.releasedAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(VoucherRedemption other) {
    _$v = other as _$VoucherRedemption;
  }

  @override
  void update(void Function(VoucherRedemptionBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  VoucherRedemption build() => _build();

  _$VoucherRedemption _build() {
    _$VoucherRedemption _$result;
    try {
      _$result =
          _$v ??
          _$VoucherRedemption._(
            id: BuiltValueNullFieldError.checkNotNull(
              id,
              r'VoucherRedemption',
              'id',
            ),
            customer: customer.build(),
            purchase: BuiltValueNullFieldError.checkNotNull(
              purchase,
              r'VoucherRedemption',
              'purchase',
            ),
            discountRp: BuiltValueNullFieldError.checkNotNull(
              discountRp,
              r'VoucherRedemption',
              'discountRp',
            ),
            redeemedAt: BuiltValueNullFieldError.checkNotNull(
              redeemedAt,
              r'VoucherRedemption',
              'redeemedAt',
            ),
            releasedAt: releasedAt,
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'customer';
        customer.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
          r'VoucherRedemption',
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
