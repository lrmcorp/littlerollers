// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_promotion.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const OrderPromotionDiscountTypeEnum
_$orderPromotionDiscountTypeEnum_PERCENTAGE =
    const OrderPromotionDiscountTypeEnum._('PERCENTAGE');
const OrderPromotionDiscountTypeEnum
_$orderPromotionDiscountTypeEnum_FIXED_AMOUNT =
    const OrderPromotionDiscountTypeEnum._('FIXED_AMOUNT');

OrderPromotionDiscountTypeEnum _$orderPromotionDiscountTypeEnumValueOf(
  String name,
) {
  switch (name) {
    case 'PERCENTAGE':
      return _$orderPromotionDiscountTypeEnum_PERCENTAGE;
    case 'FIXED_AMOUNT':
      return _$orderPromotionDiscountTypeEnum_FIXED_AMOUNT;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<OrderPromotionDiscountTypeEnum>
_$orderPromotionDiscountTypeEnumValues =
    BuiltSet<OrderPromotionDiscountTypeEnum>(
      const <OrderPromotionDiscountTypeEnum>[
        _$orderPromotionDiscountTypeEnum_PERCENTAGE,
        _$orderPromotionDiscountTypeEnum_FIXED_AMOUNT,
      ],
    );

Serializer<OrderPromotionDiscountTypeEnum>
_$orderPromotionDiscountTypeEnumSerializer =
    _$OrderPromotionDiscountTypeEnumSerializer();

class _$OrderPromotionDiscountTypeEnumSerializer
    implements PrimitiveSerializer<OrderPromotionDiscountTypeEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'PERCENTAGE': 'PERCENTAGE',
    'FIXED_AMOUNT': 'FIXED_AMOUNT',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'PERCENTAGE': 'PERCENTAGE',
    'FIXED_AMOUNT': 'FIXED_AMOUNT',
  };

  @override
  final Iterable<Type> types = const <Type>[OrderPromotionDiscountTypeEnum];
  @override
  final String wireName = 'OrderPromotionDiscountTypeEnum';

  @override
  Object serialize(
    Serializers serializers,
    OrderPromotionDiscountTypeEnum object, {
    FullType specifiedType = FullType.unspecified,
  }) => _toWire[object.name] ?? object.name;

  @override
  OrderPromotionDiscountTypeEnum deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) => OrderPromotionDiscountTypeEnum.valueOf(
    _fromWire[serialized] ?? (serialized is String ? serialized : ''),
  );
}

class _$OrderPromotion extends OrderPromotion {
  @override
  final String id;
  @override
  final String name;
  @override
  final OrderPromotionDiscountTypeEnum discountType;
  @override
  final int discountValue;
  @override
  final int discountRp;

  factory _$OrderPromotion([void Function(OrderPromotionBuilder)? updates]) =>
      (OrderPromotionBuilder()..update(updates))._build();

  _$OrderPromotion._({
    required this.id,
    required this.name,
    required this.discountType,
    required this.discountValue,
    required this.discountRp,
  }) : super._();
  @override
  OrderPromotion rebuild(void Function(OrderPromotionBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  OrderPromotionBuilder toBuilder() => OrderPromotionBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is OrderPromotion &&
        id == other.id &&
        name == other.name &&
        discountType == other.discountType &&
        discountValue == other.discountValue &&
        discountRp == other.discountRp;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, discountType.hashCode);
    _$hash = $jc(_$hash, discountValue.hashCode);
    _$hash = $jc(_$hash, discountRp.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'OrderPromotion')
          ..add('id', id)
          ..add('name', name)
          ..add('discountType', discountType)
          ..add('discountValue', discountValue)
          ..add('discountRp', discountRp))
        .toString();
  }
}

class OrderPromotionBuilder
    implements Builder<OrderPromotion, OrderPromotionBuilder> {
  _$OrderPromotion? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  OrderPromotionDiscountTypeEnum? _discountType;
  OrderPromotionDiscountTypeEnum? get discountType => _$this._discountType;
  set discountType(OrderPromotionDiscountTypeEnum? discountType) =>
      _$this._discountType = discountType;

  int? _discountValue;
  int? get discountValue => _$this._discountValue;
  set discountValue(int? discountValue) =>
      _$this._discountValue = discountValue;

  int? _discountRp;
  int? get discountRp => _$this._discountRp;
  set discountRp(int? discountRp) => _$this._discountRp = discountRp;

  OrderPromotionBuilder() {
    OrderPromotion._defaults(this);
  }

  OrderPromotionBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _name = $v.name;
      _discountType = $v.discountType;
      _discountValue = $v.discountValue;
      _discountRp = $v.discountRp;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(OrderPromotion other) {
    _$v = other as _$OrderPromotion;
  }

  @override
  void update(void Function(OrderPromotionBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  OrderPromotion build() => _build();

  _$OrderPromotion _build() {
    final _$result =
        _$v ??
        _$OrderPromotion._(
          id: BuiltValueNullFieldError.checkNotNull(
            id,
            r'OrderPromotion',
            'id',
          ),
          name: BuiltValueNullFieldError.checkNotNull(
            name,
            r'OrderPromotion',
            'name',
          ),
          discountType: BuiltValueNullFieldError.checkNotNull(
            discountType,
            r'OrderPromotion',
            'discountType',
          ),
          discountValue: BuiltValueNullFieldError.checkNotNull(
            discountValue,
            r'OrderPromotion',
            'discountValue',
          ),
          discountRp: BuiltValueNullFieldError.checkNotNull(
            discountRp,
            r'OrderPromotion',
            'discountRp',
          ),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
