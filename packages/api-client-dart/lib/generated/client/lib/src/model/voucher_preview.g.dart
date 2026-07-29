// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'voucher_preview.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const VoucherPreviewValidEnum _$voucherPreviewValidEnum_true_ =
    const VoucherPreviewValidEnum._('true_');

VoucherPreviewValidEnum _$voucherPreviewValidEnumValueOf(String name) {
  switch (name) {
    case 'true_':
      return _$voucherPreviewValidEnum_true_;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<VoucherPreviewValidEnum> _$voucherPreviewValidEnumValues =
    BuiltSet<VoucherPreviewValidEnum>(const <VoucherPreviewValidEnum>[
      _$voucherPreviewValidEnum_true_,
    ]);

Serializer<VoucherPreviewValidEnum> _$voucherPreviewValidEnumSerializer =
    _$VoucherPreviewValidEnumSerializer();

class _$VoucherPreviewValidEnumSerializer
    implements PrimitiveSerializer<VoucherPreviewValidEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'true_': 'true',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'true': 'true_',
  };

  @override
  final Iterable<Type> types = const <Type>[VoucherPreviewValidEnum];
  @override
  final String wireName = 'VoucherPreviewValidEnum';

  @override
  Object serialize(
    Serializers serializers,
    VoucherPreviewValidEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  VoucherPreviewValidEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => VoucherPreviewValidEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$VoucherPreview extends VoucherPreview {
  @override
  final VoucherPreviewValidEnum valid;
  @override
  final String voucherId;
  @override
  final String code;
  @override
  final int packagePriceRp;
  @override
  final int packagePromotionDiscountRp;
  @override
  final int promotionalPriceRp;
  @override
  final int baseAmountRp;
  @override
  final int discountRp;
  @override
  final int priceAfterDiscountRp;

  factory _$VoucherPreview([void Function(VoucherPreviewBuilder)? updates]) =>
      (VoucherPreviewBuilder()..update(updates))._build();

  _$VoucherPreview._({
    required this.valid,
    required this.voucherId,
    required this.code,
    required this.packagePriceRp,
    required this.packagePromotionDiscountRp,
    required this.promotionalPriceRp,
    required this.baseAmountRp,
    required this.discountRp,
    required this.priceAfterDiscountRp,
  }) : super._();
  @override
  VoucherPreview rebuild(void Function(VoucherPreviewBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  VoucherPreviewBuilder toBuilder() => VoucherPreviewBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is VoucherPreview &&
        valid == other.valid &&
        voucherId == other.voucherId &&
        code == other.code &&
        packagePriceRp == other.packagePriceRp &&
        packagePromotionDiscountRp == other.packagePromotionDiscountRp &&
        promotionalPriceRp == other.promotionalPriceRp &&
        baseAmountRp == other.baseAmountRp &&
        discountRp == other.discountRp &&
        priceAfterDiscountRp == other.priceAfterDiscountRp;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, valid.hashCode);
    _$hash = $jc(_$hash, voucherId.hashCode);
    _$hash = $jc(_$hash, code.hashCode);
    _$hash = $jc(_$hash, packagePriceRp.hashCode);
    _$hash = $jc(_$hash, packagePromotionDiscountRp.hashCode);
    _$hash = $jc(_$hash, promotionalPriceRp.hashCode);
    _$hash = $jc(_$hash, baseAmountRp.hashCode);
    _$hash = $jc(_$hash, discountRp.hashCode);
    _$hash = $jc(_$hash, priceAfterDiscountRp.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'VoucherPreview')
          ..add('valid', valid)
          ..add('voucherId', voucherId)
          ..add('code', code)
          ..add('packagePriceRp', packagePriceRp)
          ..add('packagePromotionDiscountRp', packagePromotionDiscountRp)
          ..add('promotionalPriceRp', promotionalPriceRp)
          ..add('baseAmountRp', baseAmountRp)
          ..add('discountRp', discountRp)
          ..add('priceAfterDiscountRp', priceAfterDiscountRp))
        .toString();
  }
}

class VoucherPreviewBuilder
    implements Builder<VoucherPreview, VoucherPreviewBuilder> {
  _$VoucherPreview? _$v;

  VoucherPreviewValidEnum? _valid;
  VoucherPreviewValidEnum? get valid => _$this._valid;
  set valid(VoucherPreviewValidEnum? valid) => _$this._valid = valid;

  String? _voucherId;
  String? get voucherId => _$this._voucherId;
  set voucherId(String? voucherId) => _$this._voucherId = voucherId;

  String? _code;
  String? get code => _$this._code;
  set code(String? code) => _$this._code = code;

  int? _packagePriceRp;
  int? get packagePriceRp => _$this._packagePriceRp;
  set packagePriceRp(int? packagePriceRp) =>
      _$this._packagePriceRp = packagePriceRp;

  int? _packagePromotionDiscountRp;
  int? get packagePromotionDiscountRp => _$this._packagePromotionDiscountRp;
  set packagePromotionDiscountRp(int? packagePromotionDiscountRp) =>
      _$this._packagePromotionDiscountRp = packagePromotionDiscountRp;

  int? _promotionalPriceRp;
  int? get promotionalPriceRp => _$this._promotionalPriceRp;
  set promotionalPriceRp(int? promotionalPriceRp) =>
      _$this._promotionalPriceRp = promotionalPriceRp;

  int? _baseAmountRp;
  int? get baseAmountRp => _$this._baseAmountRp;
  set baseAmountRp(int? baseAmountRp) => _$this._baseAmountRp = baseAmountRp;

  int? _discountRp;
  int? get discountRp => _$this._discountRp;
  set discountRp(int? discountRp) => _$this._discountRp = discountRp;

  int? _priceAfterDiscountRp;
  int? get priceAfterDiscountRp => _$this._priceAfterDiscountRp;
  set priceAfterDiscountRp(int? priceAfterDiscountRp) =>
      _$this._priceAfterDiscountRp = priceAfterDiscountRp;

  VoucherPreviewBuilder() {
    VoucherPreview._defaults(this);
  }

  VoucherPreviewBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _valid = $v.valid;
      _voucherId = $v.voucherId;
      _code = $v.code;
      _packagePriceRp = $v.packagePriceRp;
      _packagePromotionDiscountRp = $v.packagePromotionDiscountRp;
      _promotionalPriceRp = $v.promotionalPriceRp;
      _baseAmountRp = $v.baseAmountRp;
      _discountRp = $v.discountRp;
      _priceAfterDiscountRp = $v.priceAfterDiscountRp;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(VoucherPreview other) {
    _$v = other as _$VoucherPreview;
  }

  @override
  void update(void Function(VoucherPreviewBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  VoucherPreview build() => _build();

  _$VoucherPreview _build() {
    final _$result =
        _$v ??
        _$VoucherPreview._(
          valid: BuiltValueNullFieldError.checkNotNull(
            valid,
            r'VoucherPreview',
            'valid',
          ),
          voucherId: BuiltValueNullFieldError.checkNotNull(
            voucherId,
            r'VoucherPreview',
            'voucherId',
          ),
          code: BuiltValueNullFieldError.checkNotNull(
            code,
            r'VoucherPreview',
            'code',
          ),
          packagePriceRp: BuiltValueNullFieldError.checkNotNull(
            packagePriceRp,
            r'VoucherPreview',
            'packagePriceRp',
          ),
          packagePromotionDiscountRp: BuiltValueNullFieldError.checkNotNull(
            packagePromotionDiscountRp,
            r'VoucherPreview',
            'packagePromotionDiscountRp',
          ),
          promotionalPriceRp: BuiltValueNullFieldError.checkNotNull(
            promotionalPriceRp,
            r'VoucherPreview',
            'promotionalPriceRp',
          ),
          baseAmountRp: BuiltValueNullFieldError.checkNotNull(
            baseAmountRp,
            r'VoucherPreview',
            'baseAmountRp',
          ),
          discountRp: BuiltValueNullFieldError.checkNotNull(
            discountRp,
            r'VoucherPreview',
            'discountRp',
          ),
          priceAfterDiscountRp: BuiltValueNullFieldError.checkNotNull(
            priceAfterDiscountRp,
            r'VoucherPreview',
            'priceAfterDiscountRp',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
